import { Prisma, type PrismaClient } from '@/generated/prisma/client'
import { tr } from '@/lib/i18n'
import { Tags } from '@/lib/revalidate'
import { asObj, captionOf, objList, str, strList } from '@/modules/shared/json-read'

/**
 * Where is a Media file used? Covers every way content can point at a Media row:
 *  - foreign keys (covers, galleries, region/category images, review photos, gallery items, proposal attachments)
 *  - `Review.tripPhotoIds` (array of media ids)
 *  - `imageId` inside the translatable JSON blocks `Destination.experiences` / `Destination.stays`
 *  - media ids inside SiteSetting values (guide photos, hero slides, OG image, client logos, Instagram feed)
 *  - the file URL / storage key embedded in blog post markdown
 */

export const MEDIA_USAGE_TYPES = [
  'tour',
  'tourGallery',
  'destination',
  'destinationGallery',
  'destinationBlock',
  'region',
  'category',
  'blog',
  'gallery',
  'review',
  'reviewTrip',
  'proposal',
  'setting',
] as const

export type MediaUsageType = (typeof MEDIA_USAGE_TYPES)[number]

export interface MediaUsage {
  type: MediaUsageType
  /** Id of the referencing record (for `setting`: the setting key, e.g. "guide") */
  id: string
  /** Human-readable label for the admin, e.g. the tour title */
  label: string
}

/** A usage plus the frontend cache tags of the page(s) that show it. */
export interface MediaUsageHit extends MediaUsage {
  tags: string[]
}

const usageSelect = {
  id: true,
  key: true,
  url: true,
  variants: true,
  categoryImages: { select: { id: true, slug: true, name: true } },
  tourCovers: { select: { id: true, slug: true, title: true } },
  tourImages: { select: { tour: { select: { id: true, slug: true, title: true } } } },
  destinationCovers: { select: { id: true, slug: true, name: true } },
  destinationImages: { select: { destination: { select: { id: true, slug: true, name: true } } } },
  regionImages: { select: { id: true, slug: true, name: true } },
  blogCovers: { select: { id: true, slug: true, title: true } },
  galleryItems: { select: { id: true, category: true, caption: true, location: true } },
  reviewPhotos: { select: { id: true, guestName: true } },
  proposalFiles: { select: { id: true, reference: true, company: true } },
} satisfies Prisma.MediaSelect

type UsageMediaRow = Prisma.MediaGetPayload<{ select: typeof usageSelect }>

const SETTING_KEYS_WITH_MEDIA = ['guide', 'heroSlides', 'seo', 'corporateClients', 'instagramFeed', 'pageImages'] as const

const en = (v: unknown, fallback: string) => str(tr<unknown>(v, 'en', fallback), fallback) || fallback

/** Strings that identify a stored file inside markdown: its URLs and storage keys (original + variants). */
function fileNeedles(m: { key: string; url: string; variants: unknown }): string[] {
  const out = [m.url, m.key]
  const variants = asObj(m.variants)
  if (variants) {
    for (const v of Object.values(variants)) {
      const o = asObj(v)
      if (typeof o?.url === 'string') out.push(o.url)
      if (typeof o?.key === 'string') out.push(o.key)
    }
  }
  // Very short strings would match unrelated text.
  return [...new Set(out)].filter((s) => s.length >= 8)
}

