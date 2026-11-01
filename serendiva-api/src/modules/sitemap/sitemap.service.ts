import type { AppDeps } from '@/types'
import { LOCALES } from '@/lib/i18n'
import { createSitemapRepository } from './sitemap.repository'
import type { SitemapData } from './sitemap.schemas'

const entries = (rows: { slug: string; updatedAt: Date }[]) =>
  rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt.toISOString() }))

export function createSitemapService(deps: AppDeps) {
  const repo = createSitemapRepository(deps.prisma)
  return {
    async data(): Promise<SitemapData> {
      const [tours, destinations, blog] = await repo.publishedSlugs()
      return {
        locales: [...LOCALES],
        tours: entries(tours),
        destinations: entries(destinations),
        blog: entries(blog),
        generatedAt: new Date().toISOString(),
      }
    },
  }
}
