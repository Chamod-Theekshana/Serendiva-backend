import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import { compactTranslatable, tr, trList, trOrNull, type Locale } from '@/lib/i18n'
import { toImage, type MediaLike } from '@/lib/media-dto'
import { notFound } from '@/lib/errors'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { iso } from '@/lib/dates'
import { Tags } from '@/lib/revalidate'
import { toCategoryRef, toFaqItem, toReviewCard } from '@/modules/shared/public-dto'
import { asRecord, asRecordRequired, toAdminMediaRef, translationFlags } from '@/modules/shared/admin-dto'
import {
  createToursRepository,
  type AdminTourRow,
  type TourCardRow,
  type TourDetailRow,
} from './tours.repository'
import type { AdminTour, TourCard, TourDetail, TourInputT } from './tours.schemas'
import type { z } from 'zod'
import type { ToursQuery } from './tours.schemas'

type ToursQueryT = z.infer<typeof ToursQuery>

const DURATION_RANGES: Record<string, [number, number]> = {
  '1-3': [1, 3],
  '4-7': [4, 7],
  '8-11': [8, 11],
  '12+': [12, 365],
}

export function toTourCard(t: TourCardRow, locale: Locale): TourCard {
  const title = tr<string>(t.title, locale, t.slug)
  return {
    id: t.id,
    slug: t.slug,
    title,
    summary: tr<string>(t.summary, locale, ''),
    cardTag: trOrNull<string>(t.cardTag, locale),
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    route: t.route,
    highlights: trList<string>(t.highlights, locale),
    isFeatured: t.isFeatured,
    isMostPopular: t.isMostPopular,
    cover: toImage(t.cover, locale, title),
    categories: [...t.categories]
      .sort((a, b) => a.category.order - b.category.order)
      .map((c) => toCategoryRef(c.category, locale)),
    travellerTypes: t.travellerTypes,
    seasons: t.seasons,
  }
}

/** Plain lowercase text used for free-text search across all locales. */
function searchText(t: TourCardRow): string {
  const parts: string[] = [t.slug, ...t.route]
  for (const v of [t.title, t.summary, t.highlights, t.cardTag]) {
    if (v && typeof v === 'object') parts.push(JSON.stringify(v))
  }
  for (const c of t.categories) parts.push(JSON.stringify(c.category.name), c.category.slug)
  return parts.join(' ').toLowerCase()
}

