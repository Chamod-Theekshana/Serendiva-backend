import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'

/**
 * helmet (security headers), strict CORS allowlist, and rate limiting.
 * Routes can tighten limits with `config: { rateLimit: { max, timeWindow } }`.
 */
export default fp(async (app) => {
  const { env } = app.deps

  await app.register(helmet, {
    // JSON API: CSP is set by Swagger UI for /docs only.
    contentSecurityPolicy: false,
    // Allow the website (other origin) to embed images served from /uploads.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })

  const allowlist = new Set([...env.CORS_ORIGINS, env.FRONTEND_URL].map((o) => o.replace(/\/$/, '')))
  await app.register(cors, {
    origin: (origin, cb) => {
      // Server-to-server calls (Next.js server components, curl) send no Origin header.
      if (!origin) return cb(null, true)
      cb(null, allowlist.has(origin.replace(/\/$/, '')))
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type', 'authorization', 'x-requested-with', 'x-request-id'],
    exposedHeaders: ['x-request-id', 'content-disposition', 'retry-after'],
    maxAge: 600,
  })

  await app.register(rateLimit, {
    global: true,
    max: env.NODE_ENV === 'test' ? 10_000 : 300,
    timeWindow: '1 minute',
    // Behind a proxy (TRUST_PROXY=1 or the proxy IPs) request.ip is the client IP from X-Forwarded-For.
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (_req, ctx) => ({
      statusCode: 429,
      error: { code: 'RATE_LIMITED', message: `Too many requests. Please try again in ${Math.ceil(ctx.ttl / 1000)} seconds.` },
    }),
  })
})
