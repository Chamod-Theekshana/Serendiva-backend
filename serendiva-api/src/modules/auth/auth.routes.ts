import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import type { FastifyReply } from 'fastify'
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_COOKIE_PATH, SESSION_COOKIE } from '@/plugins/auth'
import { adminErrorResponses, ErrorResponseSchema, OkSchema } from '@/lib/schemas'
import { AdminUserSchema, ChangePasswordBody, LoginBody, SessionSchema, UpdateProfileBody } from './auth.schemas'
import { createAuthService, type IssuedTokens } from './auth.service'

/**
 * /api/v1/admin/auth/*
 *
 * Tokens travel only in httpOnly cookies:
 *   sd_access  (JWT, path "/", ~15 min)
 *   sd_refresh (opaque, path "/api/v1/admin/auth", 30 days, rotated on every refresh)
 *   sd_session ("1", path "/", 30 days) — lets the Next.js middleware detect a session cheaply
 */
const authRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createAuthService(app.deps)
  const { env } = app.deps
  const secure = env.COOKIE_SECURE === 'auto' ? env.NODE_ENV === 'production' : env.COOKIE_SECURE === 'true'
  const base = { httpOnly: true, secure, sameSite: env.COOKIE_SAMESITE, domain: env.COOKIE_DOMAIN } as const

  function setSessionCookies(reply: FastifyReply, issued: IssuedTokens) {
    const accessToken = app.jwt.sign({ sub: issued.user.id, email: issued.user.email, name: issued.user.name, typ: 'access' })
    const accessMaxAge = env.ACCESS_TOKEN_TTL_MINUTES * 60
    const refreshMaxAge = Math.floor((issued.refreshExpiresAt.getTime() - Date.now()) / 1000)
    reply
      .setCookie(ACCESS_COOKIE, accessToken, { ...base, path: '/', maxAge: accessMaxAge })
      .setCookie(REFRESH_COOKIE, issued.refreshToken, { ...base, path: REFRESH_COOKIE_PATH, maxAge: refreshMaxAge })
      .setCookie(SESSION_COOKIE, '1', { ...base, path: '/', maxAge: refreshMaxAge })
    return new Date(Date.now() + accessMaxAge * 1000).toISOString()
  }

  function clearSessionCookies(reply: FastifyReply) {
    reply
      .clearCookie(ACCESS_COOKIE, { ...base, path: '/' })
      .clearCookie(REFRESH_COOKIE, { ...base, path: REFRESH_COOKIE_PATH })
      .clearCookie(SESSION_COOKIE, { ...base, path: '/' })
  }

  const meta = (req: { headers: Record<string, unknown>; ip: string }) => ({
    userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    ip: req.ip,
  })

  app.post(
    '/login',
    {
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
      schema: {
        tags: ['Admin · Auth'],
        summary: 'Sign in (sets httpOnly session cookies)',
        body: LoginBody,
        response: { 200: SessionSchema, 401: ErrorResponseSchema, 429: ErrorResponseSchema, 400: ErrorResponseSchema },
      },
    },
    async (req, reply) => {
      const issued = await service.login(req.body.email, req.body.password, meta(req))
      const accessTokenExpiresAt = setSessionCookies(reply, issued)
      req.log.info({ adminId: issued.user.id }, 'admin signed in')
      return { user: issued.user, accessTokenExpiresAt }
    },
  )

  app.post(
    '/refresh',
    {
      config: { rateLimit: { max: 60, timeWindow: '15 minutes' } },
      schema: {
        tags: ['Admin · Auth'],
        summary: 'Rotate the refresh token and issue a new access token',
        response: { 200: SessionSchema, 401: ErrorResponseSchema },
      },
    },
    async (req, reply) => {
      try {
        const issued = await service.refresh(req.cookies[REFRESH_COOKIE], meta(req))
        const accessTokenExpiresAt = setSessionCookies(reply, issued)
        return { user: issued.user, accessTokenExpiresAt }
      } catch (err) {
        clearSessionCookies(reply)
        throw err
      }
    },
  )

  app.post(
    '/logout',
    {
      schema: { tags: ['Admin · Auth'], summary: 'Sign out and revoke the session', response: { 200: OkSchema } },
    },
    async (req, reply) => {
      await service.logout(req.cookies[REFRESH_COOKIE])
      clearSessionCookies(reply)
      return { ok: true as const }
    },
  )

  app.get(
    '/me',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Admin · Auth'],
        summary: 'Current admin user',
        security: [{ cookieAuth: [] }],
        response: { 200: AdminUserSchema, 401: ErrorResponseSchema },
      },
    },
    async (req) => service.me(req.admin!.id),
  )

  app.put(
    '/profile',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Admin Â· Auth'],
        summary: 'Update the current admin profile',
        security: [{ cookieAuth: [] }],
        body: UpdateProfileBody,
        response: { 200: AdminUserSchema, ...adminErrorResponses },
      },
    },
    async (req) => service.updateProfile(req.admin!.id, req.body),
  )

  app.post(
    '/change-password',
    {
      onRequest: [app.authenticate],
      config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
      schema: {
        tags: ['Admin · Auth'],
        summary: 'Change password (signs out other devices)',
        security: [{ cookieAuth: [] }],
        body: ChangePasswordBody,
        response: { 200: OkSchema, ...adminErrorResponses },
      },
    },
    async (req) => {
      await service.changePassword(
        req.admin!.id,
        req.body.currentPassword,
        req.body.newPassword,
        req.cookies[REFRESH_COOKIE],
      )
      return { ok: true as const }
    },
  )
}

export default authRoutes