export function createToursService(deps: AppDeps) {
  const repo = createToursRepository(deps.prisma)

  function filterTours(all: TourCardRow[], q: Omit<ToursQueryT, 'category'> & { category?: string }) {
    let items = all
    if (q.category) items = items.filter((t) => t.categories.some((c) => c.category.slug === q.category))
    const range = q.duration ? DURATION_RANGES[q.duration] : undefined
    const min = q.minDays ?? range?.[0]
    const max = q.maxDays ?? range?.[1]
    if (min !== undefined) items = items.filter((t) => t.durationDays >= min)
    if (max !== undefined) items = items.filter((t) => t.durationDays <= max)
    if (q.featured !== undefined) items = items.filter((t) => t.isFeatured === q.featured)
    if (q.travellerType) items = items.filter((t) => t.travellerTypes.includes(q.travellerType!))
    if (q.q) {
      const terms = q.q.toLowerCase().split(/\s+/).filter(Boolean)
      items = items.filter((t) => {
        const hay = searchText(t)
        return terms.every((term) => hay.includes(term))
      })
    }
    return items
  }

  return {
    /**
     * Public listing. The catalogue of a one-person business is small (tens of tours), so filtering,
     * search and pagination happen in memory on the published set — simple and locale-aware.
     */
    async list(q: ToursQueryT) {
      const all = await repo.listPublished()
      let items = filterTours(all, q)

      if (q.sort === 'duration-asc') items = [...items].sort((a, b) => a.durationDays - b.durationDays)
      if (q.sort === 'duration-desc') items = [...items].sort((a, b) => b.durationDays - a.durationDays)
      if (q.sort === 'newest')
        items = [...items].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))

      // Facet counts ignore the category filter so chips can show "(n)" for every category.
      const forFacets = filterTours(all, { ...q, category: undefined })
      const counts = new Map<string, { ref: ReturnType<typeof toCategoryRef>; count: number; order: number }>()
      for (const t of forFacets) {
        for (const c of t.categories) {
          const entry = counts.get(c.category.id) ?? {
            ref: toCategoryRef(c.category, q.locale),
            count: 0,
            order: c.category.order,
          }
          entry.count++
          counts.set(c.category.id, entry)
        }
      }

      const { skip, take } = toSkipTake(q)
      return {
        items: items.slice(skip, skip + take).map((t) => toTourCard(t, q.locale)),
        meta: pageMeta(q, items.length),
        facets: {
          categories: [...counts.values()]
            .sort((a, b) => a.order - b.order)
            .map((e) => ({ ...e.ref, count: e.count })),
          total: forFacets.length,
        },
      }
    },

    async detail(slug: string, locale: Locale): Promise<TourDetail> {
      const t = await repo.findPublishedBySlug(slug)
      if (!t) throw notFound('Tour')

      const [reviews, stats, all] = await Promise.all([
        repo.approvedReviewsForTour(t.id, 6),
        repo.reviewStatsForTour(t.id),
        repo.listPublished(),
      ])

      const photoIds = [...new Set(reviews.flatMap((r) => r.tripPhotoIds))]
      const photos = new Map<string, MediaLike>((await repo.mediaByIds(photoIds)).map((m) => [m.id, m]))

      // Related: share a category first, then featured tours, never itself.
      const catIds = new Set(t.categories.map((c) => c.categoryId))
      const others = all.filter((o) => o.id !== t.id)
      const related = [
        ...others.filter((o) => o.categories.some((c) => catIds.has(c.categoryId))),
        ...others.filter((o) => o.isFeatured),
        ...others,
      ]
      const relatedUnique = [...new Map(related.map((o) => [o.id, o])).values()].slice(0, 3)

      return mapDetail(t, locale, {
        reviews: reviews.map((r) => toReviewCard(r, locale, photos)),
        reviewSummary: {
          average: Math.round((stats._avg.rating ?? 0) * 100) / 100,
          count: stats._count,
        },
        related: relatedUnique.map((o) => toTourCard(o, locale)),
      })
    },

    // ---------------------------------------------------------------- admin

    async adminList(q: { q?: string; status?: 'draft' | 'published'; page: number; pageSize: number }) {
      const where: Prisma.TourWhereInput = {
        ...(q.status ? { status: q.status } : {}),
        ...(q.q
          ? {
              OR: [
                { slug: { contains: q.q.toLowerCase() } },
                { title: { path: ['en'], string_contains: q.q } },
              ],
            }
          : {}),
      }
      const { skip, take } = toSkipTake(q)
      const [rows, total] = await repo.adminList(where, skip, take)
      return {
        items: rows.map((t) => ({
          id: t.id,
          slug: t.slug,
          title: tr<string>(t.title, 'en', t.slug),
          status: t.status,
          order: t.order,
          isFeatured: t.isFeatured,
          isMostPopular: t.isMostPopular,
          durationDays: t.durationDays,
          durationNights: t.durationNights,
          cover: toAdminMediaRef(t.cover),
          categories: t.categories.map((c) => tr<string>(c.category.name, 'en', '')),
          translations: translationFlags(t.title),
          publishedAt: iso(t.publishedAt),
          updatedAt: t.updatedAt.toISOString(),
        })),
        meta: pageMeta(q, total),
      }
    },

    async adminGet(id: string): Promise<AdminTour> {
      const t = await repo.adminFindById(id)
      if (!t) throw notFound('Tour')
      return mapAdmin(t)
    },

    async create(input: TourInputT): Promise<AdminTour> {
      const id = await repo.create(normalize(input))
      deps.revalidator.revalidate([Tags.tours, Tags.tour(input.slug), Tags.sitemap])
      return this.adminGet(id)
    },

    async update(id: string, input: TourInputT): Promise<AdminTour> {
      const existing = await repo.findSlugById(id)
      if (!existing) throw notFound('Tour')
      const publishedAt = input.status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt
      await repo.update(id, normalize(input), publishedAt)
      deps.revalidator.revalidate([Tags.tours, Tags.tour(existing.slug), Tags.tour(input.slug), Tags.sitemap])
      return this.adminGet(id)
    },

    async setStatus(id: string, status: 'draft' | 'published') {
      const existing = await repo.findSlugById(id)
      if (!existing) throw notFound('Tour')
      const publishedAt = status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt
      await repo.setStatus(id, status, publishedAt)
      deps.revalidator.revalidate([Tags.tours, Tags.tour(existing.slug), Tags.sitemap])
      return this.adminGet(id)
    },

    async reorder(items: { id: string; order: number }[]) {
      await repo.reorder(items)
      deps.revalidator.revalidate([Tags.tours])
    },

    async remove(id: string) {
      const existing = await repo.findSlugById(id)
      if (!existing) throw notFound('Tour')
      await repo.delete(id)
      deps.revalidator.revalidate([Tags.tours, Tags.tour(existing.slug), Tags.sitemap])
    },
  }
}

/** Strip empty optional translations before saving. */
function normalize(input: TourInputT): TourInputT {
  const c = compactTranslatable
  return {
    ...input,
    cardTag: c(input.cardTag) as TourInputT['cardTag'],
    badges: c(input.badges) as TourInputT['badges'],
    overview: c(input.overview) as TourInputT['overview'],
    keyFeatures: c(input.keyFeatures) as TourInputT['keyFeatures'],
    terrains: c(input.terrains) as TourInputT['terrains'],
    routeSummary: c(input.routeSummary) as TourInputT['routeSummary'],
    seoTitle: c(input.seoTitle) as TourInputT['seoTitle'],
    seoDescription: c(input.seoDescription) as TourInputT['seoDescription'],
    gallery: input.gallery.map((g) => ({ ...g, caption: c(g.caption) as typeof g.caption })),
    days: input.days.map((d) => ({
      ...d,
      overnightArea: c(d.overnightArea) as typeof d.overnightArea,
      meals: c(d.meals) as typeof d.meals,
      drivingTime: c(d.drivingTime) as typeof d.drivingTime,
      details: c(d.details) as typeof d.details,
    })),
  }
}

