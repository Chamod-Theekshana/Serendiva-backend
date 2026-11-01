import { z } from 'zod'

export const AvailabilityTypeEnum = z.enum(['busy', 'available']).meta({ id: 'AvailabilityType' })

const DateOnly = z.iso.date().describe('YYYY-MM-DD')

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const AvailabilityQuery = z
  .object({
    from: DateOnly.optional().describe('Start of the window (default: today)'),
    to: DateOnly.optional().describe('End of the window (default: 12 months after `from`)'),
  })
  .refine((q) => !q.from || !q.to || q.to >= q.from, { message: '`to` must not be before `from`', path: ['to'] })

export const AvailabilityRangeSchema = z
  .object({
    id: z.string(),
    startDate: z.string().describe('YYYY-MM-DD (inclusive)'),
    endDate: z.string().describe('YYYY-MM-DD (inclusive)'),
    type: AvailabilityTypeEnum,
  })
  .meta({ id: 'AvailabilityRange' })

export const AvailabilityCalendarSchema = z
  .object({
    from: z.string(),
    to: z.string(),
    ranges: z.array(AvailabilityRangeSchema).describe('Ranges overlapping the window, by start date'),
  })
  .meta({ id: 'AvailabilityCalendar' })

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const AvailabilityInput = z
  .object({
    startDate: DateOnly,
    endDate: DateOnly,
    type: AvailabilityTypeEnum.default('busy'),
    note: z.string().trim().max(500).nullable().default(null).describe('Private note, never shown publicly'),
  })
  .refine((r) => r.endDate >= r.startDate, { message: 'End date must be on or after the start date', path: ['endDate'] })
  .meta({ id: 'AvailabilityWrite' })

export type AvailabilityInputT = z.infer<typeof AvailabilityInput>

export const AdminAvailabilityQuery = z.object({
  from: DateOnly.optional(),
  to: DateOnly.optional(),
})

export const AdminAvailabilityRangeSchema = AvailabilityRangeSchema.extend({
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).meta({ id: 'AdminAvailabilityRange' })

export const AdminAvailabilityListSchema = z
  .array(AdminAvailabilityRangeSchema)
  .meta({ id: 'AdminAvailabilityList' })

export type AdminAvailabilityRange = z.infer<typeof AdminAvailabilityRangeSchema>
