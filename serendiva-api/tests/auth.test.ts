import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdmin } from './factories'
import {
  ADMIN,
  applySetCookies,
  buildTestApp,
  login,
  nextIp,
  type Cookies,
  type ErrorBody,
  type TestContext,
} from './helpers'

let ctx: TestContext

beforeAll(async () => {
  ctx = await buildTestApp()
})
afterAll(async () => {
  await ctx.close()
})
beforeEach(async () => {
  // Every test starts with one fresh admin and no sessions.
  await ctx.app.deps.prisma.refreshToken.deleteMany()
  await ctx.app.deps.prisma.adminUser.deleteMany()
  await createAdmin(ctx.app.deps.prisma)
})

const LOGIN = '/api/v1/admin/auth/login'
const REFRESH = '/api/v1/admin/auth/refresh'
const LOGOUT = '/api/v1/admin/auth/logout'
const ME = '/api/v1/admin/auth/me'
const UPDATE_PROFILE = '/api/v1/admin/auth/profile'
const CHANGE_PASSWORD = '/api/v1/admin/auth/change-password'

type CookieInfo = { name: string; value: string; path?: string; httpOnly?: boolean; secure?: boolean; sameSite?: string; domain?: string; maxAge?: number }

const attempt = (password: string, email: string = ADMIN.email) =>
  ctx.app.inject({ method: 'POST', url: LOGIN, payload: { email, password }, remoteAddress: nextIp() })

const refresh = (cookies: Cookies) => ctx.app.inject({ method: 'POST', url: REFRESH, cookies, remoteAddress: nextIp() })

describe('POST /auth/login', () => {
  it('signs in and sets httpOnly session cookies', async () => {
    const res = await attempt(ADMIN.password, '  ADMIN@serendiva.test ')
    expect(res.statusCode).toBe(200)
    const body = res.json<{ user: { id: string; email: string; name: string; lastLoginAt: string | null }; accessTokenExpiresAt: string }>()
    expect(body.user).toMatchObject({ email: ADMIN.email, name: ADMIN.name })
    expect(body.user.lastLoginAt).not.toBeNull()
    expect(new Date(body.accessTokenExpiresAt).getTime()).toBeGreaterThan(Date.now() + 14 * 60_000)
    expect(res.body).not.toMatch(/passwordHash|\$argon2/)

    const cookies = res.cookies as CookieInfo[]
    const byName = Object.fromEntries(cookies.map((c) => [c.name, c]))
    expect(byName.sd_access).toMatchObject({ httpOnly: true, path: '/', sameSite: 'Lax' })
    expect(byName.sd_refresh).toMatchObject({ httpOnly: true, path: '/api/v1/admin/auth', sameSite: 'Lax' })
    expect(byName.sd_session).toMatchObject({ value: '1', path: '/' })
    // COOKIE_SECURE=auto -> Secure only in production
    expect(byName.sd_access?.secure).toBeFalsy()

    // Only an HMAC of the refresh token is stored
    const stored = await ctx.app.deps.prisma.refreshToken.findMany()
    expect(stored).toHaveLength(1)
    expect(stored[0]?.tokenHash).not.toBe(byName.sd_refresh?.value)
  })

  it('rejects a wrong password and an unknown email with the same message', async () => {
    const wrong = await attempt('not-the-password')
    const unknown = await attempt(ADMIN.password, 'nobody@serendiva.test')
    for (const res of [wrong, unknown]) {
      expect(res.statusCode).toBe(401)
      expect(res.json<ErrorBody>().error).toEqual({ code: 'UNAUTHORIZED', message: 'Invalid email or password' })
      expect(res.cookies).toHaveLength(0)
    }
  })

  it('validates the body', async () => {
    const res = await ctx.app.inject({ method: 'POST', url: LOGIN, payload: { email: 'not-an-email' }, remoteAddress: nextIp() })
    expect(res.statusCode).toBe(400)
    const err = res.json<ErrorBody>().error
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.details?.map((d) => d.path)).toEqual(expect.arrayContaining(['email', 'password']))
  })

  it('locks the account after 5 failed attempts (even for the right password)', async () => {
    for (let i = 0; i < 5; i++) expect((await attempt(`wrong-${i}`)).statusCode).toBe(401)

    const locked = await attempt(ADMIN.password)
    expect(locked.statusCode).toBe(429)
    expect(locked.json<ErrorBody>().error.code).toBe('ACCOUNT_LOCKED')
    expect(locked.json<ErrorBody>().error.message).toMatch(/Try again in 15 minute/)

    const user = await ctx.app.deps.prisma.adminUser.findUniqueOrThrow({ where: { email: ADMIN.email } })
    expect(user.failedLoginCount).toBe(5)
    const lockMinutes = ((user.lockedUntil?.getTime() ?? 0) - Date.now()) / 60_000
    expect(lockMinutes).toBeGreaterThan(14)
    expect(lockMinutes).toBeLessThanOrEqual(15)

    // Once the lock has expired the right password works and the counter resets.
    await ctx.app.deps.prisma.adminUser.update({ where: { id: user.id }, data: { lockedUntil: new Date(Date.now() - 1000) } })
    expect((await attempt(ADMIN.password)).statusCode).toBe(200)
    const after = await ctx.app.deps.prisma.adminUser.findUniqueOrThrow({ where: { id: user.id } })
    expect(after.failedLoginCount).toBe(0)
    expect(after.lockedUntil).toBeNull()
  })

  it('a successful login resets the failure counter', async () => {
    await attempt('wrong-1')
    await attempt('wrong-2')
    expect((await attempt(ADMIN.password)).statusCode).toBe(200)
    const user = await ctx.app.deps.prisma.adminUser.findUniqueOrThrow({ where: { email: ADMIN.email } })
    expect(user.failedLoginCount).toBe(0)
  })

  it('login itself is rate limited per IP', async () => {
    const ip = '192.0.2.77'
    const statuses: number[] = []
    for (let i = 0; i < 11; i++) {
      const res = await ctx.app.inject({ method: 'POST', url: LOGIN, payload: { email: 'x@serendiva.test', password: 'x' }, remoteAddress: ip })
      statuses.push(res.statusCode)
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true)
    expect(statuses[10]).toBe(429)
  })
})

