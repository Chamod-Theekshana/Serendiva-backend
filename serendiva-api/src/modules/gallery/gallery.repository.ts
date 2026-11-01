import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { optJson as O } from '@/lib/json'
import { mediaSelect } from '@/lib/media-dto'
import { adminMediaSelect } from '@/modules/shared/admin-dto'
import { assertMediaExist } from '@/modules/shared/media-lookup'
import type { GalleryItemInputT } from './gallery.schemas'

const ORDER = [{ order: 'asc' }, { createdAt: 'asc' }] satisfies Prisma.GalleryItemOrderByWithRelationInput[]

export const adminGalleryInclude = { media: { select: adminMediaSelect } } satisfies Prisma.GalleryItemInclude
export type AdminGalleryRow = Prisma.GalleryItemGetPayload<{ include: typeof adminGalleryInclude }>

function data(input: GalleryItemInputT) {
  return {
    type: input.type,
    mediaId: input.mediaId,
    videoUrl: input.videoUrl,
    category: input.category,
    caption: O(input.caption),
    location: input.location || null,
    order: input.order,
    status: input.status,
  }
}

export function createGalleryRepository(prisma: PrismaClient) {
  return {
    assertMedia: (refs: { path: string; id: string | null | undefined }[]) => assertMediaExist(prisma, refs),

    listPublished: (type?: 'image' | 'video') =>
      prisma.galleryItem.findMany({
        where: { status: 'published', ...(type ? { type } : {}) },
        include: { media: { select: mediaSelect } },
        orderBy: ORDER,
      }),

    adminList: (where: Prisma.GalleryItemWhereInput) =>
      prisma.galleryItem.findMany({ where, include: adminGalleryInclude, orderBy: ORDER }),
    adminFindById: (id: string) => prisma.galleryItem.findUnique({ where: { id }, include: adminGalleryInclude }),
    exists: (id: string) => prisma.galleryItem.findUnique({ where: { id }, select: { id: true } }),

    create: (input: GalleryItemInputT) => prisma.galleryItem.create({ data: data(input), include: adminGalleryInclude }),
    update: (id: string, input: GalleryItemInputT) =>
      prisma.galleryItem.update({ where: { id }, data: data(input), include: adminGalleryInclude }),
    setStatus: (id: string, status: 'draft' | 'published') =>
      prisma.galleryItem.update({ where: { id }, data: { status }, include: adminGalleryInclude }),

    /** Appends the items after the current last position, in one transaction. */
    createMany: (items: Omit<GalleryItemInputT, 'order'>[]) =>
      prisma.$transaction(async (tx) => {
        const last = await tx.galleryItem.aggregate({ _max: { order: true } })
        const start = (last._max.order ?? -1) + 1
        const created: AdminGalleryRow[] = []
        for (const [i, item] of items.entries()) {
          created.push(await tx.galleryItem.create({ data: data({ ...item, order: start + i }), include: adminGalleryInclude }))
        }
        return created
      }),

    reorder: (items: { id: string; order: number }[]) =>
      prisma.$transaction(items.map((i) => prisma.galleryItem.update({ where: { id: i.id }, data: { order: i.order } }))),

    delete: (id: string) => prisma.galleryItem.delete({ where: { id }, select: { id: true } }),
  }
}
