import type { z } from 'zod'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import { tr } from '@/lib/i18n'
import { notFound, validationError } from '@/lib/errors'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { iso } from '@/lib/dates'
import { Tags } from '@/lib/revalidate'
import { verifyTurnstile } from '@/lib/turnstile'
import { toReviewCard } from '@/modules/shared/public-dto'
import { toAdminMediaRef, type AdminMediaRefT } from '@/modules/shared/admin-dto'
import { createReviewsRepository, type AdminReviewRow } from './reviews.repository'
import {
  REVIEW_STATUSES,
  type AdminReview,
  type AdminReviewsQuery,
  type ReviewInputT,
  type ReviewsQuery,
  type ReviewSubmissionT,
} from './reviews.schemas'

const TRAVELLER_TYPES = ['couple', 'family', 'group', 'solo', 'corporate'] as const

export const SUBMISSION_MESSAGE =
  'Thank you for sharing your journey! Your review has been received and will appear on the site once it has been approved.'

/** "2024-02" -> 2024-02-01T00:00:00Z */
const parseMonth = (v: string) => new Date(`${v}-01T00:00:00.000Z`)
const toMonth = (d: Date | null) => (d ? d.toISOString().slice(0, 7) : null)

const round2 = (n: number) => Math.round(n * 100) / 100

