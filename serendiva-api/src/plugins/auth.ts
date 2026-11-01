import fp from 'fastify-plugin'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import { unauthorized } from '@/lib/errors'

export const ACCESS_COOKIE = 'sd_access'
export const REFRESH_COOKIE = 'sd_refresh'
/** Non-secret indicator cookie so the Next.js middleware can tell "probably logged in" without the JWT secret. */
export const SESSION_COOKIE = 'sd_session'
export const REFRESH_COOKIE_PATH = '/api/v1/admin/auth'

/**
 * Registers cookie + JWT support and the `app.authenticate` guard used by every /api/v1/admin route.
 * The access token is read from the httpOnly `sd_access` cookie, or from `Authorization: Bearer <jwt>`.
 */
export default fp(async (app) => {
  const { env } = app.deps
  await app.register(cookie)
  await app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    cookie: { cookieName: ACCESS_COOKIE, signed: false },
    sign: { expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m` },
  })

  app.decorate('authenticate', async (request) => {
    try {
      const payload = await request.jwtVerify<{ sub: string; email: string; name: string; typ: 'access' }>()
      if (payload.typ !== 'access') throw new Error('wrong token type')
      request.admin = { id: payload.sub, email: payload.email, name: payload.name }
    } catch {
      throw unauthorized('Your session has expired, please sign in again')
    }
  })
})
