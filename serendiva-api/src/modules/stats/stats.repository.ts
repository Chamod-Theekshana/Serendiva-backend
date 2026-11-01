import type { PrismaClient } from '@/generated/prisma/client'
import { inquiryInclude } from '@/modules/inquiries/inquiries.repository'
import { STATUS_WHERE } from '@/modules/newsletter/newsletter.repository'

/** Aggregate queries only — the dashboard never loads whole tables. */
export function createStatsRepository(prisma: PrismaClient) {
  return {
    inquiryStatusCounts: () => prisma.inquiry.groupBy({ by: ['status'], _count: { _all: true } }),

    inquiriesSince: (since: Date) => prisma.inquiry.count({ where: { createdAt: { gte: since } } }),

    inquiriesByMonth: (since: Date) =>
      prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, count(*)::int AS count
        FROM "Inquiry"
        WHERE "createdAt" >= ${since}
        GROUP BY 1`,

    /** Country is free text: grouped case-insensitively and shown with its most common spelling. */
    inquiriesByCountry: (take: number) =>
      prisma.$queryRaw<{ country: string; count: number }[]>`
        SELECT COALESCE(NULLIF(mode() WITHIN GROUP (ORDER BY BTRIM("country")), ''), 'Unknown') AS country,
               count(*)::int AS count
        FROM "Inquiry"
        GROUP BY lower(NULLIF(BTRIM("country"), ''))
        ORDER BY 2 DESC, 1 ASC
        LIMIT ${take}`,

    inquiriesByTour: (take: number) =>
      prisma.inquiry.groupBy({
        by: ['tourId'],
        where: { tourId: { not: null } },
        _count: { _all: true },
        orderBy: [{ _count: { tourId: 'desc' } }, { tourId: 'asc' }],
        take,
      }),

    toursByIds: (ids: string[]) =>
      ids.length
        ? prisma.tour.findMany({ where: { id: { in: ids } }, select: { id: true, slug: true, title: true } })
        : Promise.resolve([]),

    /** One row per distinct source page (a few dozen pages at most). */
    inquiriesBySourcePage: () => prisma.inquiry.groupBy({ by: ['sourcePage'], _count: { _all: true } }),

    latestInquiries: (take: number) =>
      prisma.inquiry.findMany({ include: inquiryInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take }),

    proposalCounts: () =>
      prisma.$transaction([prisma.corporateProposal.count({ where: { status: 'new' } }), prisma.corporateProposal.count()]),

    pendingReviews: () => prisma.review.count({ where: { status: 'pending' } }),

    newsletterCounts: () =>
      prisma.$transaction([
        prisma.newsletterSubscriber.count({ where: STATUS_WHERE.confirmed }),
        prisma.newsletterSubscriber.count({ where: STATUS_WHERE.pending }),
      ]),
  }
}
