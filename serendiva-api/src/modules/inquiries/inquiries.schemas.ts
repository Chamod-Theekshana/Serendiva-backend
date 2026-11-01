import { z } from 'zod'
import { LOCALES } from '@/lib/i18n'
import { longText, text } from '@/lib/sanitize'
import { PageMetaSchema } from '@/lib/pagination'
import { TravellerTypeEnum } from '@/modules/shared/public-dto'
import {
  blankable,
  DateString,
  EmailField,
  HoneypotField,
  LeadCountsSchema,
  LeadEmailStatusEnum,
  LeadListFilters,
  LeadPagination,
  LeadStatusEnum,
  leadUpdateFields,
  TurnstileField,
} from './lead-schemas'

export const INQUIRY_THANK_YOU = 'Thank you — I will reply within 24 hours.'

// ---------------------------------------------------------------------------
// Public form
// ---------------------------------------------------------------------------

const SlugRef = z.string().trim().max(120)

export const InquiryBody = z
  .object({
    name: text(120).pipe(z.string().min(2, 'Please enter your name')),
    email: EmailField,
    whatsapp: blankable(text(40), 'WhatsApp number incl. country code, e.g. "+44 7700 900123"'),
    country: blankable(text(80), 'Free text, e.g. "United Kingdom"'),
    partyType: blankable(TravellerTypeEnum),
    adults: z.number().int().min(1).max(50).default(2),
    children: z.number().int().min(0).max(50).default(0),
    travelStart: blankable(DateString, 'YYYY-MM-DD'),
    travelEnd: blankable(DateString, 'YYYY-MM-DD, on or after travelStart'),
    travelWindow: blankable(text(120), 'Free label, e.g. "Dec 2026 – Feb 2027"'),
    flexibleDates: z.boolean().optional(),
    flexibility: blankable(text(120)),
    durationPreference: blankable(text(60)),
    pace: blankable(text(60)),
    stayStyle: blankable(text(80)),
    interests: z
      .array(text(60))
      .max(20)
      .default([])
      .transform((list) => [...new Set(list.filter(Boolean))]),
    tourSlug: blankable(SlugRef, 'Tour the visitor asked about (unknown slugs are ignored)'),
    destinationSlug: blankable(SlugRef, 'Destination the visitor asked about (unknown slugs are ignored)'),
    message: blankable(longText(5000)),
    sourcePage: blankable(text(300), 'Path of the page the form was sent from, e.g. "/tours/cultural-odyssey"'),
    locale: z.enum(LOCALES).default('en'),
    website: HoneypotField,
    turnstileToken: TurnstileField,
  })
  .superRefine((v, ctx) => {
    if (v.travelStart && v.travelEnd && v.travelEnd < v.travelStart) {
      ctx.addIssue({ code: 'custom', path: ['travelEnd'], message: 'The end date must be on or after the start date' })
    }
  })
  .meta({ id: 'InquiryBody' })

export type InquiryBodyT = z.infer<typeof InquiryBody>

export const InquiryResult = z
  .object({
    reference: z.string().meta({ example: 'SRD-2026-0042' }),
    message: z.string().meta({ example: INQUIRY_THANK_YOU }),
  })
  .meta({ id: 'InquiryResult' })

export type InquiryResultT = z.infer<typeof InquiryResult>

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const AdminInquiriesQuery = z.object({
  ...LeadListFilters,
  q: LeadListFilters.q.describe('Search name, email, reference and message'),
  tour: z.string().max(64).optional().describe('Tour id'),
  country: z.string().trim().max(80).optional().describe('Exact country (case-insensitive)'),
  ...LeadPagination,
})

export type AdminInquiriesQueryT = z.infer<typeof AdminInquiriesQuery>
export type InquiryFilters = Omit<AdminInquiriesQueryT, 'page' | 'pageSize'>

export const AdminLeadTourRef = z
  .object({ id: z.string(), slug: z.string(), title: z.string().describe('English title') })
  .meta({ id: 'AdminLeadTourRef' })

export const AdminLeadDestinationRef = z
  .object({ id: z.string(), slug: z.string(), name: z.string().describe('English name') })
  .meta({ id: 'AdminLeadDestinationRef' })

export const AdminInquiryListItem = z
  .object({
    id: z.string(),
    reference: z.string(),
    name: z.string(),
    email: z.string(),
    whatsapp: z.string().nullable(),
    country: z.string().nullable(),
    partyType: TravellerTypeEnum.nullable(),
    adults: z.number().int(),
    children: z.number().int(),
    travelStart: z.string().nullable().describe('YYYY-MM-DD'),
    travelEnd: z.string().nullable().describe('YYYY-MM-DD'),
    travelWindow: z.string().nullable(),
    tour: AdminLeadTourRef.nullable(),
    destination: AdminLeadDestinationRef.nullable(),
    messagePreview: z.string().nullable().describe('First 160 characters of the message'),
    sourcePage: z.string().nullable(),
    locale: z.string(),
    status: LeadStatusEnum,
    emailStatus: LeadEmailStatusEnum,
    hasNotes: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminInquiryListItem' })

export type AdminInquiryListItemT = z.infer<typeof AdminInquiryListItem>

export const AdminInquiryList = z
  .object({ items: z.array(AdminInquiryListItem), meta: PageMetaSchema, counts: LeadCountsSchema })
  .meta({ id: 'AdminInquiryList' })

export const AdminInquirySchema = z
  .object({
    id: z.string(),
    reference: z.string(),
    name: z.string(),
    email: z.string(),
    whatsapp: z.string().nullable(),
    country: z.string().nullable(),
    partyType: TravellerTypeEnum.nullable(),
    adults: z.number().int(),
    children: z.number().int(),
    travelStart: z.string().nullable().describe('YYYY-MM-DD'),
    travelEnd: z.string().nullable().describe('YYYY-MM-DD'),
    travelWindow: z.string().nullable(),
    flexibleDates: z.boolean(),
    flexibility: z.string().nullable(),
    durationPreference: z.string().nullable(),
    pace: z.string().nullable(),
    stayStyle: z.string().nullable(),
    interests: z.array(z.string()),
    tourId: z.string().nullable(),
    tour: AdminLeadTourRef.nullable(),
    destinationId: z.string().nullable(),
    destination: AdminLeadDestinationRef.nullable(),
    message: z.string().nullable(),
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
  .meta({ id: 'AdminInquiry' })

export type AdminInquiry = z.infer<typeof AdminInquirySchema>

export const InquiryUpdateBody = z.object(leadUpdateFields).meta({ id: 'InquiryUpdateBody' })
export type InquiryUpdateBodyT = z.infer<typeof InquiryUpdateBody>
