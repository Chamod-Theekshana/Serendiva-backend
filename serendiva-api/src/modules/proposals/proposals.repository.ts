import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { nextReference } from '@/lib/reference'
import { findContactWhatsapp } from '@/modules/inquiries/inquiries.repository'
import type { LeadEmailPatch } from '@/modules/inquiries/lead-emails'
import type { LeadStatus } from '@/modules/inquiries/lead-schemas'

export const proposalInclude = {
  attachment: { select: { id: true, key: true, mime: true, size: true, originalName: true } },
} satisfies Prisma.CorporateProposalInclude

export type ProposalRow = Prisma.CorporateProposalGetPayload<{ include: typeof proposalInclude }>

export type ProposalCreateData = Pick<
  Prisma.CorporateProposalUncheckedCreateInput,
  | 'company'
  | 'contactPerson'
  | 'email'
  | 'phone'
  | 'groupSize'
  | 'dates'
  | 'eventType'
  | 'logistics'
  | 'message'
  | 'sourcePage'
  | 'locale'
>

const NEWEST_FIRST = [{ createdAt: 'desc' }, { id: 'desc' }] satisfies Prisma.CorporateProposalOrderByWithRelationInput[]

export function createProposalsRepository(prisma: PrismaClient) {
  return {
    /** Reference allocation and insert share one transaction, so a reference is never skipped or reused. */
    create: (data: ProposalCreateData) =>
      prisma.$transaction(async (tx) => {
        const reference = await nextReference(tx, 'proposal')
        return tx.corporateProposal.create({
          data: { ...data, reference },
          select: { id: true, reference: true, createdAt: true },
        })
      }),

    /** Store the uploaded brief as a (private) Media row and link it to the proposal. */
    attachFile: (
      proposalId: string,
      file: { key: string; url: string; mime: string; size: number; originalName: string },
    ) =>
      prisma.$transaction(async (tx) => {
        const media = await tx.media.create({ data: file, select: { id: true } })
        await tx.corporateProposal.update({ where: { id: proposalId }, data: { attachmentId: media.id } })
        return media.id
      }),

    findById: (id: string) => prisma.corporateProposal.findUnique({ where: { id }, include: proposalInclude }),

    exists: (id: string) => prisma.corporateProposal.findUnique({ where: { id }, select: { id: true } }),

    list: (where: Prisma.CorporateProposalWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.corporateProposal.findMany({ where, include: proposalInclude, orderBy: NEWEST_FIRST, skip, take }),
        prisma.corporateProposal.count({ where }),
      ]),

    countByStatus: (where: Prisma.CorporateProposalWhereInput) =>
      prisma.corporateProposal.groupBy({ by: ['status'], where, _count: { _all: true } }),

    listForExport: (where: Prisma.CorporateProposalWhereInput, take = 10_000) =>
      prisma.corporateProposal.findMany({ where, include: proposalInclude, orderBy: NEWEST_FIRST, take }),

    update: (id: string, data: { status?: LeadStatus; internalNotes?: string | null }) =>
      prisma.corporateProposal.update({ where: { id }, data, include: proposalInclude }),

    updateEmailState: (id: string, patch: LeadEmailPatch) =>
      prisma.corporateProposal.update({ where: { id }, data: patch }),

    /** Deletes the proposal and its attachment's Media row; returns the storage key to remove. */
    delete: (id: string) =>
      prisma.$transaction(async (tx) => {
        const row = await tx.corporateProposal.delete({
          where: { id },
          select: { attachment: { select: { id: true, key: true } } },
        })
        if (row.attachment) await tx.media.delete({ where: { id: row.attachment.id } })
        return row.attachment?.key ?? null
      }),

    findEmailRetryIds: (opts: { createdAfter: Date; createdBefore: Date; maxAttempts: number; take: number }) =>
      prisma.corporateProposal.findMany({
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

export type ProposalsRepository = ReturnType<typeof createProposalsRepository>
