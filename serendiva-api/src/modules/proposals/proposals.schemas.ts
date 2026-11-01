import { z } from 'zod'
import { LOCALES } from '@/lib/i18n'
import { longText, text } from '@/lib/sanitize'
import { PageMetaSchema } from '@/lib/pagination'
import {
  blankable,
  EmailField,
  HoneypotField,
  LeadCountsSchema,
  LeadEmailStatusEnum,
  LeadListFilters,
  LeadPagination,
  LeadStatusEnum,
  leadUpdateFields,
  TurnstileField,
} from '@/modules/inquiries/lead-schemas'

export const PROPOSAL_THANK_YOU = 'Thank you — I will reply within 24 hours.'

/** Optional brief: PDF or DOCX, verified by magic bytes. */
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024

// ---------------------------------------------------------------------------
// Public form (multipart/form-data — validated by hand, so no OpenAPI id)
// ---------------------------------------------------------------------------

const required = (max: number, message: string) => text(max).pipe(z.string().min(1, message))

export const ProposalFields = z.object({
  company: text(160).pipe(z.string().min(2, 'Please enter your company name')),
  contactPerson: text(120).pipe(z.string().min(2, 'Please enter a contact person')),
  email: EmailField,
  phone: text(40).pipe(z.string().min(5, 'Please enter a phone number')),
  groupSize: required(60, 'Please enter the group size'),
  dates: required(120, 'Please enter the dates'),
  eventType: required(80, 'Please choose the type of event'),
  logistics: z
    .array(text(60))
    .max(10, 'Choose at most 10 items')
    .default([])
    .transform((list) => [...new Set(list.filter(Boolean))]),
  message: blankable(longText(5000)),
  sourcePage: blankable(text(300)),
  locale: blankable(z.enum(LOCALES)).transform((v) => v ?? 'en'),
  website: HoneypotField,
  turnstileToken: TurnstileField,
})

export type ProposalFieldsT = z.infer<typeof ProposalFields>

/** Text fields that must be present (missing ones are validated as "" to get a friendly message). */
export const REQUIRED_PROPOSAL_FIELDS = ['company', 'contactPerson', 'email', 'phone', 'groupSize', 'dates', 'eventType'] as const

export const ProposalResult = z
  .object({
    reference: z.string().meta({ example: 'SRD-C-2026-0007' }),
    message: z.string().meta({ example: PROPOSAL_THANK_YOU }),
  })
  .meta({ id: 'ProposalResult' })

export type ProposalResultT = z.infer<typeof ProposalResult>

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const AdminProposalsQuery = z.object({
  ...LeadListFilters,
  q: LeadListFilters.q.describe('Search company, contact person, email and reference'),
  ...LeadPagination,
})

export type AdminProposalsQueryT = z.infer<typeof AdminProposalsQuery>
export type ProposalFilters = Omit<AdminProposalsQueryT, 'page' | 'pageSize'>

export const AdminProposalAttachment = z
  .object({
    id: z.string(),
    originalName: z.string(),
    mime: z.string(),
    size: z.number().int().describe('Bytes'),
    downloadPath: z
      .string()
      .describe('Authenticated download, relative to the API origin, e.g. /api/v1/admin/proposals/<id>/attachment'),
  })
  .meta({ id: 'AdminProposalAttachment' })

export const AdminProposalListItem = z
  .object({
    id: z.string(),
    reference: z.string(),
    company: z.string(),
    contactPerson: z.string(),
    email: z.string(),
    phone: z.string(),
    groupSize: z.string(),
    dates: z.string(),
    eventType: z.string(),
    logistics: z.array(z.string()),
    messagePreview: z.string().nullable().describe('First 160 characters of the brief'),
    hasAttachment: z.boolean(),
    sourcePage: z.string().nullable(),
    locale: z.string(),
    status: LeadStatusEnum,
    emailStatus: LeadEmailStatusEnum,
    hasNotes: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminProposalListItem' })

export type AdminProposalListItemT = z.infer<typeof AdminProposalListItem>

export const AdminProposalList = z
  .object({ items: z.array(AdminProposalListItem), meta: PageMetaSchema, counts: LeadCountsSchema })
  .meta({ id: 'AdminProposalList' })

export const AdminProposalSchema = z
  .object({
    id: z.string(),
    reference: z.string(),
    company: z.string(),
    contactPerson: z.string(),
    email: z.string(),
    phone: z.string(),
    groupSize: z.string(),
    dates: z.string(),
    eventType: z.string(),
    logistics: z.array(z.string()),
    message: z.string().nullable(),
    attachment: AdminProposalAttachment.nullable(),
    sourcePage: z.string().nullable(),
    locale: z.string(),
    status: LeadStatusEnum,
    internalNotes: z.string().nullable(),
    emailStatus: LeadEmailStatusEnum,
    guideEmailSentAt: z.string().nullable(),
    visitorEmailSentAt: z.string().nullable(),
    emailAttempts: z.number().int(),
    lastEmailError: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminProposal' })

export type AdminProposal = z.infer<typeof AdminProposalSchema>

export const ProposalUpdateBody = z.object(leadUpdateFields).meta({ id: 'ProposalUpdateBody' })
export type ProposalUpdateBodyT = z.infer<typeof ProposalUpdateBody>
