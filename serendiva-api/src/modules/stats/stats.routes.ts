import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { adminErrorResponses } from '@/lib/schemas'
import { AdminStatsSchema } from './stats.schemas'
import { createStatsService } from './stats.service'

/** GET /api/v1/admin/stats */
export const statsAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createStatsService(app.deps)
  app.addHook('onRequest', app.authenticate)

  app.get(
    '/stats',
    {
      schema: {
        tags: ['Admin · Leads'],
        security: [{ cookieAuth: [] }],
        summary: 'Dashboard numbers: inquiries (status, week/month, by month, country, tour, source), proposals, reviews, newsletter',
        response: { 200: AdminStatsSchema, ...adminErrorResponses },
      },
    },
    async () => service.dashboard(),
  )
}
