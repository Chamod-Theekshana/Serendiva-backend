import { z } from 'zod'
import { LocaleSchema, translatable } from '@/lib/i18n'
import { TString } from '@/lib/content-schemas'
import { FaqItemSchema } from '@/modules/shared/public-dto'

export const FAQ_SCOPES = ['general', 'booking', 'corporate', 'tour', 'destination'] as const
export const FaqScopeEnum = z.enum(FAQ_SCOPES).meta({ id: 'FaqScope' })

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const FaqsQuery = z.object({
  locale: LocaleSchema,
  scope: FaqScopeEnum.optional(),
  tour: z.string().max(100).optional().describe('Tour slug — FAQs attached to that tour'),
  destination: z.string().max(100).optional().describe('Destination slug — FAQs attached to that destination'),
})

export const FaqListSchema = z.array(FaqItemSchema).meta({ id: 'FaqList' })

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const FaqInput = z
  .object({
    scope: FaqScopeEnum.default('general'),
    question: TString(300),
    answer: translatable(z.string().min(1).max(5000)).describe('Markdown allowed'),
    order: z.number().int().min(0).default(0),
    status: z.enum(['draft', 'published']).default('published'),
    tourId: z.string().min(1).nullable().default(null),
    destinationId: z.string().min(1).nullable().default(null),
  })
  .superRefine((f, ctx) => {
    if (f.scope === 'tour' && !f.tourId) ctx.addIssue({ code: 'custom', path: ['tourId'], message: 'Choose the tour this FAQ belongs to' })
    if (f.scope === 'destination' && !f.destinationId)
      ctx.addIssue({ code: 'custom', path: ['destinationId'], message: 'Choose the destination this FAQ belongs to' })
    if (f.scope !== 'tour' && f.tourId) ctx.addIssue({ code: 'custom', path: ['tourId'], message: 'Only tour-scoped FAQs can link a tour' })
    if (f.scope !== 'destination' && f.destinationId)
      ctx.addIssue({ code: 'custom', path: ['destinationId'], message: 'Only destination-scoped FAQs can link a destination' })
  })
  .meta({ id: 'FaqWrite' })

export type FaqInputT = z.infer<typeof FaqInput>

export const AdminFaqsQuery = z.object({
  scope: FaqScopeEnum.optional(),
  tourId: z.string().max(64).optional(),
  destinationId: z.string().max(64).optional(),
  q: z.string().trim().max(100).optional().describe('Search the English question'),
})

export const AdminFaqSchema = z
  .object({
    id: z.string(),
    scope: FaqScopeEnum,
    question: z.record(z.string(), z.string()),
    answer: z.record(z.string(), z.string()),
    order: z.number().int(),
    status: z.enum(['draft', 'published']),
    tourId: z.string().nullable(),
    tour: z.object({ id: z.string(), slug: z.string(), title: z.string() }).nullable(),
    destinationId: z.string().nullable(),
    destination: z.object({ id: z.string(), slug: z.string(), name: z.string() }).nullable(),
    translations: z.object({ zh: z.boolean(), de: z.boolean() }),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminFaq' })

export const AdminFaqListSchema = z.array(AdminFaqSchema).meta({ id: 'AdminFaqList' })

export type AdminFaq = z.infer<typeof AdminFaqSchema>