function mapDetail(
  t: TourDetailRow,
  locale: Locale,
  extra: Pick<TourDetail, 'reviews' | 'reviewSummary' | 'related'>,
): TourDetail {
  const card = toTourCard(t, locale)
  const seoTitle = trOrNull<string>(t.seoTitle, locale) ?? `${card.title} · ${t.durationNights} Nights / ${t.durationDays} Days`
  const seoDescription = trOrNull<string>(t.seoDescription, locale) ?? card.summary.slice(0, 160)
  return {
    ...card,
    description: tr<string>(t.description, locale, ''),
    badges: trList<string>(t.badges, locale),
    overview: trOrNull(t.overview, locale),
    keyFeatures: trList(t.keyFeatures, locale),
    included: trList(t.included, locale),
    notIncluded: trList(t.notIncluded, locale),
    terrains: trList(t.terrains, locale),
    routeSummary: trOrNull<string>(t.routeSummary, locale),
    gallery: t.gallery
      .map((g) => {
        const cap = trOrNull<{ title?: string; caption?: string }>(g.caption, locale)
        const image = toImage(g.media, locale, cap?.title ?? card.title)
        return image ? { image, title: cap?.title ?? null, caption: cap?.caption ?? null } : null
      })
      .filter((g): g is NonNullable<typeof g> => g !== null),
    days: t.days.map((d) => ({
      dayNumber: d.dayNumber,
      title: tr<string>(d.title, locale, `Day ${d.dayNumber}`),
      description: tr<string>(d.description, locale, ''),
      overnightArea: trOrNull<string>(d.overnightArea, locale),
      meals: trOrNull<string>(d.meals, locale),
      drivingTime: trOrNull<string>(d.drivingTime, locale),
      details: trList(d.details, locale),
      isHighlight: d.isHighlight,
      stops: Array.isArray(d.stops) ? (d.stops as { name: string; lat: number; lng: number }[]) : [],
    })),
    destinations: t.destinations
      .filter((d) => d.destination.status === 'published')
      .map((d) => ({ slug: d.destination.slug, name: tr<string>(d.destination.name, locale, d.destination.slug) })),
    faqs: t.faqs.map((f) => toFaqItem(f, locale)),
    seo: { title: seoTitle, description: seoDescription, image: card.cover },
    updatedAt: t.updatedAt.toISOString(),
    ...extra,
  }
}

function mapAdmin(t: AdminTourRow): AdminTour {
  const R = asRecord
  return {
    id: t.id,
    slug: t.slug,
    status: t.status,
    order: t.order,
    isFeatured: t.isFeatured,
    isMostPopular: t.isMostPopular,
    title: asRecordRequired<string>(t.title, ''),
    summary: asRecordRequired<string>(t.summary, ''),
    description: asRecordRequired<string>(t.description, ''),
    cardTag: R<string>(t.cardTag),
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    route: t.route,
    highlights: asRecordRequired<string[]>(t.highlights, []),
    badges: R<string[]>(t.badges),
    overview: R(t.overview) as AdminTour['overview'],
    keyFeatures: R(t.keyFeatures) as AdminTour['keyFeatures'],
    included: asRecordRequired(t.included, []) as AdminTour['included'],
    notIncluded: asRecordRequired(t.notIncluded, []) as AdminTour['notIncluded'],
    terrains: R(t.terrains) as AdminTour['terrains'],
    routeSummary: R<string>(t.routeSummary),
    travellerTypes: t.travellerTypes,
    seasons: t.seasons,
    coverId: t.coverId,
    cover: toAdminMediaRef(t.cover),
    gallery: t.gallery.map((g) => ({
      mediaId: g.mediaId,
      media: toAdminMediaRef(g.media)!,
      caption: R(g.caption) as AdminTour['gallery'][number]['caption'],
    })),
    days: t.days.map((d) => ({
      dayNumber: d.dayNumber,
      title: asRecordRequired<string>(d.title, ''),
      description: asRecordRequired<string>(d.description, ''),
      overnightArea: R<string>(d.overnightArea),
      meals: R<string>(d.meals),
      drivingTime: R<string>(d.drivingTime),
      details: R(d.details) as AdminTour['days'][number]['details'],
      isHighlight: d.isHighlight,
      stops: Array.isArray(d.stops) ? (d.stops as { name: string; lat: number; lng: number }[]) : [],
    })),
    categoryIds: t.categories.map((c) => c.categoryId),
    destinationIds: t.destinations.map((d) => d.destinationId),
    seoTitle: R<string>(t.seoTitle),
    seoDescription: R<string>(t.seoDescription),
    publishedAt: iso(t.publishedAt),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

export type ToursService = ReturnType<typeof createToursService>
