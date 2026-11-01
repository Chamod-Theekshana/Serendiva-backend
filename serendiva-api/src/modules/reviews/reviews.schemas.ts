import { z } from 'zod'
import { LOCALES, LocaleSchema } from '@/lib/i18n'
import { PageMetaSchema, paginated } from '@/lib/pagination'
import { longText, text } from '@/lib/sanitize'
import { SlugInput } from '@/lib/content-schemas'
import { ReviewCardSchema, ReviewSourceEnum, TravellerTypeEnum } from '@/modules/shared/public-dto'
import { AdminMediaRef } from '@/modules/shared/admin-dto'

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const
export const ReviewStatusEnum = z.enum(REVIEW_STATUSES).meta({ id: 'ReviewStatus' })

const CountryCode = z
  .string()
  .regex(/^[A-Za-z]{2}$/, 'Use a 2-letter ISO country code, e.g. "GB"')
  .transform((v) => v.toUpperCase())

/** Month of travel, e.g. "2024-02" */
export const TravelMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use the format YYYY-MM')

const boolQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === 'true'))

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const ReviewsQuery = z.object({
  locale: LocaleSchema,
  travellerType: TravellerTypeEnum.optional(),
  country: z
    .string()
    .regex(/^[A-Za-z]{2}(,[A-Za-z]{2})*$/, 'Comma-separated ISO country codes, e.g. "GB,IE"')
    .optional()
    .describe('Comma-separated ISO-2 codes, e.g. "GB,IE"'),
  tour: z.string().max(100).optional().describe('Tour slug'),
  featured: boolQuery,
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sort: z.enum(['newest', 'rating']).default('newest').describe('newest = most recent travel date first'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

export const ReviewListSchema = paginated(ReviewCardSchema).meta({ id: 'ReviewList' })

export const ReviewSubmissionBody = z
  .object({
    guestName: text(120).pipe(z.string().min(2, 'Please enter your name')),
    // Trim before validating: mobile keyboards often append a space after an autocompleted address.
    email: z.string().trim().toLowerCase().max(200).pipe(z.email('Please enter a valid email address')),
    country: CountryCode,
    location: text(120).optional().describe('City / region, e.g. "Oxford"'),
    travellerType: TravellerTypeEnum,
    tourSlug: SlugInput.optional().describe('Slug of the tour you took, if any'),
    rating: z.number().int().min(1).max(5),
    title: text(160).optional(),
    text: longText(3000).pipe(z.string().min(20, 'Please write at least 20 characters')),
    travelDate: TravelMonth.optional().describe('Month you travelled, YYYY-MM'),
    locale: z.enum(LOCALES).default('en'),
    website: z.string().max(500).optional().describe('Honeypot — leave empty'),
    turnstileToken: z.string().max(4096).optional(),
  })
  .meta({ id: 'ReviewSubmissionBody' })

export type ReviewSubmissionT = z.infer<typeof ReviewSubmissionBody>

export const ReviewSubmissionResult = z
  .object({ message: z.string() })
  .meta({ id: 'ReviewSubmissionResult' })

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const AdminReviewsQuery = z.object({
  status: ReviewStatusEnum.optional(),
  q: z.string().trim().max(100).optional().describe('Search guest name, email, title and text'),
  travellerType: TravellerTypeEnum.optional(),
  featured: boolQuery,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

export const ReviewInput = z
  .object({
    guestName: z.string().trim().min(1).max(120),
    email: z.email().max(200).nullable().default(null),
    country: CountryCode,
    location: z.string().max(120).nullable().default(null),
    partyLabel: z.string().max(60).nullable().default(null).describe('e.g. "4 Travelers"'),
    travellerType: TravellerTypeEnum,
    tourType: z.string().max(80).nullable().default(null).describe('e.g. "Family Wonder"'),
    tripLabel: z.string().max(120).nullable().default(null).describe('e.g. "9-Day Family Wonder Route"'),
    tourId: z.string().min(1).nullable().default(null),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(200).nullable().default(null),
    text: z.string().trim().min(1).max(5000),
    photoId: z.string().min(1).nullable().default(null),
    tripPhotoIds: z.array(z.string().min(1)).max(12).default([]),
    source: ReviewSourceEnum.default('direct'),
    travelDate: TravelMonth.nullable().default(null),
    status: ReviewStatusEnum.default('approved'),
    isFeatured: z.boolean().default(false),
    locale: z.enum(LOCALES).default('en'),
  })
  .meta({ id: 'ReviewWrite' })

export type ReviewInputT = z.infer<typeof ReviewInput>

export const ReviewStatusBody = z.object({ status: ReviewStatusEnum }).meta({ id: 'ReviewStatusBody' })
export const ReviewFeatureBody = z.object({ isFeatured: z.boolean() }).meta({ id: 'ReviewFeatureBody' })

export const AdminReviewSchema = z
  .object({
    id: z.string(),
    guestName: z.string(),
    email: z.string().nullable(),
    country: z.string(),
    location: z.string().nullable(),
    partyLabel: z.string().nullable(),
    travellerType: TravellerTypeEnum,
    tourType: z.string().nullable(),
    tripLabel: z.string().nullable(),
    tourId: z.string().nullable(),
    tour: z.object({ id: z.string(), slug: z.string(), title: z.string() }).nullable(),
    rating: z.number().int(),
    title: z.string().nullable(),
    text: z.string(),
    photoId: z.string().nullable(),
    photo: AdminMediaRef.nullable(),
    tripPhotoIds: z.array(z.string()),
    tripPhotos: z.array(AdminMediaRef),
    source: ReviewSourceEnum,
    travelDate: z.string().nullable().describe('YYYY-MM'),
    status: ReviewStatusEnum,
    isFeatured: z.boolean(),
    locale: z.string(),
    approvedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminReview' })

export type AdminReview = z.infer<typeof AdminReviewSchema>

export const AdminReviewList = z
  .object({
    items: z.array(AdminReviewSchema),
    meta: PageMetaSchema,
    counts: z
      .object({ pending: z.number().int(), approved: z.number().int(), rejected: z.number().int() })
      .describe('Per-status totals for the current search (ignores the status filter)'),
  })
  .meta({ id: 'AdminReviewList' })
