import type { AppDeps } from '@/types'
import { tr } from '@/lib/i18n'
import { toAdminInquiryListItem } from '@/modules/inquiries/inquiries.service'
import { countsFrom } from '@/modules/inquiries/lead-helpers'
import { createStatsRepository } from './stats.repository'
import type { AdminStats } from './stats.schemas'

const TOP = 10
const LOCALE_SEGMENTS = new Set(['en', 'zh', 'de'])

/**
 * Group a source page by its first path segment: "/tours/cultural-odyssey" -> "/tours",
 * "/de/contact?x=1" -> "/contact", "https://site/" -> "/". Missing values are "Unknown".
 */
export function sourceGroup(sourcePage: string | null): string {
  const raw = sourcePage?.trim()
  if (!raw) return 'Unknown'
  let path = raw
  if (/^https?:\/\//i.test(raw)) {
    try {
      path = new URL(raw).pathname
    } catch {
      return 'Unknown'
    }
  }
  const segments = path.split(/[?#]/)[0]!.split('/').filter(Boolean)
  if (segments[0] && LOCALE_SEGMENTS.has(segments[0].toLowerCase())) segments.shift()
  return segments[0] ? `/${segments[0].toLowerCase()}` : '/'
}

const utcDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
const monthKey = (d: Date) => d.toISOString().slice(0, 7)

export function createStatsService(deps: AppDeps) {
  const repo = createStatsRepository(deps.prisma)

  return {
    async dashboard(now = new Date()): Promise<AdminStats> {
      const today = utcDay(now)
      const weekStart = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * 86_400_000)
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      const firstMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1))

      const [statusGroups, thisWeek, thisMonth, months, countries, tourGroups, sourceGroups, latest, proposals, pendingReviews, newsletter] =
        await Promise.all([
          repo.inquiryStatusCounts(),
          repo.inquiriesSince(weekStart),
          repo.inquiriesSince(monthStart),
          repo.inquiriesByMonth(firstMonth),
          repo.inquiriesByCountry(TOP),
          repo.inquiriesByTour(TOP),
          repo.inquiriesBySourcePage(),
          repo.latestInquiries(5),
          repo.proposalCounts(),
          repo.pendingReviews(),
          repo.newsletterCounts(),
        ])

      const counts = countsFrom(statusGroups)

      const perMonth = new Map(months.map((m) => [m.month, m.count]))
      const byMonth = Array.from({ length: 12 }, (_, i) => {
        const month = monthKey(new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + i, 1)))
        return { month, count: perMonth.get(month) ?? 0 }
      })

      const tourIds = tourGroups.map((g) => g.tourId).filter((id): id is string => id !== null)
      const tours = new Map((await repo.toursByIds(tourIds)).map((t) => [t.id, t]))
      const byTour = tourGroups.flatMap((g) => {
        const t = g.tourId ? tours.get(g.tourId) : undefined
        return t ? [{ tourId: t.id, slug: t.slug, title: tr<string>(t.title, 'en', t.slug), count: g._count._all }] : []
      })

      const sources = new Map<string, number>()
      for (const g of sourceGroups) {
        const key = sourceGroup(g.sourcePage)
        sources.set(key, (sources.get(key) ?? 0) + g._count._all)
      }
      const bySource = [...sources.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source))
        .slice(0, TOP)

      return {
        inquiries: {
          new: counts.new,
          thisWeek,
          thisMonth,
          total: counts.total,
          byStatus: { new: counts.new, replied: counts.replied, closed: counts.closed },
          conversionRate: counts.total ? Math.round(((counts.replied + counts.closed) / counts.total) * 1000) / 1000 : 0,
          byMonth,
          byCountry: countries.map((c) => ({ country: c.country, count: c.count })),
          byTour,
          bySource,
          latest: latest.map(toAdminInquiryListItem),
        },
        proposals: { new: proposals[0], total: proposals[1] },
        reviews: { pending: pendingReviews },
        newsletter: { confirmed: newsletter[0], pending: newsletter[1] },
      }
    },
  }
}