describe('GET /auth/me', () => {
  it('returns the current admin with the access cookie or a Bearer token', async () => {
    const session = await login(ctx.app)
    const res = await ctx.app.inject({ method: 'GET', url: ME, cookies: session.cookies })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ email: ADMIN.email, name: ADMIN.name })

    const bearer = await ctx.app.inject({ method: 'GET', url: ME, headers: { authorization: `Bearer ${session.cookies.sd_access}` } })
    expect(bearer.statusCode).toBe(200)
  })

  it('401 without a session or with a forged token', async () => {
    expect((await ctx.app.inject({ method: 'GET', url: ME })).statusCode).toBe(401)
    const forged = ctx.app.jwt.sign({ sub: 'x', email: 'x', name: 'x', typ: 'access' }, { key: 'another-secret-another-secret-another-secret' })
    const res = await ctx.app.inject({ method: 'GET', url: ME, cookies: { sd_access: forged } })
    expect(res.statusCode).toBe(401)
    expect(res.json<ErrorBody>().error.code).toBe('UNAUTHORIZED')
  })
})

describe('PUT /auth/profile', () => {
  it('updates the signed-in admin name and email', async () => {
    const session = await login(ctx.app)
    const res = await ctx.app.inject({
      method: 'PUT',
      url: UPDATE_PROFILE,
      cookies: session.cookies,
      payload: { name: 'Updated Admin', email: 'updated@serendiva.test' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ email: 'updated@serendiva.test', name: 'Updated Admin' })
    expect(await ctx.app.deps.prisma.adminUser.findUnique({ where: { email: 'updated@serendiva.test' } })).toMatchObject({
      name: 'Updated Admin',
    })
    expect((await attempt(ADMIN.password)).statusCode).toBe(401)
    expect((await attempt(ADMIN.password, 'updated@serendiva.test')).statusCode).toBe(200)
  })

  it('requires a session and validates the profile details', async () => {
    expect(
      (
        await ctx.app.inject({
          method: 'PUT',
          url: UPDATE_PROFILE,
          payload: { name: '', email: 'not-an-email' },
        })
      ).statusCode,
    ).toBe(401)

    const session = await login(ctx.app)
    const invalid = await ctx.app.inject({
      method: 'PUT',
      url: UPDATE_PROFILE,
      cookies: session.cookies,
      payload: { name: '', email: 'not-an-email' },
    })
    expect(invalid.statusCode).toBe(400)
    expect(invalid.json<ErrorBody>().error.details?.map((d) => d.path)).toEqual(expect.arrayContaining(['name', 'email']))
  })
})

describe('POST /auth/refresh', () => {
  it('rotates the refresh token and issues a new access token', async () => {
    const first = await login(ctx.app)
    const res = await refresh(first.cookies)
    expect(res.statusCode).toBe(200)
    const second = applySetCookies(first.cookies, res)
    expect(second.sd_refresh).toBeDefined()
    expect(second.sd_refresh).not.toBe(first.cookies.sd_refresh)
    expect(second.sd_access).toBeDefined()

    const tokens = await ctx.app.deps.prisma.refreshToken.findMany({ orderBy: { createdAt: 'asc' } })
    expect(tokens).toHaveLength(2)
    expect(tokens[0]?.revokedAt).not.toBeNull()
    expect(tokens[0]?.replacedBy).toBe(tokens[1]?.id)
    expect(tokens[1]?.revokedAt).toBeNull()
    expect(tokens[0]?.family).toBe(tokens[1]?.family)

    // The new token keeps working
    expect((await refresh(second)).statusCode).toBe(200)
  })

  it('reuse of a rotated token revokes the whole family', async () => {
    const first = await login(ctx.app)
    const rotated = applySetCookies(first.cookies, await refresh(first.cookies))

    // Attacker replays the old token
    const replay = await refresh(first.cookies)
    expect(replay.statusCode).toBe(401)
    // ... and the session cookies are cleared in that response
    expect(applySetCookies(first.cookies, replay).sd_refresh).toBeUndefined()

    // The legitimate (newest) token has been revoked too
    expect((await refresh(rotated)).statusCode).toBe(401)
    const active = await ctx.app.deps.prisma.refreshToken.count({ where: { revokedAt: null } })
    expect(active).toBe(0)
  })

  it('a second login (other device) is a separate family and is not affected', async () => {
    const deviceA = await login(ctx.app)
    const deviceB = await login(ctx.app)
    await refresh(deviceA.cookies)
    await refresh(deviceA.cookies) // reuse -> kills family A only
    expect((await refresh(deviceB.cookies)).statusCode).toBe(200)
  })

  it('401 without a refresh cookie or with an unknown or expired token', async () => {
    expect((await refresh({})).statusCode).toBe(401)
    expect((await refresh({ sd_refresh: 'made-up' })).statusCode).toBe(401)

    const session = await login(ctx.app)
    await ctx.app.deps.prisma.refreshToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } })
    const expired = await refresh(session.cookies)
    expect(expired.statusCode).toBe(401)
    expect(expired.json<ErrorBody>().error.code).toBe('UNAUTHORIZED')
  })
})

