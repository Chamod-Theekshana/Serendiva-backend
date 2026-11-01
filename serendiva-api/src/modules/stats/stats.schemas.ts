import { z } from 'zod'
import { AdminInquiryListItem } from '@/modules/inquiries/inquiries.schemas'

const count = z.number().int()

export const AdminStatsSchema = z
  .object({
    inquiries: z.object({
      new: count.describe('Inquiries with status "new"'),
      thisWeek: count.describe('Received since Monday 00:00 UTC'),
      thisMonth: count.describe('Received since the 1st of the month, 00:00 UTC'),
      total: count,
      byStatus: z.object({ new: count, replied: count, closed: count }),
      conversionRate: z.number().min(0).max(1).describe('(replied + closed) / total, 0 when there are none'),
      byMonth: z
        .array(z.object({ month: z.string().meta({ example: '2026-10' }), count }))
        .describe('Last 12 months (UTC), oldest first, including months without inquiries'),
      byCountry: z
        .array(z.object({ country: z.string(), count }))
        .describe('Top 10; inquiries without a country are grouped as "Unknown"'),
      byTour: z
        .array(z.object({ tourId: z.string(), slug: z.string(), title: z.string().describe('English title'), count }))
        .describe('Top 10 tours mentioned in inquiries'),
      bySource: z
        .array(z.object({ source: z.string().meta({ example: '/tours' }), count }))
        .describe('Top 10 by first path segment of the page the form was sent from ("/" = home, "Unknown" = not sent)'),
      latest: z.array(AdminInquiryListItem).describe('5 most recent inquiries'),
    }),
    proposals: z.object({ new: count, total: count }),
    reviews: z.object({ pending: count }),
    newsletter: z.object({ confirmed: count, pending: count }),
  })
  .meta({ id: 'AdminStats' })

export type AdminStats = z.infer<typeof AdminStatsSchema>
