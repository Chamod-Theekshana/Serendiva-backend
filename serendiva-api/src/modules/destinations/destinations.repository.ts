import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { jsonValue as J, optJson as O } from '@/lib/json'
import { mediaSelect } from '@/lib/media-dto'
import { adminMediaSelect } from '@/modules/shared/admin-dto'
import { assertMediaExist, findAdminMediaRefs, findMediaMap } from '@/modules/shared/media-lookup'
import { tourCardInclude } from '@/modules/tours/tours.repository'
import type { DestinationInputT, RegionInputT } from './destinations.schemas'

// ---------------------------------------------------------------- regions

const REGION_ORDER = [{ order: 'asc' }, { createdAt: 'asc' }] satisfies Prisma.RegionOrderByWithRelationInput[]

export const publicRegionInclude = {
  image: { select: mediaSelect },
  _count: { select: { destinations: { where: { status: 'published' } } } },
} satisfies Prisma.RegionInclude

export type PublicRegionRow = Prisma.RegionGetPayload<{ include: typeof publicRegionInclude }>

export const adminRegionInclude = {
  image: { select: adminMediaSelect },
  _count: { select: { destinations: true } },
} satisfies Prisma.RegionInclude

export type AdminRegionRow = Prisma.RegionGetPayload<{ include: typeof adminRegionInclude }>

function regionData(input: RegionInputT) {
  return {
    slug: input.slug,
    name: J(input.name),
    description: O(input.description),
    places: O(input.places),
    icon: input.icon,
    bestMonths: input.bestMonths,
    imageId: input.imageId,
    order: input.order,
  }
}

// ---------------------------------------------------------------- destinations

const DEST_ORDER = [{ order: 'asc' }, { createdAt: 'asc' }] satisfies Prisma.DestinationOrderByWithRelationInput[]

export const destinationCardInclude = {
  cover: { select: mediaSelect },
  region: { select: { id: true, slug: true, name: true, icon: true, order: true } },
} satisfies Prisma.DestinationInclude

export type DestinationCardRow = Prisma.DestinationGetPayload<{ include: typeof destinationCardInclude }>

