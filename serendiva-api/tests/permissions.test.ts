import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from '@/app'
import { createAdmin } from './factories'
import { buildTestApp, login, type ErrorBody, type TestContext } from './helpers'

let ctx: TestContext

interface RegisteredRoute {
  method: string
  url: string
}

/**
 * Every route actually registered on the server, read from Fastify's router tree
 * (`printRoutes({ commonPrefix: false })`). Unlike the OpenAPI document this also includes routes
 * hidden from the docs, so a new admin route can never slip through without a guard.
 */
function registeredRoutes(app: App): RegisteredRoute[] {
  const tree = app.printRoutes({ commonPrefix: false })
  const stack: string[] = []
  const routes: RegisteredRoute[] = []
  for (const line of tree.split('\n')) {
    const m = line.match(/^((?:│ {3}| {4})*)(?:├── |└── )(.+?)(?: \(([A-Z, ]+)\))?$/)
    if (!m) continue
    const depth = (m[1] ?? '').length / 4
    const url = (depth > 0 ? (stack[depth - 1] ?? '') : '') + (m[2] ?? '')
    stack.length = depth
    stack[depth] = url
    for (const method of m[3]?.split(', ') ?? []) routes.push({ method, url })
  }
  return routes
}

/** Public by design: they establish or end a session. */
const PUBLIC_AUTH = new Set(['/api/v1/admin/auth/login', '/api/v1/admin/auth/refresh', '/api/v1/admin/auth/logout'])

let adminRoutes: RegisteredRoute[] = []

beforeAll(async () => {
  ctx = await buildTestApp()
  adminRoutes = registeredRoutes(ctx.app).filter(
    (r) => r.url.startsWith('/api/v1/admin/') && !PUBLIC_AUTH.has(r.url) && r.method !== 'OPTIONS',
  )
})
afterAll(async () => {
  await ctx.close()
})

const fill = (url: string) => url.replace(/:(\w+)/g, (_m, name: string) => (name === 'id' ? 'cltestid0000000000000000' : `test-${name}`))

describe('admin route protection', () => {
  it('finds every admin route (sanity check of the route discovery)', () => {
    const keys = adminRoutes.map((r) => `${r.method} ${r.url}`)
    expect(keys).toEqual(
      expect.arrayContaining([
        'GET /api/v1/admin/auth/me',
        'POST /api/v1/admin/tours',
        'PATCH /api/v1/admin/tours/order',
        'DELETE /api/v1/admin/media/:id',
        'GET /api/v1/admin/proposals/:id/attachment',
        'GET /api/v1/admin/inquiries/export.csv',
        'PUT /api/v1/admin/settings/:key', // hidden from the docs, still protected
        'GET /api/v1/admin/stats',
      ]),
    )
    expect(adminRoutes.length).toBeGreaterThan(100)

    // Every documented admin operation is among the registered routes.
    const spec = ctx.app.swagger() as { paths: Record<string, Record<string, unknown>> }
    for (const [p, ops] of Object.entries(spec.paths)) {
      if (!p.startsWith('/api/v1/admin/') || PUBLIC_AUTH.has(p)) continue
      for (const method of Object.keys(ops)) {
        const url = p.replace(/\{(\w+)\}/g, ':$1')
        expect(keys, `${method} ${p}`).toContain(`${method.toUpperCase()} ${url}`)
      }
    }
  })

  it('every admin route answers 401 without a session', async () => {
    const failures: string[] = []
    for (const r of adminRoutes) {
      const res = await ctx.app.inject({
        method: r.method as 'GET',
        url: fill(r.url),
        ...(['POST', 'PUT', 'PATCH'].includes(r.method) ? { payload: {} } : {}),
      })
      if (res.statusCode !== 401) failures.push(`${r.method} ${r.url} -> ${res.statusCode}`)
      else if (r.method !== 'HEAD') expect(res.json<ErrorBody>().error.code).toBe('UNAUTHORIZED')
    }
    expect(failures).toEqual([])
  })

  it('every admin route answers 401 with a forged or malformed token', async () => {
    const forged = ctx.app.jwt.sign(
      { sub: 'attacker', email: 'a@evil.example', name: 'A', typ: 'access' },
      { key: 'not-the-server-secret-not-the-server-secret' },
    )
    const failures: string[] = []
    for (const r of adminRoutes.filter((x) => x.method === 'GET')) {
      for (const cookies of [{ sd_access: forged }, { sd_access: 'garbage' }]) {
        const res = await ctx.app.inject({ method: 'GET', url: fill(r.url), cookies })
        if (res.statusCode !== 401) failures.push(`${r.url} -> ${res.statusCode}`)
      }
    }
    expect(failures).toEqual([])
  })

  it('documents cookie auth on every protected admin operation', () => {
    const spec = ctx.app.swagger() as { paths: Record<string, Record<string, { security?: unknown[] }>> }
    const missing: string[] = []
    for (const [p, ops] of Object.entries(spec.paths)) {
      if (!p.startsWith('/api/v1/admin/') || PUBLIC_AUTH.has(p)) continue
      for (const [method, op] of Object.entries(ops)) if (!op.security?.length) missing.push(`${method} ${p}`)
    }
    expect(missing).toEqual([])
  })

  it('a valid session opens the admin API', async () => {
    await createAdmin(ctx.app.deps.prisma)
    const session = await login(ctx.app)
    for (const url of ['/api/v1/admin/tours', '/api/v1/admin/inquiries', '/api/v1/admin/stats', '/api/v1/admin/settings']) {
      const res = await ctx.app.inject({ method: 'GET', url, cookies: session.cookies })
      expect(res.statusCode, `${url}: ${res.body}`).toBe(200)
    }
  })
})
