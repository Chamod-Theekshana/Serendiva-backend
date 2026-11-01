import { z } from 'zod'
import { LOCALES } from '@/lib/i18n'

const SitemapEntry = z.object({ slug: z.string(), updatedAt: z.string() })

export const SitemapDataSchema = z
  .object({
    locales: z.array(z.enum(LOCALES)),
    tours: z.array(SitemapEntry),
    destinations: z.array(SitemapEntry),
    blog: z.array(SitemapEntry),
    generatedAt: z.string(),
  })
  .meta({ id: 'SitemapData' })

export type SitemapData = z.infer<typeof SitemapDataSchema>
