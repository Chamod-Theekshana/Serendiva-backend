import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { reviewInclude } from '@/modules/shared/public-dto'
import { adminMediaSelect } from '@/modules/shared/admin-dto'
import { assertMediaExist, findAdminMediaRefs, findMediaMap } from '@/modules/shared/media-lookup'

export const adminReviewInclude = {
  photo: { select: adminMediaSelect },
  tour: { select: { id: true, slug: true, title: true } },
} satisfies Prisma.ReviewInclude

export type AdminReviewRow = Prisma.ReviewGetPayload<{ include: typeof adminReviewInclude }>

export function createReviewsRepository(prisma: PrismaClient) {
  return {
    mediaMap: (ids: Iterable<string>) => findMediaMap(prisma, ids),
    adminMediaRefs: (ids: Iterable<string>) => findAdminMediaRefs(prisma, ids),
    assertMedia: (refs: { path: string; id: string | null | undefined }[]) => assertMediaExist(prisma, refs),

    // ---------- public ----------
    listApproved: (
      where: Prisma.ReviewWhereInput,
      orderBy: Prisma.ReviewOrderByWithRelationInput[],
      skip: number,
      take: number,
    ) =>
      prisma.$transaction([
        prisma.review.findMany({ where: { ...where, status: 'approved' }, include: reviewInclude, orderBy, skip, take }),
        prisma.review.count({ where: { ...where, status: 'approved' } }),
      ]),

    approvedStats: () =>
      Promise.all([
        prisma.review.aggregate({ where: { status: 'approved' }, _avg: { rating: true }, _count: true }),
        prisma.review.groupBy({ by: ['travellerType'], where: { status: 'approved' }, _count: { _all: true } }),
        prisma.review.groupBy({ by: ['rating'], where: { status: 'approved' }, _count: { _all: true } }),
      ]),

    findTourBySlug: (slug: string) =>
      prisma.tour.findFirst({ where: { slug, status: 'published' }, select: { id: true, slug: true } }),

    createSubmission: (data: Prisma.ReviewUncheckedCreateInput) => prisma.review.create({ data, select: { id: true } }),

    // ---------- admin ----------
    adminList: (where: Prisma.ReviewWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.review.findMany({ where, include: adminReviewInclude, orderBy: [{ createdAt: 'desc' }], skip, take }),
        prisma.review.count({ where }),
      ]),

    countsByStatus: (where: Prisma.ReviewWhereInput) =>
      prisma.review.groupBy({ by: ['status'], where, _count: { _all: true } }),

    adminFindById: (id: string) => prisma.review.findUnique({ where: { id }, include: adminReviewInclude }),

    findState: (id: string) =>
      prisma.review.findUnique({
        where: { id },
        select: { status: true, approvedAt: true, tour: { select: { slug: true } } },
      }),

    tourSlugById: (id: string) => prisma.tour.findUnique({ where: { id }, select: { slug: true } }),

    create: (data: Prisma.ReviewUncheckedCreateInput) =>
      prisma.review.create({ data, include: adminReviewInclude }),

    update: (id: string, data: Prisma.ReviewUncheckedUpdateInput) =>
      prisma.review.update({ where: { id }, data, include: adminReviewInclude }),

    delete: (id: string) => prisma.review.delete({ where: { id }, select: { id: true } }),
  }
}

export type ReviewsRepository = ReturnType<typeof createReviewsRepository>
