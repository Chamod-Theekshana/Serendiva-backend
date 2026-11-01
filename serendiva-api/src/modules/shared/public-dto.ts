import { z } from 'zod'
import { ImageSchema } from '@/lib/schemas'
import { toImage, type MediaLike } from '@/lib/media-dto'
import { tr, trOrNull, type Locale } from '@/lib/i18n'
import { iso } from '@/lib/dates'

/**
 * Public DTOs shared by several modules (tour detail embeds reviews & FAQs, etc.).
 * All text is already localized for the requested locale.
 */

export const TravellerTypeEnum = z.enum(['couple', 'family', 'group', 'solo', 'corporate']).meta({ id: 'TravellerType' })
export const ReviewSourceEnum = z.enum(['direct', 'tripadvisor', 'google']).meta({ id: 'ReviewSource' })

export const CategoryRefSchema = z
  .object({ id: z.string(), slug: z.string(), name: z.string(), shortName: z.string() })
  .meta({ id: 'CategoryRef' })

export function toCategoryRef(c: { id: string; slug: string; name: unknown; shortName: unknown }, locale: Locale) {
  const name = tr<string>(c.name, locale, c.slug)
  return { id: c.id, slug: c.slug, name, shortName: trOrNull<string>(c.shortName, locale) ?? name }
}

export const FaqItemSchema = z
  .object({ id: z.string(), question: z.string(), answer: z.string() })
  .meta({ id: 'FaqItem' })

export function toFaqItem(f: { id: string; question: unknown; answer: unknown }, locale: Locale) {
  return { id: f.id, question: tr<string>(f.question, locale, ''), answer: tr<string>(f.answer, locale, '') }
}

export const ReviewCardSchema = z
  .object({
    id: z.string(),
    guestName: z.string(),
    initials: z.string(),
    country: z.string().describe('ISO 3166-1 alpha-2 code'),
    location: z.string().nullable(),
    partyLabel: z.string().nullable(),
    travellerType: TravellerTypeEnum,
    tourType: z.string().nullable(),
    tripLabel: z.string().nullable(),
    tour: z.object({ slug: z.string(), title: z.string() }).nullable(),
    rating: z.number().int().min(1).max(5),
    title: z.string().nullable(),
    text: z.string(),
    photo: ImageSchema.nullable(),
    tripPhotos: z.array(ImageSchema),
    source: ReviewSourceEnum,
    travelDate: z.string().nullable(),
    isFeatured: z.boolean(),
    createdAt: z.string(),
  })
  .meta({ id: 'ReviewCard' })

export type ReviewCard = z.infer<typeof ReviewCardSchema>

export function initialsOf(name: string): string {
  const words = (s: string) =>
    s
      .replace(/\b(dr|mr|mrs|ms|prof|lord|lady)\.?\s+/gi, '')
      .split(/\s+/)
      .filter((w) => /^\p{L}/u.test(w))
  const generic = /^(family|friends|group|team|party|colleagues)$/i
  const [leftRaw = '', rightRaw = ''] = name.split(/\s*(?:&|\band\b)\s*/i)
  const left = words(leftRaw)
  const right = words(rightRaw).filter((w) => !generic.test(w))
  const first = left[0]?.[0] ?? '?'
  // "Julian & Claire Montgomery" -> JM, "David Chen & Family" -> DC, "Beatrix Von Berg" -> BB
  const lastWord = right.length ? right[right.length - 1] : left.length > 1 ? left[left.length - 1] : ''
  return (first + (lastWord?.[0] ?? '')).toUpperCase()
}

export interface ReviewRow {
  id: string
  guestName: string
  country: string
  location: string | null
  partyLabel: string | null
  travellerType: z.infer<typeof TravellerTypeEnum>
  tourType: string | null
  tripLabel: string | null
  rating: number
  title: string | null
  text: string
  source: z.infer<typeof ReviewSourceEnum>
  travelDate: Date | null
  isFeatured: boolean
  createdAt: Date
  tripPhotoIds: string[]
  photo: MediaLike | null
  tour: { slug: string; title: unknown } | null
}

/** `tripPhotos` must be pre-resolved (Media rows by id) by the caller. */
export function toReviewCard(r: ReviewRow, locale: Locale, tripPhotos: Map<string, MediaLike>): ReviewCard {
  return {
    id: r.id,
    guestName: r.guestName,
    initials: initialsOf(r.guestName),
    country: r.country,
    location: r.location,
    partyLabel: r.partyLabel,
    travellerType: r.travellerType,
    tourType: r.tourType,
    tripLabel: r.tripLabel,
    tour: r.tour ? { slug: r.tour.slug, title: tr<string>(r.tour.title, locale, r.tour.slug) } : null,
    rating: r.rating,
    title: r.title,
    text: r.text,
    photo: toImage(r.photo, locale, r.guestName),
    tripPhotos: r.tripPhotoIds
      .map((id) => toImage(tripPhotos.get(id), locale, `Photo from ${r.guestName}'s journey`))
      .filter((x): x is NonNullable<typeof x> => x !== null),
    source: r.source,
    travelDate: iso(r.travelDate),
    isFeatured: r.isFeatured,
    createdAt: r.createdAt.toISOString(),
  }
}

/** Prisma include for ReviewRow */
export const reviewInclude = {
  photo: { select: { id: true, url: true, width: true, height: true, blurDataUrl: true, variants: true, altText: true } },
  tour: { select: { slug: true, title: true } },
} as const

export const ReviewSummarySchema = z
  .object({
    average: z.number(),
    count: z.number().int(),
    byTravellerType: z.record(z.string(), z.number().int()),
    byRating: z.record(z.string(), z.number().int()),
  })
  .meta({ id: 'ReviewSummary' })

export const SeoSchema = z
  .object({ title: z.string(), description: z.string(), image: ImageSchema.nullable() })
  .meta({ id: 'Seo' })
