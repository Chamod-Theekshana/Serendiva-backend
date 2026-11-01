import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { jsonSchemaTransform, jsonSchemaTransformObject } from 'fastify-type-provider-zod'

/**
 * OpenAPI 3 document generated from the Zod route schemas.
 *   - Swagger UI:   GET /docs
 *   - Raw spec:     GET /openapi.json   (used by the Next.js app to generate its typed client)
 */
export default fp(async (app) => {
  const { env } = app.deps
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Serendiva API',
        version: '1.0.0',
        description:
          'REST API for the Serendiva private-guide website. Public endpoints are read-only (plus form submissions). ' +
          'Admin endpoints under /api/v1/admin require the httpOnly session cookie set by POST /api/v1/admin/auth/login. ' +
          'Errors always use the shape { "error": { "code", "message", "details?" } }.',
      },
      servers: [{ url: env.API_PUBLIC_URL }],
      tags: [
        { name: 'Health' },
        { name: 'Tours' },
        { name: 'Destinations' },
        { name: 'Reviews' },
        { name: 'Content' },
        { name: 'Forms' },
        { name: 'Newsletter' },
        { name: 'Admin · Auth' },
        { name: 'Admin · Content' },
        { name: 'Admin · Leads' },
        { name: 'Admin · Media' },
        { name: 'Admin · Settings' },
      ],
      components: {
        securitySchemes: {
          cookieAuth: { type: 'apiKey', in: 'cookie', name: 'sd_access' },
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true, withCredentials: true },
    staticCSP: true,
  })

  app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger())
})