function toAdmin(r: AdminReviewRow, refs: Record<string, AdminMediaRefT>): AdminReview {
  return {
    id: r.id,
    guestName: r.guestName,
    email: r.email,
    country: r.country,
    location: r.location,
    partyLabel: r.partyLabel,
    travellerType: r.travellerType,
    tourType: r.tourType,
    tripLabel: r.tripLabel,
    tourId: r.tourId,
    tour: r.tour ? { id: r.tour.id, slug: r.tour.slug, title: tr<string>(r.tour.title, 'en', r.tour.slug) } : null,
    rating: r.rating,
    title: r.title,
    text: r.text,
    photoId: r.photoId,
    photo: toAdminMediaRef(r.photo),
    tripPhotoIds: r.tripPhotoIds,
    tripPhotos: r.tripPhotoIds.map((id) => refs[id]).filter((x): x is AdminMediaRefT => !!x),
    source: r.source,
    travelDate: toMonth(r.travelDate),
    status: r.status,
    isFeatured: r.isFeatured,
    locale: r.locale,
    approvedAt: iso(r.approvedAt),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

function writeData(input: ReviewInputT) {
  return {
    guestName: input.guestName,
    email: input.email,
    country: input.country,
    location: input.location,
    partyLabel: input.partyLabel,
    travellerType: input.travellerType,
    tourType: input.tourType,
    tripLabel: input.tripLabel,
    tourId: input.tourId,
    rating: input.rating,
    title: input.title,
    text: input.text,
    photoId: input.photoId,
    tripPhotoIds: [...new Set(input.tripPhotoIds)],
    source: input.source,
    travelDate: input.travelDate ? parseMonth(input.travelDate) : null,
    status: input.status,
    isFeatured: input.isFeatured,
    locale: input.locale,
  }
}

export function createReviewsService(deps: AppDeps) {
  const repo = createReviewsRepository(deps.prisma)

  /** Public settings embed the review summary; tour pages embed their reviews. */
  function revalidate(...tourSlugs: (string | null | undefined)[]) {
    const tours = [...new Set(tourSlugs.filter((s): s is string => !!s))]
    deps.revalidator.revalidate([Tags.reviews, Tags.settings, ...tours.map((s) => Tags.tour(s))])
  }

  async function withRefs(r: AdminReviewRow): Promise<AdminReview> {
    return toAdmin(r, await repo.adminMediaRefs(r.tripPhotoIds))
  }

  async function validate(input: ReviewInputT) {
    if (input.tourId && !(await repo.tourSlugById(input.tourId))) {
      throw validationError([{ path: 'tourId', message: 'Unknown tour' }])
    }
    await repo.assertMedia([
      { path: 'photoId', id: input.photoId },
      ...input.tripPhotoIds.map((id, i) => ({ path: `tripPhotoIds.${i}`, id })),
    ])
  }

  return {
    // ------------------------------------------------------------ public

    async list(q: z.infer<typeof ReviewsQuery>) {
      const countries = q.country ? [...new Set(q.country.toUpperCase().split(','))] : undefined
      const where: Prisma.ReviewWhereInput = {
        ...(q.travellerType ? { travellerType: q.travellerType } : {}),
        ...(countries ? { country: { in: countries } } : {}),
        ...(q.tour ? { tour: { slug: q.tour } } : {}),
        ...(q.featured !== undefined ? { isFeatured: q.featured } : {}),
        ...(q.rating ? { rating: q.rating } : {}),
      }
      const newest: Prisma.ReviewOrderByWithRelationInput[] = [
        { travelDate: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ]
      const orderBy = q.sort === 'rating' ? [{ rating: 'desc' as const }, ...newest] : newest
      const { skip, take } = toSkipTake(q)
      const [rows, total] = await repo.listApproved(where, orderBy, skip, take)
      const photos = await repo.mediaMap(rows.flatMap((r) => r.tripPhotoIds))
      return {
        items: rows.map((r) => toReviewCard(r, q.locale, photos)),
        meta: pageMeta(q, total),
      }
    },

    async summary() {
      const [agg, byType, byRating] = await repo.approvedStats()
      const types: Record<string, number> = Object.fromEntries(TRAVELLER_TYPES.map((t) => [t, 0]))
      for (const g of byType) types[g.travellerType] = g._count._all
      const ratings: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      for (const g of byRating) ratings[String(g.rating)] = g._count._all
      return {
        average: round2(agg._avg.rating ?? 0),
        count: agg._count,
        byTravellerType: types,
        byRating: ratings,
      }
    },

    /** Guest submission: saved as pending for moderation; nothing is published until approved. */
    async submit(body: ReviewSubmissionT, ip: string) {
      // Honeypot filled: pretend success so bots learn nothing.
      if (body.website && body.website.trim() !== '') return { message: SUBMISSION_MESSAGE }
      await verifyTurnstile(deps.env.TURNSTILE_SECRET, body.turnstileToken, ip)

      const tour = body.tourSlug ? await repo.findTourBySlug(body.tourSlug) : null
      await repo.createSubmission({
        guestName: body.guestName,
        email: body.email,
        country: body.country,
        location: body.location || null,
        travellerType: body.travellerType,
        tourId: tour?.id ?? null,
        rating: body.rating,
        title: body.title || null,
        text: body.text,
        travelDate: body.travelDate ? parseMonth(body.travelDate) : null,
        locale: body.locale,
        status: 'pending',
        source: 'direct',
      })
      return { message: SUBMISSION_MESSAGE }
    },

    // ------------------------------------------------------------ admin

    async adminList(q: z.infer<typeof AdminReviewsQuery>) {
      const base: Prisma.ReviewWhereInput = {
        ...(q.travellerType ? { travellerType: q.travellerType } : {}),
        ...(q.featured !== undefined ? { isFeatured: q.featured } : {}),
        ...(q.q
          ? {
              OR: [
                { guestName: { contains: q.q, mode: 'insensitive' } },
                { email: { contains: q.q, mode: 'insensitive' } },
                { title: { contains: q.q, mode: 'insensitive' } },
                { text: { contains: q.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      }
      const where = q.status ? { ...base, status: q.status } : base
      const { skip, take } = toSkipTake(q)
      const [[rows, total], grouped] = await Promise.all([repo.adminList(where, skip, take), repo.countsByStatus(base)])
      const refs = await repo.adminMediaRefs(rows.flatMap((r) => r.tripPhotoIds))
      const counts = Object.fromEntries(REVIEW_STATUSES.map((s) => [s, 0])) as Record<(typeof REVIEW_STATUSES)[number], number>
      for (const g of grouped) counts[g.status] = g._count._all
      return { items: rows.map((r) => toAdmin(r, refs)), meta: pageMeta(q, total), counts }
    },

    async adminGet(id: string): Promise<AdminReview> {
      const r = await repo.adminFindById(id)
      if (!r) throw notFound('Review')
      return withRefs(r)
    },

    async create(input: ReviewInputT): Promise<AdminReview> {
      await validate(input)
      const r = await repo.create({
        ...writeData(input),
        approvedAt: input.status === 'approved' ? new Date() : null,
      })
      revalidate(r.tour?.slug)
      return withRefs(r)
    },

    async update(id: string, input: ReviewInputT): Promise<AdminReview> {
      const existing = await repo.findState(id)
      if (!existing) throw notFound('Review')
      await validate(input)
      const approvedAt = input.status === 'approved' ? (existing.approvedAt ?? new Date()) : null
      const r = await repo.update(id, { ...writeData(input), approvedAt })
      revalidate(existing.tour?.slug, r.tour?.slug)
      return withRefs(r)
    },

    async setStatus(id: string, status: (typeof REVIEW_STATUSES)[number]): Promise<AdminReview> {
      const existing = await repo.findState(id)
      if (!existing) throw notFound('Review')
      const approvedAt = status === 'approved' ? (existing.approvedAt ?? new Date()) : null
      const r = await repo.update(id, { status, approvedAt })
      revalidate(r.tour?.slug)
      return withRefs(r)
    },

    async setFeatured(id: string, isFeatured: boolean): Promise<AdminReview> {
      if (!(await repo.findState(id))) throw notFound('Review')
      const r = await repo.update(id, { isFeatured })
      revalidate(r.tour?.slug)
      return withRefs(r)
    },

    async remove(id: string) {
      const existing = await repo.findState(id)
      if (!existing) throw notFound('Review')
      await repo.delete(id)
      revalidate(existing.tour?.slug)
    },
  }
}

export type ReviewsService = ReturnType<typeof createReviewsService>
