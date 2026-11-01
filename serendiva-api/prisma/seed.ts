/**
 * Database seed — `npm run db:seed`
 *
 *   npm run db:seed                       admin user + full sample content reset
 *   npm run db:seed -- --skip-content     admin user only (safe for production)
 *   npm run db:seed -- --force            allow the content reset when NODE_ENV=production
 *
 * 1. Admin user from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD / ADMIN_SEED_NAME. Created when missing; an
 *    existing admin's password is never changed.
 * 2. Content reset + insert inside ONE transaction (all or nothing), idempotent:
 *    - child/content rows without a natural key (tour days & images, links, FAQs, reviews, gallery,
 *      availability, settings) are deleted and recreated;
 *    - tours, destinations, regions, categories and blog posts are upserted by slug, so their ids stay
 *      stable across runs (inquiries keep their tour/destination link); rows whose slug is not in the
 *      seed data are deleted;
 *    - Media rows with a `seed/` key are upserted by key. Rows already processed by
 *      `npm run media:import-seed` (size > 0 or variants set) keep their stored file; stale ones are removed.
 *    Inquiries, corporate proposals, newsletter subscribers, admin users, refresh tokens and uploaded
 *    (non-seed) media are never touched.
 *
 * Every record is validated with the same Zod write schema the admin API uses, so the admin editor can
 * open and save everything the seed creates. Content lives in prisma/seed-data/ (placeholder sample
 * content from the client's design — to be replaced by the client).
 */
import argon2 from 'argon2'
import { z } from 'zod'
import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { createPrisma } from '@/lib/prisma'
import { compactTranslatable, tr } from '@/lib/i18n'
import { jsonValue as J, optJson } from '@/lib/json'
import { parseDate } from '@/lib/dates'
import { CategoryInput } from '@/modules/categories/categories.schemas'
import {
  DestinationInput,
  RegionInput,
  type DestinationInputT,
} from '@/modules/destinations/destinations.schemas'
import { TourInput, type TourInputT } from '@/modules/tours/tours.schemas'
import { ReviewInput } from '@/modules/reviews/reviews.schemas'
import { FaqInput } from '@/modules/faqs/faqs.schemas'
import { BlogPostInput } from '@/modules/blog/blog.schemas'
import { readingTimeOf } from '@/modules/blog/blog.headings'
import { GalleryItemInput } from '@/modules/gallery/gallery.schemas'
import { AvailabilityInput } from '@/modules/availability/availability.schemas'
import { SETTING_KEYS, SettingValueSchemas, type SettingKey } from '@/modules/settings/settings.schemas'
import { IMAGES, type ImageKey } from './seed-data/images'
import { categories } from './seed-data/categories'
import { regions } from './seed-data/regions'
import { destinations } from './seed-data/destinations'
import { tours } from './seed-data/tours'
import { reviews } from './seed-data/reviews'
import { bookingFaqs, corporateFaqs, destinationFaqs, generalFaqs, tourFaqs } from './seed-data/faqs'
import { blogPosts } from './seed-data/blog'
import { galleryItems } from './seed-data/gallery'
import { availability } from './seed-data/availability'
import * as settings from './seed-data/settings'
import type { SeedCaptionedImage, SeedFaq } from './seed-data/types'

type Tx = Prisma.TransactionClient

const DAY_MS = 86_400_000
const SEED_PREFIX = 'seed/'

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const en = <T>(value: T) => ({ en: value })
const enOpt = <T>(value: T | null | undefined) =>
  value === undefined || value === null ? null : { en: value }
/** Optional translatable JSON column: drop empty locales (as the admin services do), NULL when empty. */
const O = (value: Parameters<typeof compactTranslatable>[0]) => optJson(compactTranslatable(value))

const daysAgo = (now: Date, days: number) => new Date(now.getTime() - days * DAY_MS)
const isoDay = (d: Date) => d.toISOString().slice(0, 10)