describe('POST /auth/logout', () => {
  it('revokes the session and clears the cookies', async () => {
    const session = await login(ctx.app)
    const res = await ctx.app.inject({ method: 'POST', url: LOGOUT, cookies: session.cookies })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ ok: true })
    const jar = applySetCookies(session.cookies, res)
    expect(jar.sd_access).toBeUndefined()
    expect(jar.sd_refresh).toBeUndefined()
    expect(jar.sd_session).toBeUndefined()

    expect((await refresh(session.cookies)).statusCode).toBe(401)
  })

  it('is safe to call without a session', async () => {
    const res = await ctx.app.inject({ method: 'POST', url: LOGOUT })
    expect(res.statusCode).toBe(200)
  })
})

describe('POST /auth/change-password', () => {
  const NEW_PASSWORD = 'Brand-New-Password-42'

  it('changes the password and signs out other devices', async () => {
    const current = await login(ctx.app)
    const other = await login(ctx.app)

    const res = await ctx.app.inject({
      method: 'POST',
      url: CHANGE_PASSWORD,
      cookies: current.cookies,
      payload: { currentPassword: ADMIN.password, newPassword: NEW_PASSWORD },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ ok: true })

    expect((await attempt(ADMIN.password)).statusCode).toBe(401)
    expect((await attempt(NEW_PASSWORD)).statusCode).toBe(200)
    // The other device's refresh token is revoked, the current one still works.
    expect((await refresh(other.cookies)).statusCode).toBe(401)
    expect((await refresh(current.cookies)).statusCode).toBe(200)
  })

  it('rejects a wrong current password and a weak new password', async () => {
    const session = await login(ctx.app)
    const wrong = await ctx.app.inject({
      method: 'POST',
      url: CHANGE_PASSWORD,
      cookies: session.cookies,
      payload: { currentPassword: 'nope', newPassword: NEW_PASSWORD },
    })
    expect(wrong.statusCode).toBe(400)
    expect(wrong.json<ErrorBody>().error.details).toEqual([{ path: 'currentPassword', message: 'Current password is incorrect' }])

    const weak = await ctx.app.inject({
      method: 'POST',
      url: CHANGE_PASSWORD,
      cookies: session.cookies,
      payload: { currentPassword: ADMIN.password, newPassword: 'short' },
    })
    expect(weak.statusCode).toBe(400)
    expect(weak.json<ErrorBody>().error.details?.[0]?.path).toBe('newPassword')
  })

  it('requires a session', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: CHANGE_PASSWORD,
      payload: { currentPassword: ADMIN.password, newPassword: NEW_PASSWORD },
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('cookie settings for cross-domain deployments', () => {
  it('COOKIE_SAMESITE=none + COOKIE_DOMAIN produce Secure, SameSite=None, domain cookies', async () => {
    const cross = await buildTestApp({ COOKIE_SECURE: 'true', COOKIE_SAMESITE: 'none', COOKIE_DOMAIN: '.serendiva.test' })
    try {
      const res = await cross.app.inject({
        method: 'POST',
        url: LOGIN,
        payload: { email: ADMIN.email, password: ADMIN.password },
        remoteAddress: nextIp(),
      })
      expect(res.statusCode).toBe(200)
      for (const c of res.cookies as CookieInfo[]) {
        expect(c).toMatchObject({ secure: true, sameSite: 'None', domain: '.serendiva.test' })
      }
    } finally {
      await cross.close()
    }
  })
})
