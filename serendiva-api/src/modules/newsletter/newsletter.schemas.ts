import { z } from 'zod'
import { LOCALES } from '@/lib/i18n'
import { text } from '@/lib/sanitize'
import { PageMetaSchema } from '@/lib/pagination'
import { blankable, EmailField, HoneypotField } from '@/modules/inquiries/lead-schemas'

// ---------------------------------------------------------------------------
// Public (double opt-in)
// ---------------------------------------------------------------------------

export const NewsletterSubscribeBody = z
  .object({
    email: EmailField,
    locale: z.enum(LOCALES).default('en'),
    source: blankable(text(60), 'Where the form was shown, e.g. "footer" or "blog"'),
    website: HoneypotField,
  })
  .meta({ id: 'NewsletterSubscribeBody' })

export type NewsletterSubscribeBodyT = z.infer<typeof NewsletterSubscribeBody>

export const NewsletterSubscribeResult = z
  .object({
    status: z
      .enum(['pending', 'already_subscribed'])
      .describe('pending = a confirmation email was sent; already_subscribed = address already confirmed (no email)'),
    message: z.string(),
  })
  .meta({ id: 'NewsletterSubscribeResult' })

export type NewsletterSubscribeResultT = z.infer<typeof NewsletterSubscribeResult>

export const NewsletterTokenQuery = z.object({ token: z.string().trim().min(16).max(200) })

export const NewsletterTokenResult = z
  .object({ status: z.enum(['confirmed', 'already_confirmed']) })
  .meta({ id: 'NewsletterTokenResult' })

export const NewsletterUnsubscribeResult = z
  .object({ status: z.literal('unsubscribed') })
  .meta({ id: 'NewsletterUnsubscribeResult' })

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const SubscriberStatusEnum = z
  .enum(['confirmed', 'pending', 'unsubscribed'])
  .describe('pending = has not clicked the confirmation link yet')
  .meta({ id: 'SubscriberStatus' })

export type SubscriberStatus = z.infer<typeof SubscriberStatusEnum>

export const AdminSubscribersQuery = z.object({
  q: z.string().trim().max(100).optional().describe('Search email and source'),
  status: SubscriberStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export type AdminSubscribersQueryT = z.infer<typeof AdminSubscribersQuery>

export const AdminSubscribersExportQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: z
    .enum(['confirmed', 'pending', 'unsubscribed', 'all'])
    .default('confirmed')
    .describe('Defaults to confirmed subscribers only'),
})

export type AdminSubscribersExportQueryT = z.infer<typeof AdminSubscribersExportQuery>

export const AdminSubscriber = z
  .object({
    id: z.string(),
    email: z.string(),
    locale: z.string(),
    source: z.string().nullable(),
    status: SubscriberStatusEnum,
    confirmedAt: z.string().nullable(),
    unsubscribedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminSubscriber' })

export type AdminSubscriberT = z.infer<typeof AdminSubscriber>

export const AdminSubscriberList = z
  .object({
    items: z.array(AdminSubscriber),
    meta: PageMetaSchema,
    counts: z
      .object({
        confirmed: z.number().int(),
        pending: z.number().int(),
        unsubscribed: z.number().int(),
        total: z.number().int(),
      })
      .describe('Counts for the current search (ignoring the status filter)'),
  })
  .meta({ id: 'AdminSubscriberList' })
