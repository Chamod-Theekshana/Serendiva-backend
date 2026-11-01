import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { publicCache } from '@/plugins/http-cache'
import { errorResponses } from '@/lib/schemas'
import { SitemapDataSchema } from './sitemap.schemas'
import { createSitemapService } from './sitemap.service'

/** GET /api/v1/sitemap-data — every published slug with its last change, for the Next.js sitemap */
export const sitemapPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createSitemapService(app.deps)

  app.get(
    '/sitemap-data',
    {
      config: publicCache,
      schema: {
        tags: ['Content'],
        summary: 'Published tour, destination and blog slugs with updatedAt (for sitemap.xml)',
        response: { 200: SitemapDataSchema, ...errorResponses },
      },
    },
    async () => service.data(),
  )
}