/** Look up a slug/key or fail loudly with a helpful message. */
function need<V>(map: Map<string, V>, key: string, what: string): V {
  const value = map.get(key)
  if (value === undefined) throw new Error(`Seed data references unknown ${what} "${key}"`)
  return value
}

/** Parse with a write schema, naming the record in the error message. */
function validate<S extends z.ZodType>(schema: S, value: unknown, label: string): z.output<S> {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new Error(`Invalid seed record ${label}:\n${z.prettifyError(result.error)}`)
  }
  return result.data
}

const captioned = (images: SeedCaptionedImage[], media: (key: ImageKey) => string) =>
  images.map((g) => ({
    mediaId: media(g.image),
    caption: g.title || g.caption ? en({ title: g.title, caption: g.caption }) : null,
  }))

// ---------------------------------------------------------------------------
// 1. Admin user
// ---------------------------------------------------------------------------

const AdminSeedEnv = z.object({
  email: z.email(),
  password: z.string().min(10),
  name: z.string().trim().min(1).max(120),
})

async function seedAdmin(prisma: PrismaClient) {
  const rawEmail = process.env.ADMIN_SEED_EMAIL
  const rawPassword = process.env.ADMIN_SEED_PASSWORD
  if (!rawEmail || !rawPassword) {
    console.warn('⚠ ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD are not set — skipping the admin user.')
    return
  }
  const parsed = AdminSeedEnv.safeParse({
    email: rawEmail.trim().toLowerCase(),
    password: rawPassword,
    name: process.env.ADMIN_SEED_NAME || 'Dinesh Jayasuriya',
  })
  if (!parsed.success) {
    console.warn(
      '⚠ ADMIN_SEED_* is invalid (valid e-mail and a password of 10+ characters required) — skipping the admin user.',
    )
    return
  }
  const { email, password, name } = parsed.data
  const existing = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    console.info(`✓ Admin ${email} already exists — password left unchanged.`)
    return
  }
  await prisma.adminUser.create({ data: { email, name, passwordHash: await argon2.hash(password) } })
  console.info(`✓ Admin ${email} created.`)
}

// ---------------------------------------------------------------------------
// 2. Content
// ---------------------------------------------------------------------------

async function resetContent(tx: Tx) {
  // Rows without a natural key: delete and recreate.
  await tx.tourDay.deleteMany({})
  await tx.tourImage.deleteMany({})
  await tx.tourCategory.deleteMany({})
  await tx.tourDestination.deleteMany({})
  await tx.destinationImage.deleteMany({})
  await tx.faq.deleteMany({})
  await tx.review.deleteMany({})
  await tx.galleryItem.deleteMany({})
  await tx.availabilityRange.deleteMany({})
  await tx.siteSetting.deleteMany({})
  // Slugged content: keep the rows the seed upserts (stable ids), remove everything else.
  await tx.tour.deleteMany({ where: { slug: { notIn: tours.map((t) => t.slug) } } })
  await tx.destination.deleteMany({ where: { slug: { notIn: destinations.map((d) => d.slug) } } })
  await tx.blogPost.deleteMany({ where: { slug: { notIn: blogPosts.map((p) => p.slug) } } })
  await tx.category.deleteMany({ where: { slug: { notIn: categories.map((c) => c.slug) } } })
  await tx.region.deleteMany({ where: { slug: { notIn: regions.map((r) => r.slug) } } })
}

