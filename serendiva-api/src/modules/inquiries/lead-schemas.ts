import { z } from 'zod'

/**
 * Schema pieces shared by the two lead types (travel inquiries and corporate proposals).
 */

export const LeadStatusEnum = z.enum(['new', 'replied', 'closed']).meta({ id: 'LeadStatus' })
export type LeadStatus = z.infer<typeof LeadStatusEnum>

export const LeadEmailStatusEnum = z
  .enum(['pending', 'sent', 'partial', 'failed'])
  .describe('sent = guide + visitor email delivered, partial = only one, failed = none after an attempt')
  .meta({ id: 'LeadEmailStatus' })

export const LeadCountsSchema = z
  .object({
    new: z.number().int(),
    replied: z.number().int(),
    closed: z.number().int(),
    total: z.number().int(),
  })
  .describe('Counts per status for the current filters (ignoring the status filter)')
  .meta({ id: 'LeadCounts' })

export type LeadCounts = z.infer<typeof LeadCountsSchema>

/** Calendar date "YYYY-MM-DD" that must exist (2026-02-30 is rejected). */
export const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Use the format YYYY-MM-DD', abort: true })
  .refine((v) => {
    const d = new Date(`${v}T00:00:00.000Z`)
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
  }, 'Invalid date')

/**
 * Optional public-form field where "" (and null) mean "not provided" — the website sends empty
 * inputs as empty strings. Text that is empty after sanitising is treated the same way.
 */
export function blankable<T extends z.ZodType>(schema: T, description?: string) {
  // The description goes on the inner schema: describing the wrapping union confuses the
  // OpenAPI generator (it would document the field as accepting only "").
  const inner = description ? schema.describe(description) : schema
  return z
    .union([z.literal(''), z.null(), inner], {
      // Report why the real value failed instead of a generic "Invalid input".
      error: (iss) => (iss.code === 'invalid_union' ? iss.errors.at(-1)?.[0]?.message : undefined),
    })
    .optional()
    .transform((v): Exclude<z.output<T>, ''> | undefined =>
      v === '' || v === null || v === undefined ? undefined : (v as Exclude<z.output<T>, ''>),
    )
}

/** Email address: trimmed and lower-cased before validation. */
export const EmailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(200)
  .pipe(z.email('Please enter a valid email address'))

/** Honeypot: real visitors never see this field, so any value means a bot. */
export const HoneypotField = z.string().max(500).optional().describe('Honeypot — leave empty')
export const TurnstileField = z.string().max(4096).optional().describe('Cloudflare Turnstile token (when enabled)')

/** Shared admin list filters. Dates filter on createdAt (UTC), both ends inclusive. */
export const LeadListFilters = {
  status: LeadStatusEnum.optional(),
  from: DateString.optional().describe('Created on or after (YYYY-MM-DD, UTC)'),
  to: DateString.optional().describe('Created on or before (YYYY-MM-DD, UTC)'),
  q: z.string().trim().max(100).optional(),
}

export const LeadPagination = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
}

/** Admin update of a lead: status and/or private notes ("" or null clears the notes). */
export const leadUpdateFields = {
  status: LeadStatusEnum.optional(),
  internalNotes: z.string().max(10_000).nullable().optional(),
}
