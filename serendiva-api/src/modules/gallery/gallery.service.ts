import type { z } from 'zod'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import { compactTranslatable, trOrNull } from '@/lib/i18n'
import { toImage } from '@/lib/media-dto'
import { notFound } from '@/lib/errors'
import { Tags } from '@/lib/revalidate'
import { toAdminMediaRef } from '@/modules/shared/admin-dto'
import { captionOf, captionRecordOf } from '@/modules/shared/json-read'
import { createGalleryRepository, type AdminGalleryRow } from './gallery.repository'
import type { AdminGalleryItem, AdminGalleryQuery, GalleryBulkT, GalleryItemInputT, GalleryQuery } from './gallery.schemas'

function toAdmin(g: AdminGalleryRow): AdminGalleryItem {
  return {
    id: g.id,
    type: g.type,
    mediaId: g.mediaId,
    media: toAdminMediaRef(g.media),
    videoUrl: g.videoUrl,
    category: g.category,
    caption: captionRecordOf(g.caption),
    location: g.location,
    order: g.order,
    status: g.status,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }
}

const compactCaption = (c: GalleryItemInputT['caption']) => compactTranslatable(c) as GalleryItemInputT['caption']

export function createGalleryService(deps: AppDeps) {
  const repo = createGalleryRepository(deps.prisma)
  const revalidate = () => deps.revalidator.revalidate([Tags.gallery])

  return {
    async list(q: z.infer<typeof GalleryQuery>) {
      const all = await repo.listPublished(q.type)
      const counts = new Map<string, number>()
      for (const g of all) counts.set(g.category, (counts.get(g.category) ?? 0) + 1)
      const items = q.category ? all.filter((g) => g.category === q.category) : all
      return {
        items: items.map((g) => {
          const cap = captionOf(trOrNull(g.caption, q.locale))
          return {
            id: g.id,
            type: g.type,
            image: toImage(g.media, q.locale, cap.title ?? cap.caption ?? g.location ?? ''),
            videoUrl: g.videoUrl,
            category: g.category,
            ...cap,
            location: g.location,
          }
        }),
        categories: [...counts.entries()].map(([slug, count]) => ({ slug, count })),
      }
    },

    async adminList(q: z.infer<typeof AdminGalleryQuery>): Promise<AdminGalleryItem[]> {
      const where: Prisma.GalleryItemWhereInput = {
        ...(q.category ? { category: q.category } : {}),
        ...(q.type ? { type: q.type } : {}),
        ...(q.status ? { status: q.status } : {}),
      }
      return (await repo.adminList(where)).map(toAdmin)
    },

    async adminGet(id: string): Promise<AdminGalleryItem> {
      const g = await repo.adminFindById(id)
      if (!g) throw notFound('Gallery item')
      return toAdmin(g)
    },

    async create(input: GalleryItemInputT): Promise<AdminGalleryItem> {
      await repo.assertMedia([{ path: 'mediaId', id: input.mediaId }])
      const g = await repo.create({ ...input, caption: compactCaption(input.caption) })
      revalidate()
      return toAdmin(g)
    },

    /** Multi-upload: one gallery image per uploaded media file, appended at the end. */
    async createBulk(body: GalleryBulkT): Promise<AdminGalleryItem[]> {
      await repo.assertMedia(body.items.map((i, idx) => ({ path: `items.${idx}.mediaId`, id: i.mediaId })))
      const rows = await repo.createMany(
        body.items.map((i) => ({
          type: 'image' as const,
          mediaId: i.mediaId,
          videoUrl: null,
          category: i.category,
          caption: compactCaption(i.caption),
          location: i.location ?? null,
          status: 'published' as const,
        })),
      )
      revalidate()
      return rows.map(toAdmin)
    },

    async update(id: string, input: GalleryItemInputT): Promise<AdminGalleryItem> {
      if (!(await repo.exists(id))) throw notFound('Gallery item')
      await repo.assertMedia([{ path: 'mediaId', id: input.mediaId }])
      const g = await repo.update(id, { ...input, caption: compactCaption(input.caption) })
      revalidate()
      return toAdmin(g)
    },

    async setStatus(id: string, status: 'draft' | 'published'): Promise<AdminGalleryItem> {
      if (!(await repo.exists(id))) throw notFound('Gallery item')
      const g = await repo.setStatus(id, status)
      revalidate()
      return toAdmin(g)
    },

    async reorder(items: { id: string; order: number }[]) {
      await repo.reorder(items)
      revalidate()
    },

    async remove(id: string) {
      if (!(await repo.exists(id))) throw notFound('Gallery item')
      await repo.delete(id)
      revalidate()
    },
  }
}
