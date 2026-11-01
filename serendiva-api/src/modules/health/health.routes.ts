import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const HealthSchema = z.object({ status: z.literal('ok'), uptime: z.number(), timestamp: z.string() })
const ReadySchema = z.object({ status: z.enum(['ok', 'error']), database: z.enum(['up', 'down']) })

const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    { schema: { tags: ['Health'], summary: 'Liveness probe', response: { 200: HealthSchema } } },
    async () => ({ status: 'ok' as const, uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() }),
  )

  app.get(
    '/health/ready',
    { schema: { tags: ['Health'], summary: 'Readiness probe (checks the database)', response: { 200: ReadySchema, 503: ReadySchema } } },
    async (_req, reply) => {
      try {
        await app.deps.prisma.$queryRaw`SELECT 1`
        return { status: 'ok' as const, database: 'up' as const }
      } catch {
        return reply.status(503).send({ status: 'error' as const, database: 'down' as const })
      }
    },
  )
}

export default healthRoutes