async function seedMedia(tx: Tx): Promise<(key: ImageKey) => string> {
  const entries = Object.entries(IMAGES) as [ImageKey, { url: string; alt: string }][]
  const storageKey = (key: ImageKey) => `${SEED_PREFIX}${key}.jpg`
  // `npm run media:import-seed` moves a processed seed image to "media/seed/<key>.webp"; both forms identify the same image.
  const identOf = (k: string) => k.replace(/^(media\/)?seed\//, '').replace(/\.[a-z0-9]{1,5}$/i, '')
  const wanted = new Set(entries.map(([key]) => key as string))

  const existing = await tx.media.findMany({
    where: { OR: [{ key: { startsWith: SEED_PREFIX } }, { key: { startsWith: `media/${SEED_PREFIX}` } }] },
    select: { id: true, key: true, url: true, size: true, variants: true, altText: true },
  })
  const byIdent = new Map<string, (typeof existing)[number]>()
  for (const m of existing) {
    const ident = identOf(m.key)
    const prev = byIdent.get(ident)
    // Prefer the processed row if both exist.
    if (!prev || (prev.size === 0 && m.size > 0)) byIdent.set(ident, m)
  }

  const missing = entries.filter(([key]) => !byIdent.has(key))
  if (missing.length) {
    await tx.media.createMany({
      data: missing.map(([key, img]) => ({
        key: storageKey(key),
        url: img.url,
        mime: 'image/jpeg',
        size: 0,
        width: null,
        height: null,
        altText: J(en(img.alt)),
        originalName: `${key}.jpg`,
      })),
    })
  }

  for (const [key, img] of entries) {
    const row = byIdent.get(key)
    if (!row) continue
    // Already downloaded/processed by `npm run media:import-seed`: keep the stored file, refresh the alt text only.
    const processed = row.size > 0 || row.variants !== null
    const altChanged = tr<string>(row.altText, 'en', '') !== img.alt
    const urlChanged = !processed && row.url !== img.url
    if (altChanged || urlChanged) {
      await tx.media.update({
        where: { id: row.id },
        data: { altText: J(en(img.alt)), ...(urlChanged ? { url: img.url } : {}) },
      })
    }
  }

  const keep = new Set([...byIdent.values()].map((m) => m.id))
  const stale = existing.filter((m) => !keep.has(m.id) || !wanted.has(identOf(m.key))).map((m) => m.id)
  if (stale.length) await tx.media.deleteMany({ where: { id: { in: stale } } })

  const rows = await tx.media.findMany({
    where: { OR: [{ key: { startsWith: SEED_PREFIX } }, { key: { startsWith: `media/${SEED_PREFIX}` } }] },
    select: { id: true, key: true },
  })
  const ids = new Map(rows.map((m) => [identOf(m.key), m.id]))
  return (key: ImageKey) => need(ids, key, 'image')
}

async function seedCategories(tx: Tx, media: (key: ImageKey) => string) {
  const ids = new Map<string, string>()
  for (const [order, c] of categories.entries()) {
    const input = validate(
      CategoryInput,
      {
        slug: c.slug,
        name: en(c.name),
        shortName: en(c.shortName),
        kicker: en(c.kicker),
        description: en(c.description),
        icon: c.icon,
        imageId: media(c.image),
        order,
      },
      `category ${c.slug}`,
    )
    const data = {
      slug: input.slug,
      name: J(input.name),
      shortName: O(input.shortName),
      kicker: O(input.kicker),
      description: O(input.description),
      icon: input.icon,
      imageId: input.imageId,
      order: input.order,
    }
    const row = await tx.category.upsert({
      where: { slug: input.slug },
      create: data,
      update: data,
      select: { id: true },
    })
    ids.set(c.slug, row.id)
  }
  return ids
}

async function seedRegions(tx: Tx, media: (key: ImageKey) => string) {
  const ids = new Map<string, string>()
  for (const [order, r] of regions.entries()) {
    const input = validate(
      RegionInput,
      {
        slug: r.slug,
        name: en(r.name),
        description: en(r.description),
        places: en(r.places),
        icon: r.icon,
        bestMonths: r.bestMonths,
        imageId: media(r.image),
        order,
      },
      `region ${r.slug}`,
    )
    const data = {
      slug: input.slug,
      name: J(input.name),
      description: O(input.description),
      places: O(input.places),
      icon: input.icon,
      bestMonths: input.bestMonths,
      imageId: input.imageId,
      order: input.order,
    }
    const row = await tx.region.upsert({
      where: { slug: input.slug },
      create: data,
      update: data,
      select: { id: true },
    })
    ids.set(r.slug, row.id)
  }
  return ids
}

function destinationData(input: DestinationInputT) {
  return {
    slug: input.slug,
    status: input.status,
    order: input.order,
    regionId: input.regionId,
    name: J(input.name),
    headline: O(input.headline),
    tagline: O(input.tagline),
    summary: J(input.summary),
    description: O(input.description),
    metaLabel: O(input.metaLabel),
    badge: O(input.badge),
    bestTimeLabel: O(input.bestTimeLabel),
    curations: O(input.curations),
    quickFacts: O(input.quickFacts),
    guideNote: O(input.guideNote),
    experiences: O(input.experiences),
    cuisine: O(input.cuisine),
    stays: O(input.stays),
    fieldNotes: O(input.fieldNotes),
    interests: O(input.interests),
    mapPoints: J(input.mapPoints),
    latitude: input.latitude,
    longitude: input.longitude,
    elevation: input.elevation,
    coverId: input.coverId,
    seoTitle: O(input.seoTitle),
    seoDescription: O(input.seoDescription),
  }
}

async function seedDestinations(tx: Tx, media: (key: ImageKey) => string, regionIds: Map<string, string>) {
  const ids = new Map<string, string>()
  let images = 0
  for (const [order, d] of destinations.entries()) {
    const input = validate(
      DestinationInput,
      {
        slug: d.slug,
        status: 'published',
        order,
        regionId: need(regionIds, d.region, 'region'),
        name: en(d.name),
        headline: en(d.headline),
        tagline: en(d.tagline),
        summary: en(d.summary),
        description: en(d.description),
        metaLabel: en(d.metaLabel),
        badge: enOpt(d.badge),
        bestTimeLabel: en(d.bestTimeLabel),
        curations: en(d.curations),
        quickFacts: en(d.quickFacts),
        guideNote: enOpt(d.guideNote),
        experiences: en(
          d.experiences.map(({ image, ...e }) => ({ ...e, imageId: image ? media(image) : null })),
        ),
        cuisine: enOpt(d.cuisine),
        stays: enOpt(d.stays?.map(({ image, ...s }) => ({ ...s, imageId: image ? media(image) : null }))),
        fieldNotes: en(d.fieldNotes),
        interests: en(d.interests),
        mapPoints: d.mapPoints,
        latitude: d.latitude,
        longitude: d.longitude,
        elevation: d.elevation,
        coverId: media(d.cover),
        gallery: captioned(d.gallery, media),
        seoTitle: enOpt(d.seoTitle),
        seoDescription: enOpt(d.seoDescription),
      },
      `destination ${d.slug}`,
    )
    const data = destinationData(input)
    const row = await tx.destination.upsert({
      where: { slug: input.slug },
      create: data,
      update: data,
      select: { id: true },
    })
    await tx.destinationImage.createMany({
      data: input.gallery.map((g, i) => ({
        destinationId: row.id,
        mediaId: g.mediaId,
        caption: O(g.caption),
        order: i,
      })),
    })
    images += input.gallery.length
    ids.set(d.slug, row.id)
  }
  return { ids, images }
}

function tourData(input: TourInputT, publishedAt: Date) {
  return {
    slug: input.slug,
    status: input.status,
    order: input.order,
    isFeatured: input.isFeatured,
    isMostPopular: input.isMostPopular,
    publishedAt,
    title: J(input.title),
    summary: J(input.summary),
    description: J(input.description),
    cardTag: O(input.cardTag),
    durationDays: input.durationDays,
    durationNights: input.durationNights,
    route: input.route,
    highlights: J(input.highlights),
    badges: O(input.badges),
    overview: O(input.overview),
    keyFeatures: O(input.keyFeatures),
    included: J(input.included),
    notIncluded: J(input.notIncluded),
    terrains: O(input.terrains),
    routeSummary: O(input.routeSummary),
    travellerTypes: input.travellerTypes,
    seasons: input.seasons,
    coverId: input.coverId,
    seoTitle: O(input.seoTitle),
    seoDescription: O(input.seoDescription),
  }
}

async function seedTours(
  tx: Tx,
  now: Date,
  media: (key: ImageKey) => string,
  categoryIds: Map<string, string>,
  destinationIds: Map<string, string>,
) {
  const ids = new Map<string, string>()
  let days = 0
  let images = 0
  for (const [order, t] of tours.entries()) {
    const input = validate(
      TourInput,
      {
        slug: t.slug,
        status: 'published',
        order,
        isFeatured: t.isFeatured ?? false,
        isMostPopular: t.isMostPopular ?? false,
        title: en(t.title),
        summary: en(t.summary),
        description: en(t.description),
        cardTag: enOpt(t.cardTag),
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        route: t.route,
        highlights: en(t.highlights),
        badges: enOpt(t.badges),
        overview: enOpt(t.overview),
        keyFeatures: en(t.keyFeatures),
        included: en(t.included),
        notIncluded: en(t.notIncluded),
        terrains: enOpt(t.terrains),
        routeSummary: enOpt(t.routeSummary),
        travellerTypes: t.travellerTypes,
        seasons: t.seasons,
        coverId: media(t.cover),
        gallery: captioned(t.gallery, media),
        days: t.days.map((d, i) => ({
          dayNumber: i + 1,
          title: en(d.title),
          description: en(d.description),
          overnightArea: enOpt(d.overnightArea),
          meals: enOpt(d.meals),
          drivingTime: enOpt(d.drivingTime),
          details: enOpt(d.details),
          isHighlight: d.isHighlight ?? false,
          stops: d.stops,
        })),
        categoryIds: t.categories.map((slug) => need(categoryIds, slug, 'category')),
        destinationIds: t.destinations.map((slug) => need(destinationIds, slug, 'destination')),
        seoTitle: enOpt(t.seoTitle),
        seoDescription: enOpt(t.seoDescription),
      },
      `tour ${t.slug}`,
    )
    if (input.days.length !== input.durationDays) {
      throw new Error(
        `Tour ${t.slug}: ${input.days.length} itinerary days but durationDays = ${input.durationDays}`,
      )
    }
    // Staggered publish dates so "newest" sorting is meaningful; the first tour is the newest.
    const data = tourData(input, daysAgo(now, 40 + order * 12))
    const row = await tx.tour.upsert({
      where: { slug: input.slug },
      create: data,
      update: data,
      select: { id: true },
    })
    const tourId = row.id
    await tx.tourDay.createMany({
      data: input.days.map((d) => ({
        tourId,
        dayNumber: d.dayNumber,
        title: J(d.title),
        description: J(d.description),
        overnightArea: O(d.overnightArea),
        meals: O(d.meals),
        drivingTime: O(d.drivingTime),
        details: O(d.details),
        isHighlight: d.isHighlight,
        stops: J(d.stops),
      })),
    })
    await tx.tourImage.createMany({
      data: input.gallery.map((g, i) => ({ tourId, mediaId: g.mediaId, caption: O(g.caption), order: i })),
    })
    await tx.tourCategory.createMany({
      data: [...new Set(input.categoryIds)].map((categoryId) => ({ tourId, categoryId })),
    })
    await tx.tourDestination.createMany({
      data: [...new Set(input.destinationIds)].map((destinationId, i) => ({
        tourId,
        destinationId,
        order: i,
      })),
    })
    days += input.days.length
    images += input.gallery.length
    ids.set(t.slug, tourId)
  }
  return { ids, days, images }
}

async function seedReviews(
  tx: Tx,
  now: Date,
  media: (key: ImageKey) => string,
  tourIds: Map<string, string>,
) {
  let pendingIndex = 0
  for (const [i, r] of reviews.entries()) {
    const input = validate(
      ReviewInput,
      {
        guestName: r.guestName,
        email: r.email ?? null,
        country: r.country,
        location: r.location ?? null,
        partyLabel: r.partyLabel ?? null,
        travellerType: r.travellerType,
        tourType: r.tourType ?? null,
        tripLabel: r.tripLabel ?? null,
        tourId: r.tour ? need(tourIds, r.tour, 'tour') : null,
        rating: r.rating,
        title: r.title ?? null,
        text: r.text,
        photoId: r.photo ? media(r.photo) : null,
        tripPhotoIds: (r.tripPhotos ?? []).map(media),
        source: r.source,
        travelDate: r.travelDate,
        status: r.status,
        isFeatured: r.isFeatured ?? false,
        locale: 'en',
      },
      `review #${i + 1} (${r.guestName})`,
    )
    const travelDate = input.travelDate ? new Date(`${input.travelDate}-01T00:00:00.000Z`) : null
    // Approved reviews were written a few weeks after the trip; pending ones arrived in the last days.
    const createdAt =
      input.status === 'pending'
        ? daysAgo(now, 2 + pendingIndex++ * 3)
        : new Date(Math.min((travelDate?.getTime() ?? now.getTime()) + 24 * DAY_MS, now.getTime() - DAY_MS))
    await tx.review.create({
      data: {
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
        travelDate,
        status: input.status,
        isFeatured: input.isFeatured,
        locale: input.locale,
        approvedAt: input.status === 'approved' ? new Date(createdAt.getTime() + 2 * DAY_MS) : null,
        createdAt,
      },
    })
  }
}

async function seedFaqs(tx: Tx, tourIds: Map<string, string>, destinationIds: Map<string, string>) {
  const groups: {
    scope: 'general' | 'booking' | 'corporate' | 'tour' | 'destination'
    faqs: SeedFaq[]
    tour?: string
    destination?: string
  }[] = [
    { scope: 'general', faqs: generalFaqs },
    { scope: 'booking', faqs: bookingFaqs },
    { scope: 'corporate', faqs: corporateFaqs },
    ...Object.entries(tourFaqs).map(([tour, faqs]) => ({ scope: 'tour' as const, faqs, tour })),
    ...Object.entries(destinationFaqs).map(([destination, faqs]) => ({
      scope: 'destination' as const,
      faqs,
      destination,
    })),
  ]
  for (const g of groups) {
    const rows = g.faqs.map((f, order) =>
      validate(
        FaqInput,
        {
          scope: g.scope,
          question: en(f.question),
          answer: en(f.answer),
          order,
          status: 'published',
          tourId: g.tour ? need(tourIds, g.tour, 'tour') : null,
          destinationId: g.destination ? need(destinationIds, g.destination, 'destination') : null,
        },
        `${g.scope} FAQ "${f.question}"`,
      ),
    )
    await tx.faq.createMany({
      data: rows.map((f) => ({
        scope: f.scope,
        question: J(f.question),
        answer: J(f.answer),
        order: f.order,
        status: f.status,
        tourId: f.tourId,
        destinationId: f.destinationId,
      })),
    })
  }
}

async function seedBlog(tx: Tx, now: Date, media: (key: ImageKey) => string) {
  for (const p of blogPosts) {
    const input = validate(
      BlogPostInput,
      {
        slug: p.slug,
        status: 'published',
        title: en(p.title),
        excerpt: en(p.excerpt),
        content: en(p.content),
        coverId: media(p.cover),
        categorySlug: p.category.slug,
        category: en(p.category.label),
        tags: p.tags,
        authorName: p.authorName ?? 'Dinesh Jayasuriya',
        isFeatured: p.isFeatured ?? false,
        publishedAt: daysAgo(now, p.publishedDaysAgo).toISOString(),
        seoTitle: enOpt(p.seoTitle),
        seoDescription: enOpt(p.seoDescription),
      },
      `blog post ${p.slug}`,
    )
    const data = {
      slug: input.slug,
      status: input.status,
      title: J(input.title),
      excerpt: J(input.excerpt),
      content: J(input.content),
      coverId: input.coverId,
      categorySlug: input.categorySlug,
      category: J(input.category),
      tags: input.tags,
      // Same calculation as the blog service (English body, ~200 words per minute).
      readingTime: readingTimeOf(input.content.en),
      authorName: input.authorName,
      isFeatured: input.isFeatured,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : now,
      seoTitle: O(input.seoTitle),
      seoDescription: O(input.seoDescription),
    }
    await tx.blogPost.upsert({ where: { slug: input.slug }, create: data, update: data })
  }
}

async function seedGallery(tx: Tx, media: (key: ImageKey) => string) {
  const rows = galleryItems.map((g, order) =>
    validate(
      GalleryItemInput,
      {
        type: g.type,
        mediaId: media(g.image),
        videoUrl: g.videoUrl ?? null,
        category: g.category,
        caption: g.title || g.caption ? en({ title: g.title, caption: g.caption }) : null,
        location: g.location ?? null,
        order,
        status: 'published',
      },
      `gallery item ${g.image}`,
    ),
  )
  await tx.galleryItem.createMany({
    data: rows.map((g) => ({
      type: g.type,
      mediaId: g.mediaId,
      videoUrl: g.videoUrl,
      category: g.category,
      caption: O(g.caption),
      location: g.location,
      order: g.order,
      status: g.status,
    })),
  })
}

async function seedAvailability(tx: Tx, now: Date) {
  const today = parseDate(isoDay(now))
  const rows = availability.map((a) => {
    const start = new Date(today.getTime() + a.startInDays * DAY_MS)
    const end = new Date(start.getTime() + (a.days - 1) * DAY_MS)
    return validate(
      AvailabilityInput,
      { startDate: isoDay(start), endDate: isoDay(end), type: a.type, note: a.note ?? null },
      `availability +${a.startInDays}d`,
    )
  })
  await tx.availabilityRange.createMany({
    data: rows.map((r) => ({
      startDate: parseDate(r.startDate),
      endDate: parseDate(r.endDate),
      type: r.type,
      note: r.note || null,
    })),
  })
}

async function seedSettings(tx: Tx, media: (key: ImageKey) => string) {
  const values: Record<SettingKey, unknown> = {
    contact: {
      ...settings.contact,
      address: en(settings.contact.address),
      serviceArea: en(settings.contact.serviceArea),
      hours: en(settings.contact.hours),
      responseTime: en(settings.contact.responseTime),
    },
    social: settings.social,
    guide: {
      name: settings.guide.name,
      title: en(settings.guide.title),
      licenseNumber: settings.guide.licenseNumber,
      operatorLicense: settings.guide.operatorLicense,
      yearsGuiding: settings.guide.yearsGuiding,
      languages: settings.guide.languages,
      portraitId: media(settings.guide.portrait),
      candidId: media(settings.guide.candid),
      candidCaption: en(settings.guide.candidCaption),
      introVideoUrl: settings.guide.introVideoUrl,
    },
    counters: settings.counters.map((c) => ({ value: c.value, label: en(c.label) })),
    trustBadges: settings.trustBadges.map((b) => ({
      icon: b.icon,
      title: en(b.title),
      subtitle: en(b.subtitle),
      tone: b.tone,
    })),
    heroSlides: settings.heroSlides.map((s) => ({ imageId: media(s.image), alt: en(s.alt) })),
    seo: {
      siteName: settings.seo.siteName,
      defaultTitle: en(settings.seo.defaultTitle),
      defaultDescription: en(settings.seo.defaultDescription),
      ogImageId: media(settings.seo.ogImage),
    },
    corporateClients: settings.corporateClients.map((name) => ({ name, logoId: null })),
    instagramFeed: settings.instagramFeed.map(media),
    // Every photo used by the static pages (About, Corporate, Quiz, Travel guide, …) is addressable by its
    // image key as a "slot", so the client can swap them in Admin → Settings → Page images.
    pageImages: (Object.keys(IMAGES) as ImageKey[])
      .filter((key) => !/^(cat|tour|insta|hero)-/.test(key))
      .map((key) => ({ slot: key, imageId: media(key) })),
  }
  await tx.siteSetting.createMany({
    data: SETTING_KEYS.map((key) => ({
      key,
      value: J(validate(SettingValueSchemas[key] as z.ZodType, values[key], `setting "${key}"`)),
    })),
  })
}

async function seedContent(prisma: PrismaClient) {
  const now = new Date()
  return prisma.$transaction(
    async (tx) => {
      await resetContent(tx)
      const media = await seedMedia(tx)
      const categoryIds = await seedCategories(tx, media)
      const regionIds = await seedRegions(tx, media)
      const dest = await seedDestinations(tx, media, regionIds)
      const tour = await seedTours(tx, now, media, categoryIds, dest.ids)
      await seedReviews(tx, now, media, tour.ids)
      await seedFaqs(tx, tour.ids, dest.ids)
      await seedBlog(tx, now, media)
      await seedGallery(tx, media)
      await seedAvailability(tx, now)
      await seedSettings(tx, media)
    },
    { timeout: 120_000, maxWait: 15_000 },
  )
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

async function printSummary(prisma: PrismaClient) {
  const [
    media,
    categoryCount,
    regionCount,
    destinationCount,
    destinationImages,
    tourCount,
    tourDays,
    tourImages,
    approved,
    pending,
    faqs,
    blog,
    gallery,
    ranges,
    settingCount,
    admins,
  ] = await Promise.all([
    prisma.media.count({ where: { OR: [{ key: { startsWith: SEED_PREFIX } }, { key: { startsWith: `media/${SEED_PREFIX}` } }] } }),
    prisma.category.count(),
    prisma.region.count(),
    prisma.destination.count(),
    prisma.destinationImage.count(),
    prisma.tour.count(),
    prisma.tourDay.count(),
    prisma.tourImage.count(),
    prisma.review.count({ where: { status: 'approved' } }),
    prisma.review.count({ where: { status: 'pending' } }),
    prisma.faq.groupBy({ by: ['scope'], _count: true, orderBy: { scope: 'asc' } }),
    prisma.blogPost.count(),
    prisma.galleryItem.groupBy({ by: ['type'], _count: true, orderBy: { type: 'asc' } }),
    prisma.availabilityRange.count(),
    prisma.siteSetting.count(),
    prisma.adminUser.count(),
  ])
  const rows: [string, string][] = [
    ['Media (seed/)', String(media)],
    ['Categories', String(categoryCount)],
    ['Regions', String(regionCount)],
    ['Destinations', `${destinationCount} (+${destinationImages} gallery images)`],
    ['Tours', `${tourCount} (${tourDays} days, ${tourImages} gallery images)`],
    ['Reviews', `${approved + pending} (${approved} approved, ${pending} pending)`],
    ['FAQs', faqs.map((f) => `${f.scope} ${f._count}`).join(', ')],
    ['Blog posts', String(blog)],
    ['Gallery items', gallery.map((g) => `${g._count} ${g.type}`).join(', ')],
    ['Availability ranges', String(ranges)],
    ['Site settings', String(settingCount)],
    ['Admin users', String(admins)],
  ]
  const width = Math.max(...rows.map(([label]) => label.length))
  console.info('\nSeed summary')
  console.info('─'.repeat(width + 40))
  for (const [label, value] of rows) console.info(`${label.padEnd(width)}  ${value}`)
  console.info('─'.repeat(width + 40))
}

// ---------------------------------------------------------------------------

async function main() {
  const args = new Set(process.argv.slice(2))
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  const prisma = createPrisma(databaseUrl)
  try {
    await seedAdmin(prisma)
    if (args.has('--skip-content')) {
      console.info('↷ --skip-content: sample content left untouched.')
      return
    }
    if (process.env.NODE_ENV === 'production' && !args.has('--force')) {
      console.warn(
        '⚠ NODE_ENV=production: the content reset was skipped. Re-run with --force to replace all content.',
      )
      return
    }
    const started = Date.now()
    await seedContent(prisma)
    console.info(`✓ Sample content reset and inserted in ${((Date.now() - started) / 1000).toFixed(1)}s.`)
    await printSummary(prisma)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err: unknown) => {
  console.error('✗ Seed failed:', err instanceof Error ? err.message : err)
  process.exitCode = 1
})