/** `[{ path label, mediaId }]` for every media id referenced by one SiteSetting value. */
function settingRefs(key: string, value: unknown): { label: string; id: string }[] {
  const out: { label: string; id: string }[] = []
  const add = (label: string, id: unknown) => {
    if (typeof id === 'string' && id) out.push({ label, id })
  }
  if (key === 'guide') {
    const g = asObj(value)
    add('Settings · Guide portrait', g?.portraitId)
    add('Settings · Guide candid photo', g?.candidId)
  } else if (key === 'heroSlides') {
    objList(value).forEach((s, i) => add(`Settings · Homepage hero slide ${i + 1}`, s.imageId))
  } else if (key === 'seo') {
    add('Settings · Default social sharing image', asObj(value)?.ogImageId)
  } else if (key === 'corporateClients') {
    objList(value).forEach((c, i) => add(`Settings · Corporate client logo: ${str(c.name) || `#${i + 1}`}`, c.logoId))
  } else if (key === 'instagramFeed') {
    strList(value).forEach((id, i) => add(`Settings · Instagram feed photo ${i + 1}`, id))
  } else if (key === 'pageImages') {
    objList(value).forEach((p) => add(`Settings · Page image "${str(p.slot)}"`, p.imageId))
  }
  return out
}

/** Every `imageId` inside a translatable list block such as `{ en: [{ imageId }], zh: [...] }`. */
function blockImageIds(value: unknown): string[] {
  const rec = asObj(value)
  if (!rec) return []
  return Object.values(rec).flatMap((list) =>
    objList(list)
      .map((item) => item.imageId)
      .filter((id): id is string => typeof id === 'string' && id !== ''),
  )
}

/**
 * Usage of several media rows at once (a handful of queries regardless of how many ids).
 * Unknown ids map to an empty list.
 */
export async function scanMediaUsage(prisma: PrismaClient, ids: Iterable<string>): Promise<Map<string, MediaUsageHit[]>> {
  const wanted = [...new Set(ids)].filter(Boolean)
  const out = new Map<string, MediaUsageHit[]>(wanted.map((id) => [id, []]))
  if (!wanted.length) return out

  const add = (mediaId: string, hit: MediaUsageHit) => {
    const list = out.get(mediaId)
    if (list && !list.some((h) => h.type === hit.type && h.id === hit.id && h.label === hit.label)) list.push(hit)
  }

  const [media, tripReviews, destinations, settings] = await Promise.all([
    prisma.media.findMany({ where: { id: { in: wanted } }, select: usageSelect }),
    prisma.review.findMany({
      where: { tripPhotoIds: { hasSome: wanted } },
      select: { id: true, guestName: true, tripPhotoIds: true },
    }),
    // Small table: load the two JSON blocks and walk them (works for every locale and any nesting order).
    prisma.destination.findMany({ select: { id: true, slug: true, name: true, experiences: true, stays: true } }),
    prisma.siteSetting.findMany({
      where: { key: { in: [...SETTING_KEYS_WITH_MEDIA] } },
      select: { key: true, value: true },
    }),
  ])

  for (const m of media) addRelationUsage(m, add)

  for (const r of tripReviews) {
    for (const id of r.tripPhotoIds) {
      add(id, { type: 'reviewTrip', id: r.id, label: `Review by ${r.guestName} · trip photos`, tags: [Tags.reviews, Tags.tours] })
    }
  }

  for (const d of destinations) {
    const name = en(d.name, d.slug)
    const tags = [Tags.destinations, Tags.destination(d.slug)]
    for (const id of blockImageIds(d.experiences)) add(id, { type: 'destinationBlock', id: d.id, label: `${name} · experiences`, tags })
    for (const id of blockImageIds(d.stays)) add(id, { type: 'destinationBlock', id: d.id, label: `${name} · stays`, tags })
  }

  for (const s of settings) {
    for (const ref of settingRefs(s.key, s.value)) add(ref.id, { type: 'setting', id: s.key, label: ref.label, tags: [Tags.settings] })
  }

  // Blog markdown: look for any URL / key of the files (images embedded in posts, any variant size).
  const needles = new Map<string, string>()
  for (const m of media) for (const n of fileNeedles(m)) needles.set(n, m.id)
  if (needles.size) {
    const posts = await prisma.$queryRaw<{ id: string; slug: string; title: unknown; content: string }[]>(Prisma.sql`
      SELECT b."id", b."slug", b."title", b."content"::text AS "content"
      FROM "BlogPost" b
      WHERE EXISTS (SELECT 1 FROM unnest(${[...needles.keys()]}::text[]) AS n(v) WHERE strpos(b."content"::text, n.v) > 0)
    `)
    for (const p of posts) {
      const hitIds = new Set([...needles].filter(([needle]) => p.content.includes(needle)).map(([, id]) => id))
      for (const id of hitIds) {
        add(id, { type: 'blog', id: p.id, label: `${en(p.title, p.slug)} · in article text`, tags: [Tags.blog, Tags.blogPost(p.slug)] })
      }
    }
  }

  return out
}

function addRelationUsage(m: UsageMediaRow, add: (mediaId: string, hit: MediaUsageHit) => void) {
  for (const t of m.tourCovers) {
    add(m.id, { type: 'tour', id: t.id, label: `${en(t.title, t.slug)} · cover`, tags: [Tags.tours, Tags.tour(t.slug)] })
  }
  for (const { tour: t } of m.tourImages) {
    add(m.id, { type: 'tourGallery', id: t.id, label: `${en(t.title, t.slug)} · gallery`, tags: [Tags.tours, Tags.tour(t.slug)] })
  }
  for (const d of m.destinationCovers) {
    add(m.id, {
      type: 'destination',
      id: d.id,
      label: `${en(d.name, d.slug)} · cover`,
      tags: [Tags.destinations, Tags.destination(d.slug)],
    })
  }
  for (const { destination: d } of m.destinationImages) {
    add(m.id, {
      type: 'destinationGallery',
      id: d.id,
      label: `${en(d.name, d.slug)} · gallery`,
      tags: [Tags.destinations, Tags.destination(d.slug)],
    })
  }
  for (const r of m.regionImages) {
    add(m.id, { type: 'region', id: r.id, label: `Region · ${en(r.name, r.slug)}`, tags: [Tags.regions, Tags.destinations] })
  }
  for (const c of m.categoryImages) {
    add(m.id, { type: 'category', id: c.id, label: `Category · ${en(c.name, c.slug)}`, tags: [Tags.categories, Tags.tours] })
  }
  for (const b of m.blogCovers) {
    add(m.id, { type: 'blog', id: b.id, label: `${en(b.title, b.slug)} · cover`, tags: [Tags.blog, Tags.blogPost(b.slug)] })
  }
  for (const g of m.galleryItems) {
    const caption = captionOf(tr<unknown>(g.caption, 'en', null))
    const label = g.location || caption.title || caption.caption || g.category
    add(m.id, { type: 'gallery', id: g.id, label: `Gallery · ${label}`, tags: [Tags.gallery] })
  }
  for (const r of m.reviewPhotos) {
    add(m.id, { type: 'review', id: r.id, label: `Review by ${r.guestName} · photo`, tags: [Tags.reviews, Tags.tours] })
  }
  for (const p of m.proposalFiles) {
    add(m.id, { type: 'proposal', id: p.id, label: `Corporate proposal ${p.reference} · ${p.company}`, tags: [] })
  }
}

/** Where a single media file is used (empty list = safe to delete). */
export async function findMediaUsage(prisma: PrismaClient, id: string): Promise<MediaUsage[]> {
  const hits = (await scanMediaUsage(prisma, [id])).get(id) ?? []
  return hits.map(({ type, id: refId, label }) => ({ type, id: refId, label }))
}
