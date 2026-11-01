import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import type { SubscriberStatus } from './newsletter.schemas'

export const STATUS_WHERE: Record<SubscriberStatus, Prisma.NewsletterSubscriberWhereInput> = {
  confirmed: { confirmedAt: { not: null }, unsubscribedAt: null },
  pending: { confirmedAt: null, unsubscribedAt: null },
  unsubscribed: { unsubscribedAt: { not: null } },
}

const NEWEST_FIRST = [{ createdAt: 'desc' }, { id: 'desc' }] satisfies Prisma.NewsletterSubscriberOrderByWithRelationInput[]

export function createNewsletterRepository(prisma: PrismaClient) {
  return {
    findByEmail: (email: string) => prisma.newsletterSubscriber.findUnique({ where: { email } }),
    findByConfirmToken: (confirmToken: string) => prisma.newsletterSubscriber.findUnique({ where: { confirmToken } }),
    findByUnsubscribeToken: (unsubscribeToken: string) =>
      prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken } }),
    exists: (id: string) => prisma.newsletterSubscriber.findUnique({ where: { id }, select: { id: true } }),

    create: (data: Prisma.NewsletterSubscriberCreateInput) => prisma.newsletterSubscriber.create({ data }),
    update: (id: string, data: Prisma.NewsletterSubscriberUpdateInput) =>
      prisma.newsletterSubscriber.update({ where: { id }, data }),
    delete: (id: string) => prisma.newsletterSubscriber.delete({ where: { id }, select: { id: true } }),

    list: (where: Prisma.NewsletterSubscriberWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.newsletterSubscriber.findMany({ where, orderBy: NEWEST_FIRST, skip, take }),
        prisma.newsletterSubscriber.count({ where }),
      ]),

    /** Counts per status within `where` (search filters only). */
    counts: (where: Prisma.NewsletterSubscriberWhereInput) =>
      prisma.$transaction([
        prisma.newsletterSubscriber.count({ where: { AND: [where, STATUS_WHERE.confirmed] } }),
        prisma.newsletterSubscriber.count({ where: { AND: [where, STATUS_WHERE.pending] } }),
        prisma.newsletterSubscriber.count({ where: { AND: [where, STATUS_WHERE.unsubscribed] } }),
      ]),

    listForExport: (where: Prisma.NewsletterSubscriberWhereInput, take = 50_000) =>
      prisma.newsletterSubscriber.findMany({ where, orderBy: NEWEST_FIRST, take }),
  }
}

export type NewsletterRepository = ReturnType<typeof createNewsletterRepository>
