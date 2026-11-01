import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { nextReference } from '@/lib/reference'
import type { LeadEmailPatch } from './lead-emails'
import type { LeadStatus } from './lead-schemas'

export const inquiryInclude = {
  tour: { select: { id: true, slug: true, title: true } },
  destination: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.InquiryInclude

export type InquiryRow = Prisma.InquiryGetPayload<{ include: typeof inquiryInclude }>

export type InquiryCreateData = Omit<
  Prisma.InquiryUncheckedCreateInput,
  'id' | 'reference' | 'status' | 'internalNotes' | 'emailStatus' | 'createdAt' | 'updatedAt'
>

const NEWEST_FIRST = [{ createdAt: 'desc' }, { id: 'desc' }] satisfies Prisma.InquiryOrderByWithRelationInput[]

/** WhatsApp number from the `contact` site setting (shown in visitor confirmations), if configured. */
export async function findContactWhatsapp(prisma: PrismaClient): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: 'contact' }, select: { value: true } })
  const value = row?.value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const whatsapp = (value as Record<string, unknown>).whatsapp
  return typeof whatsapp === 'string' && whatsapp.trim() !== '' ? whatsapp : null
}

export function createInquiriesRepository(prisma: PrismaClient) {
  return {
    findTourIdBySlug: (slug: string) => prisma.tour.findUnique({ where: { slug }, select: { id: true } }),

    findDestinationIdBySlug: (slug: string) =>
      prisma.destination.findUnique({ where: { slug }, select: { id: true } }),

    /** Reference allocation and insert share one transaction, so a reference is never skipped or reused. */
    create: (data: InquiryCreateData) =>
      prisma.$transaction(async (tx) => {
        const reference = await nextReference(tx, 'inquiry')
        return tx.inquiry.create({ data: { ...data, reference }, select: { id: true, reference: true } })
      }),

    findById: (id: string) => prisma.inquiry.findUnique({ where: { id }, include: inquiryInclude }),

    exists: (id: string) => prisma.inquiry.findUnique({ where: { id }, select: { id: true } }),

    list: (where: Prisma.InquiryWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.inquiry.findMany({ where, include: inquiryInclude, orderBy: NEWEST_FIRST, skip, take }),
        prisma.inquiry.count({ where }),
      ]),

    countByStatus: (where: Prisma.InquiryWhereInput) =>
      prisma.inquiry.groupBy({ by: ['status'], where, _count: { _all: true } }),

    /** CSV export (capped so a runaway export cannot exhaust memory). */
    listForExport: (where: Prisma.InquiryWhereInput, take = 10_000) =>
      prisma.inquiry.findMany({ where, include: inquiryInclude, orderBy: NEWEST_FIRST, take }),

    latest: (take: number) => prisma.inquiry.findMany({ include: inquiryInclude, orderBy: NEWEST_FIRST, take }),

    update: (id: string, data: { status?: LeadStatus; internalNotes?: string | null }) =>
      prisma.inquiry.update({ where: { id }, data, include: inquiryInclude }),

    updateEmailState: (id: string, patch: LeadEmailPatch) => prisma.inquiry.update({ where: { id }, data: patch }),

    delete: (id: string) => prisma.inquiry.delete({ where: { id }, select: { id: true } }),

    /** Leads whose emails still need (re)sending, oldest first. */
    findEmailRetryIds: (opts: { createdAfter: Date; createdBefore: Date; maxAttempts: number; take: number }) =>
      prisma.inquiry.findMany({
        where: {
          emailStatus: { in: ['pending', 'failed', 'partial'] },
          emailAttempts: { lt: opts.maxAttempts },
          createdAt: { gte: opts.createdAfter, lte: opts.createdBefore },
        },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
        take: opts.take,
      }),

    contactWhatsapp: () => findContactWhatsapp(prisma),
  }
}

export type InquiriesRepository = ReturnType<typeof createInquiriesRepository>
