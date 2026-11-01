import { z } from 'zod'

export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
})

export const PageMetaSchema = z
  .object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
  .meta({ id: 'PageMeta' })

export type PageMeta = z.infer<typeof PageMetaSchema>

export function toSkipTake(q: { page: number; pageSize: number }) {
  return { skip: (q.page - 1) * q.pageSize, take: q.pageSize }
}

export function pageMeta(q: { page: number; pageSize: number }, total: number): PageMeta {
  return { page: q.page, pageSize: q.pageSize, total, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) }
}

/** Wrap an item schema in the standard paginated response envelope. */
export function paginated<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), meta: PageMetaSchema })
}
