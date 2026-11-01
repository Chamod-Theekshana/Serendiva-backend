import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { jsonValue as J } from '@/lib/json'
import type { FaqInputT } from './faqs.schemas'

export const adminFaqInclude = {
  tour: { select: { id: true, slug: true, title: true } },
  destination: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.FaqInclude

export type AdminFaqRow = Prisma.FaqGetPayload<{ include: typeof adminFaqInclude }>

const ORDER = [{ order: 'asc' }, { createdAt: 'asc' }] satisfies Prisma.FaqOrderByWithRelationInput[]

function data(input: FaqInputT) {
  return {
    scope: input.scope,
    question: J(input.question),
    answer: J(input.answer),
    order: input.order,
    status: input.status,
    tourId: input.tourId,
    destinationId: input.destinationId,
  }
}

export function createFaqsRepository(prisma: PrismaClient) {
  return {
    listPublished: (where: Prisma.FaqWhereInput) =>
      prisma.faq.findMany({
        where: { ...where, status: 'published' },
        select: { id: true, question: true, answer: true },
        orderBy: ORDER,
      }),

    adminList: (where: Prisma.FaqWhereInput) => prisma.faq.findMany({ where, include: adminFaqInclude, orderBy: ORDER }),
    adminFindById: (id: string) => prisma.faq.findUnique({ where: { id }, include: adminFaqInclude }),
    findLinks: (id: string) =>
      prisma.faq.findUnique({
        where: { id },
        select: { tour: { select: { slug: true } }, destination: { select: { slug: true } } },
      }),
    tourExists: (id: string) => prisma.tour.findUnique({ where: { id }, select: { id: true } }),
    destinationExists: (id: string) => prisma.destination.findUnique({ where: { id }, select: { id: true } }),

    create: (input: FaqInputT) => prisma.faq.create({ data: data(input), include: adminFaqInclude }),
    update: (id: string, input: FaqInputT) => prisma.faq.update({ where: { id }, data: data(input), include: adminFaqInclude }),
    setStatus: (id: string, status: 'draft' | 'published') =>
      prisma.faq.update({ where: { id }, data: { status }, include: adminFaqInclude }),
    reorder: (items: { id: string; order: number }[]) =>
      prisma.$transaction(items.map((i) => prisma.faq.update({ where: { id: i.id }, data: { order: i.order } }))),
    linksOf: (ids: string[]) =>
      prisma.faq.findMany({
        where: { id: { in: ids } },
        select: { tour: { select: { slug: true } }, destination: { select: { slug: true } } },
      }),
    delete: (id: string) => prisma.faq.delete({ where: { id }, select: { id: true } }),
  }
}