export const destinationDetailInclude = {
  cover: { select: mediaSelect },
  region: {
    select: { id: true, slug: true, name: true, icon: true, order: true, description: true, places: true, bestMonths: true },
  },
  gallery: { orderBy: { order: 'asc' }, include: { media: { select: mediaSelect } } },
  tours: {
    where: { tour: { status: 'published' } },
    orderBy: [{ tour: { order: 'asc' } }, { tour: { createdAt: 'asc' } }],
    include: { tour: { include: tourCardInclude } },
  },
  faqs: { where: { status: 'published' }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
} satisfies Prisma.DestinationInclude

export type DestinationDetailRow = Prisma.DestinationGetPayload<{ include: typeof destinationDetailInclude }>

export const adminDestinationInclude = {
  cover: { select: adminMediaSelect },
  gallery: { orderBy: { order: 'asc' }, include: { media: { select: adminMediaSelect } } },
  tours: { select: { tourId: true } },
} satisfies Prisma.DestinationInclude

export type AdminDestinationRow = Prisma.DestinationGetPayload<{ include: typeof adminDestinationInclude }>

function destinationData(input: DestinationInputT) {
  return {
    slug: input.slug,
    status: input.status,
    order: input.order,
    regionId: input.regionId,
    name: J(input.name),
    headline: O(input.headline),
    tagline: O(input.tagline),
    summary: J(input.summary),
    description: O(input.description),
    metaLabel: O(input.metaLabel),
    badge: O(input.badge),
    bestTimeLabel: O(input.bestTimeLabel),
    curations: O(input.curations),
    quickFacts: O(input.quickFacts),
    guideNote: O(input.guideNote),
    experiences: O(input.experiences),
    cuisine: O(input.cuisine),
    stays: O(input.stays),
    fieldNotes: O(input.fieldNotes),
    interests: O(input.interests),
    mapPoints: J(input.mapPoints),
    latitude: input.latitude,
    longitude: input.longitude,
    elevation: input.elevation,
    coverId: input.coverId,
    seoTitle: O(input.seoTitle),
    seoDescription: O(input.seoDescription),
  }
}

export function createDestinationsRepository(prisma: PrismaClient) {
  async function writeGallery(tx: Prisma.TransactionClient, destinationId: string, input: DestinationInputT) {
    await tx.destinationImage.deleteMany({ where: { destinationId } })
    if (input.gallery.length) {
      await tx.destinationImage.createMany({
        data: input.gallery.map((g, i) => ({ destinationId, mediaId: g.mediaId, caption: O(g.caption), order: i })),
      })
    }
  }

  return {
    // ---------- media ----------
    mediaMap: (ids: Iterable<string>) => findMediaMap(prisma, ids),
    adminMediaRefs: (ids: Iterable<string>) => findAdminMediaRefs(prisma, ids),
    assertMedia: (refs: { path: string; id: string | null | undefined }[]) => assertMediaExist(prisma, refs),

    // ---------- regions ----------
    listRegionsPublic: () => prisma.region.findMany({ include: publicRegionInclude, orderBy: REGION_ORDER }),
    adminListRegions: () => prisma.region.findMany({ include: adminRegionInclude, orderBy: REGION_ORDER }),
    adminFindRegion: (id: string) => prisma.region.findUnique({ where: { id }, include: adminRegionInclude }),
    regionExists: (id: string) => prisma.region.findUnique({ where: { id }, select: { id: true } }),
    destinationSlugsInRegion: (regionId: string) =>
      prisma.destination.findMany({ where: { regionId }, select: { slug: true } }),
    createRegion: (input: RegionInputT) =>
      prisma.region.create({ data: regionData(input), include: adminRegionInclude }),
    updateRegion: (id: string, input: RegionInputT) =>
      prisma.region.update({ where: { id }, data: regionData(input), include: adminRegionInclude }),
    reorderRegions: (items: { id: string; order: number }[]) =>
      prisma.$transaction(items.map((i) => prisma.region.update({ where: { id: i.id }, data: { order: i.order } }))),
    deleteRegion: (id: string) => prisma.region.delete({ where: { id }, select: { id: true } }),

    // ---------- destinations (public) ----------
    listPublished: () =>
      prisma.destination.findMany({ where: { status: 'published' }, include: destinationCardInclude, orderBy: DEST_ORDER }),
    findPublishedBySlug: (slug: string) =>
      prisma.destination.findFirst({ where: { slug, status: 'published' }, include: destinationDetailInclude }),

    // ---------- destinations (admin) ----------
    adminList: (where: Prisma.DestinationWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.destination.findMany({
          where,
          include: {
            cover: { select: adminMediaSelect },
            region: { select: { name: true } },
            _count: { select: { tours: true } },
          },
          orderBy: DEST_ORDER,
          skip,
          take,
        }),
        prisma.destination.count({ where }),
      ]),
    adminFindById: (id: string) =>
      prisma.destination.findUnique({ where: { id }, include: adminDestinationInclude }),
    findSlugById: (id: string) => prisma.destination.findUnique({ where: { id }, select: { slug: true } }),

    create: (input: DestinationInputT) =>
      prisma.$transaction(async (tx) => {
        const d = await tx.destination.create({ data: destinationData(input) })
        await writeGallery(tx, d.id, input)
        return d.id
      }),

    update: (id: string, input: DestinationInputT) =>
      prisma.$transaction(async (tx) => {
        await tx.destination.update({ where: { id }, data: destinationData(input) })
        await writeGallery(tx, id, input)
        return id
      }),

    setStatus: (id: string, status: 'draft' | 'published') =>
      prisma.destination.update({ where: { id }, data: { status }, select: { slug: true } }),

    reorder: (items: { id: string; order: number }[]) =>
      prisma.$transaction(items.map((i) => prisma.destination.update({ where: { id: i.id }, data: { order: i.order } }))),

    delete: (id: string) => prisma.destination.delete({ where: { id }, select: { slug: true } }),
  }
}

export type DestinationsRepository = ReturnType<typeof createDestinationsRepository>
