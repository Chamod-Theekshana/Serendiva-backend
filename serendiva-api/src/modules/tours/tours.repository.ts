import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { jsonValue as J, optJson as O } from '@/lib/json'
import { mediaSelect } from '@/lib/media-dto'
import { reviewInclude } from '@/modules/shared/public-dto'
import { adminMediaSelect } from '@/modules/shared/admin-dto'
import type { TourInputT } from './tours.schemas'

/** Everything a public tour card needs. */
export const tourCardInclude = {
  cover: { select: mediaSelect },
  categories: { include: { category: { select: { id: true, slug: true, name: true, shortName: true, order: true } } } },
} satisfies Prisma.TourInclude

export type TourCardRow = Prisma.TourGetPayload<{ include: typeof tourCardInclude }>

export const tourDetailInclude = {
  ...tourCardInclude,
  days: { orderBy: { dayNumber: 'asc' } },
  gallery: { orderBy: { order: 'asc' }, include: { media: { select: mediaSelect } } },
  destinations: {
    orderBy: { order: 'asc' },
    include: { destination: { select: { slug: true, name: true, status: true } } },
  },
  faqs: { where: { status: 'published' }, orderBy: { order: 'asc' } },
} satisfies Prisma.TourInclude

export type TourDetailRow = Prisma.TourGetPayload<{ include: typeof tourDetailInclude }>

export const adminTourInclude = {
  cover: { select: adminMediaSelect },
  days: { orderBy: { dayNumber: 'asc' } },
  gallery: { orderBy: { order: 'asc' }, include: { media: { select: adminMediaSelect } } },
  categories: true,
  destinations: { orderBy: { order: 'asc' } },
} satisfies Prisma.TourInclude

export type AdminTourRow = Prisma.TourGetPayload<{ include: typeof adminTourInclude }>


/** Map validated admin input to Prisma scalar data (relations handled separately). */
function scalarData(input: TourInputT) {
  return {
    slug: input.slug,
    status: input.status,
    order: input.order,
    isFeatured: input.isFeatured,
    isMostPopular: input.isMostPopular,
    title: J(input.title),
    summary: J(input.summary),
    description: J(input.description),
    cardTag: O(input.cardTag),
    durationDays: input.durationDays,
    durationNights: input.durationNights,
    route: input.route,
    highlights: J(input.highlights),
    badges: O(input.badges),
    overview: O(input.overview),
    keyFeatures: O(input.keyFeatures),
    included: J(input.included),
    notIncluded: J(input.notIncluded),
    terrains: O(input.terrains),
    routeSummary: O(input.routeSummary),
    travellerTypes: input.travellerTypes,
    seasons: input.seasons,
    coverId: input.coverId,
    seoTitle: O(input.seoTitle),
    seoDescription: O(input.seoDescription),
  }
}

export function createToursRepository(prisma: PrismaClient) {
  async function writeRelations(tx: Prisma.TransactionClient, tourId: string, input: TourInputT) {
    await tx.tourDay.deleteMany({ where: { tourId } })
    if (input.days.length) {
      await tx.tourDay.createMany({
        data: input.days.map((d) => ({
          tourId,
          dayNumber: d.dayNumber,
          title: J(d.title),
          description: J(d.description),
          overnightArea: O(d.overnightArea),
          meals: O(d.meals),
          drivingTime: O(d.drivingTime),
          details: O(d.details),
          isHighlight: d.isHighlight,
          stops: J(d.stops),
        })),
      })
    }
    await tx.tourImage.deleteMany({ where: { tourId } })
    if (input.gallery.length) {
      await tx.tourImage.createMany({
        data: input.gallery.map((g, i) => ({
          tourId,
          mediaId: g.mediaId,
          caption: O(g.caption),
          order: i,
        })),
      })
    }
    await tx.tourCategory.deleteMany({ where: { tourId } })
    if (input.categoryIds.length) {
      await tx.tourCategory.createMany({
        data: [...new Set(input.categoryIds)].map((categoryId) => ({ tourId, categoryId })),
      })
    }
    await tx.tourDestination.deleteMany({ where: { tourId } })
    if (input.destinationIds.length) {
      await tx.tourDestination.createMany({
        data: [...new Set(input.destinationIds)].map((destinationId, order) => ({ tourId, destinationId, order })),
      })
    }
  }

  return {
    // ---------- public ----------
    listPublished: () =>
      prisma.tour.findMany({ where: { status: 'published' }, include: tourCardInclude, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),

    findPublishedBySlug: (slug: string) =>
      prisma.tour.findFirst({ where: { slug, status: 'published' }, include: tourDetailInclude }),

    approvedReviewsForTour: (tourId: string, take: number) =>
      prisma.review.findMany({
        where: { tourId, status: 'approved' },
        include: reviewInclude,
        orderBy: [{ isFeatured: 'desc' }, { travelDate: 'desc' }, { createdAt: 'desc' }],
        take,
      }),

    reviewStatsForTour: (tourId: string) =>
      prisma.review.aggregate({ where: { tourId, status: 'approved' }, _avg: { rating: true }, _count: true }),

    mediaByIds: (ids: string[]) =>
      ids.length ? prisma.media.findMany({ where: { id: { in: ids } }, select: mediaSelect }) : Promise.resolve([]),

    // ---------- admin ----------
    adminList: (where: Prisma.TourWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.tour.findMany({
          where,
          include: { cover: { select: adminMediaSelect }, categories: { include: { category: { select: { name: true } } } } },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          skip,
          take,
        }),
        prisma.tour.count({ where }),
      ]),

    adminFindById: (id: string) => prisma.tour.findUnique({ where: { id }, include: adminTourInclude }),

    findSlugById: (id: string) => prisma.tour.findUnique({ where: { id }, select: { slug: true, publishedAt: true } }),

    create: (input: TourInputT) =>
      prisma.$transaction(async (tx) => {
        const tour = await tx.tour.create({
          data: { ...scalarData(input), publishedAt: input.status === 'published' ? new Date() : null },
        })
        await writeRelations(tx, tour.id, input)
        return tour.id
      }),

    update: (id: string, input: TourInputT, publishedAt: Date | null) =>
      prisma.$transaction(async (tx) => {
        await tx.tour.update({ where: { id }, data: { ...scalarData(input), publishedAt } })
        await writeRelations(tx, id, input)
        return id
      }),

    setStatus: (id: string, status: 'draft' | 'published', publishedAt: Date | null) =>
      prisma.tour.update({ where: { id }, data: { status, publishedAt }, select: { slug: true } }),

    reorder: (items: { id: string; order: number }[]) =>
      prisma.$transaction(items.map((i) => prisma.tour.update({ where: { id: i.id }, data: { order: i.order } }))),

    delete: (id: string) => prisma.tour.delete({ where: { id }, select: { slug: true } }),
  }
}

export type ToursRepository = ReturnType<typeof createToursRepository>
