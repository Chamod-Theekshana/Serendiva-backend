import type { z } from 'zod'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import { compactTranslatable, tr, trList, trOrNull, type Locale } from '@/lib/i18n'
import { toImage, type MediaLike } from '@/lib/media-dto'
import { notFound, validationError } from '@/lib/errors'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { Tags } from '@/lib/revalidate'
import { toFaqItem } from '@/modules/shared/public-dto'
import { asRecord, asRecordRequired, toAdminMediaRef, translationFlags } from '@/modules/shared/admin-dto'
import { asObj, captionOf, captionRecordOf, mapPointsOf, objList, str, strList, strOrNull } from '@/modules/shared/json-read'
import { toTourCard } from '@/modules/tours/tours.service'
import {
  createDestinationsRepository,
  type AdminDestinationRow,
  type AdminRegionRow,
  type DestinationCardRow,
  type DestinationDetailRow,
  type PublicRegionRow,
} from './destinations.repository'
import {
  MONTH_RATINGS,
  type AdminDestination,
  type AdminRegion,
  type AdminDestinationsQuery,
  type DestinationCard,
  type DestinationDetail,
  type DestinationInputT,
  type DestinationsQuery,
  type RegionDto,
  type RegionInputT,
} from './destinations.schemas'

type MonthRating = (typeof MONTH_RATINGS)[number]

/** 12 month ratings (Jan..Dec) or [] when not configured. */
function monthsOf(v: string[]): MonthRating[] {
  if (v.length !== 12) return []
  return v.map((m) => ((MONTH_RATINGS as readonly string[]).includes(m) ? (m as MonthRating) : 'good'))
}

function toRegion(r: PublicRegionRow, locale: Locale): RegionDto {
  const name = tr<string>(r.name, locale, r.slug)
  return {
    id: r.id,
    slug: r.slug,
    name,
    description: trOrNull<string>(r.description, locale),
    places: trOrNull<string>(r.places, locale),
    icon: r.icon,
    bestMonths: monthsOf(r.bestMonths),
    image: toImage(r.image, locale, name),
    destinationCount: r._count.destinations,
  }
}

export function toDestinationCard(d: DestinationCardRow, locale: Locale): DestinationCard {
  const name = tr<string>(d.name, locale, d.slug)
  return {
    id: d.id,
    slug: d.slug,
    name,
    tagline: trOrNull<string>(d.tagline, locale),
    summary: tr<string>(d.summary, locale, ''),
    metaLabel: trOrNull<string>(d.metaLabel, locale),
    badge: trOrNull<string>(d.badge, locale),
    bestTimeLabel: trOrNull<string>(d.bestTimeLabel, locale),
    curations: strList(trList(d.curations, locale)),
    region: d.region ? { slug: d.region.slug, name: tr<string>(d.region.name, locale, d.region.slug), icon: d.region.icon } : null,
    cover: toImage(d.cover, locale, name),
    latitude: d.latitude,
    longitude: d.longitude,
    elevation: d.elevation,
  }
}

/** Lowercase text across all locales for free-text search. */
function searchText(d: DestinationCardRow): string {
  const parts: string[] = [d.slug]
  for (const v of [d.name, d.tagline, d.summary, d.metaLabel, d.badge, d.curations, d.interests]) {
    if (v && typeof v === 'object') parts.push(JSON.stringify(v))
  }
  if (d.region) parts.push(d.region.slug, JSON.stringify(d.region.name))
  return parts.join(' ').toLowerCase()
}

/**
 * Items of a translatable list for `locale`, each paired with its imageId. Translations often
 * omit image ids, so a missing one falls back to the English item at the same position.
 */
function localizedWithImages(value: unknown, locale: Locale) {
  const items = objList(trList(value, locale))
  const en = objList(trList(value, 'en'))
  return items.map((item, i) => ({ item, imageId: strOrNull(item.imageId) ?? strOrNull(en[i]?.imageId) }))
}

/** All imageIds used in a translatable list (every locale) — for admin previews. */
function imageIdsInAllLocales(value: unknown): string[] {
  const rec = asObj(value)
  if (!rec) return []
  return Object.values(rec).flatMap((list) => objList(list).map((i) => strOrNull(i.imageId)).filter((x): x is string => !!x))
}

function mapDetail(d: DestinationDetailRow, locale: Locale, media: Map<string, MediaLike>): DestinationDetail {
  const card = toDestinationCard(d, locale)
  const guide = asObj(trOrNull(d.guideNote, locale))
  const cuisine = asObj(trOrNull(d.cuisine, locale))
  const seoTitle = trOrNull<string>(d.seoTitle, locale) ?? (card.tagline ? `${card.name}: ${card.tagline}` : card.name)
  const headline = trOrNull<string>(d.headline, locale) ?? card.name

  return {
    ...card,
    headline,
    description: tr<string>(d.description, locale, ''),
    quickFacts: objList(trList(d.quickFacts, locale)).map((f) => ({
      icon: str(f.icon),
      label: str(f.label),
      value: str(f.value),
      note: strOrNull(f.note),
    })),
    guideNote: guide
      ? {
          heading: str(guide.heading),
          paragraphs: strList(guide.paragraphs),
          perks: objList(guide.perks).map((p) => ({ icon: str(p.icon), label: str(p.label) })),
        }
      : null,
    experiences: localizedWithImages(d.experiences, locale).map(({ item, imageId }) => ({
      kicker: strOrNull(item.kicker),
      meta: strOrNull(item.meta),
      title: str(item.title),
      text: str(item.text),
      tagIcon: strOrNull(item.tagIcon),
      tagLabel: strOrNull(item.tagLabel),
      image: imageId ? toImage(media.get(imageId), locale, str(item.title)) : null,
    })),
    cuisine: cuisine
      ? {
          heading: str(cuisine.heading),
          intro: strOrNull(cuisine.intro),
          items: objList(cuisine.items).map((i) => ({ icon: str(i.icon), title: str(i.title), text: str(i.text) })),
        }
      : null,
    stays: localizedWithImages(d.stays, locale).map(({ item, imageId }) => ({
      icon: strOrNull(item.icon),
      category: str(item.category),
      title: str(item.title),
      text: str(item.text),
      features: strList(item.features),
      image: imageId ? toImage(media.get(imageId), locale, str(item.title)) : null,
    })),
    fieldNotes: objList(trList(d.fieldNotes, locale)).map((n) => ({ icon: str(n.icon), title: str(n.title), text: str(n.text) })),
    interests: strList(trList(d.interests, locale)),
    mapPoints: mapPointsOf(d.mapPoints),
    gallery: d.gallery.flatMap((g) => {
      const cap = captionOf(trOrNull(g.caption, locale))
      const image = toImage(g.media, locale, cap.title ?? card.name)
      return image ? [{ image, ...cap }] : []
    }),
    region: d.region
      ? {
          slug: d.region.slug,
          name: tr<string>(d.region.name, locale, d.region.slug),
          icon: d.region.icon,
          description: trOrNull<string>(d.region.description, locale),
          places: trOrNull<string>(d.region.places, locale),
          bestMonths: monthsOf(d.region.bestMonths),
        }
      : null,
    tours: d.tours.map((t) => toTourCard(t.tour, locale)),
    faqs: d.faqs.map((f) => toFaqItem(f, locale)),
    seo: {
      title: seoTitle,
      description: trOrNull<string>(d.seoDescription, locale) ?? card.summary.slice(0, 160),
      image: card.cover,
    },
    updatedAt: d.updatedAt.toISOString(),
  }
}

function toAdminRegion(r: AdminRegionRow): AdminRegion {
  return {
    id: r.id,
    slug: r.slug,
    name: asRecordRequired<string>(r.name, ''),
    description: asRecord<string>(r.description),
    places: asRecord<string>(r.places),
    icon: r.icon,
    bestMonths: r.bestMonths,
    imageId: r.imageId,
    image: toAdminMediaRef(r.image),
    order: r.order,
    destinationCount: r._count.destinations,
    translations: translationFlags(r.name),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

function toAdminDestination(d: AdminDestinationRow, mediaRefs: AdminDestination['mediaRefs']): AdminDestination {
  const R = asRecord
  return {
    id: d.id,
    slug: d.slug,
    status: d.status,
    order: d.order,
    regionId: d.regionId,
    name: asRecordRequired<string>(d.name, ''),
    headline: R<string>(d.headline),
    tagline: R<string>(d.tagline),
    summary: asRecordRequired<string>(d.summary, ''),
    description: R<string>(d.description),
    metaLabel: R<string>(d.metaLabel),
    badge: R<string>(d.badge),
    bestTimeLabel: R<string>(d.bestTimeLabel),
    curations: R<string[]>(d.curations),
    quickFacts: R(d.quickFacts) as AdminDestination['quickFacts'],
    guideNote: R(d.guideNote) as AdminDestination['guideNote'],
    experiences: R(d.experiences) as AdminDestination['experiences'],
    cuisine: R(d.cuisine) as AdminDestination['cuisine'],
    stays: R(d.stays) as AdminDestination['stays'],
    fieldNotes: R(d.fieldNotes) as AdminDestination['fieldNotes'],
    interests: R<string[]>(d.interests),
    mapPoints: mapPointsOf(d.mapPoints),
    latitude: d.latitude,
    longitude: d.longitude,
    elevation: d.elevation,
    coverId: d.coverId,
    cover: toAdminMediaRef(d.cover),
    gallery: d.gallery.map((g) => ({
      mediaId: g.mediaId,
      media: toAdminMediaRef(g.media)!,
      caption: captionRecordOf(g.caption),
    })),
    mediaRefs,
    tourIds: d.tours.map((t) => t.tourId),
    seoTitle: R<string>(d.seoTitle),
    seoDescription: R<string>(d.seoDescription),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }
}

const isBlank = (v: unknown) =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)

/** Drop locales whose block has only blank fields (e.g. an untouched guide-note form). */
function dropBlankBlocks<V extends Partial<Record<string, unknown>>>(value: V | null | undefined) {
  if (!value) return value
  return Object.fromEntries(
    Object.entries(value).filter(([, block]) => {
      const o = asObj(block)
      return !o || !Object.values(o).every(isBlank)
    }),
  ) as V
}

/** Strip empty optional translations before saving. */
function normalizeDestination(input: DestinationInputT): DestinationInputT {
  const c = (v: Parameters<typeof compactTranslatable>[0]) => compactTranslatable(dropBlankBlocks(v))
  type I = DestinationInputT
  return {
    ...input,
    headline: c(input.headline) as I['headline'],
    tagline: c(input.tagline) as I['tagline'],
    description: c(input.description) as I['description'],
    metaLabel: c(input.metaLabel) as I['metaLabel'],
    badge: c(input.badge) as I['badge'],
    bestTimeLabel: c(input.bestTimeLabel) as I['bestTimeLabel'],
    curations: c(input.curations) as I['curations'],
    quickFacts: c(input.quickFacts) as I['quickFacts'],
    guideNote: c(input.guideNote) as I['guideNote'],
    experiences: c(input.experiences) as I['experiences'],
    cuisine: c(input.cuisine) as I['cuisine'],
    stays: c(input.stays) as I['stays'],
    fieldNotes: c(input.fieldNotes) as I['fieldNotes'],
    interests: c(input.interests) as I['interests'],
    seoTitle: c(input.seoTitle) as I['seoTitle'],
    seoDescription: c(input.seoDescription) as I['seoDescription'],
    gallery: input.gallery.map((g) => ({ ...g, caption: c(g.caption) as typeof g.caption })),
  }
}

/** Every media reference in a destination body, with the body path for error messages. */
function mediaRefsOf(input: DestinationInputT) {
  const refs: { path: string; id: string | null | undefined }[] = [{ path: 'coverId', id: input.coverId }]
  input.gallery.forEach((g, i) => refs.push({ path: `gallery.${i}.mediaId`, id: g.mediaId }))
  const blocks: [string, Partial<Record<string, { imageId?: string | null }[] | undefined>> | null | undefined][] = [
    ['experiences', input.experiences],
    ['stays', input.stays],
  ]
  for (const [key, value] of blocks) {
    for (const [loc, list] of Object.entries(value ?? {})) {
      ;(list ?? []).forEach((item, i) => refs.push({ path: `${key}.${loc}.${i}.imageId`, id: item.imageId }))
    }
  }
  return refs
}

export function createDestinationsService(deps: AppDeps) {
  const repo = createDestinationsRepository(deps.prisma)

  function filterByQuery(all: DestinationCardRow[], q?: string) {
    if (!q) return all
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    return all.filter((d) => {
      const hay = searchText(d)
      return terms.every((t) => hay.includes(t))
    })
  }

  async function validateDestination(input: DestinationInputT) {
    if (input.regionId && !(await repo.regionExists(input.regionId))) {
      throw validationError([{ path: 'regionId', message: 'Unknown region' }])
    }
    await repo.assertMedia(mediaRefsOf(input))
  }

  async function regionTags(regionId: string) {
    const slugs = await repo.destinationSlugsInRegion(regionId)
    return [Tags.regions, Tags.destinations, ...slugs.map((d) => Tags.destination(d.slug))]
  }

  const destinationTags = (...slugs: string[]) => [
    Tags.destinations,
    ...slugs.map((s) => Tags.destination(s)),
    Tags.regions,
    Tags.sitemap,
    Tags.tours,
  ]

  return {
    // ------------------------------------------------------------ public

    async listRegions(locale: Locale): Promise<RegionDto[]> {
      return (await repo.listRegionsPublic()).map((r) => toRegion(r, locale))
    },

    /** The published set is small, so search and facets are computed in memory (locale-aware). */
    async list(q: z.infer<typeof DestinationsQuery>) {
      const all = await repo.listPublished()
      const searched = filterByQuery(all, q.q)
      const items = q.region ? searched.filter((d) => d.region?.slug === q.region) : searched

      // Tabs: every region that has a published destination, counted under the current search.
      const regions = new Map<string, { slug: string; name: string; order: number; count: number }>()
      for (const d of all) {
        if (d.region && !regions.has(d.region.id)) {
          regions.set(d.region.id, {
            slug: d.region.slug,
            name: tr<string>(d.region.name, q.locale, d.region.slug),
            order: d.region.order,
            count: 0,
          })
        }
      }
      for (const d of searched) if (d.region) regions.get(d.region.id)!.count++

      return {
        items: items.map((d) => toDestinationCard(d, q.locale)),
        facets: {
          regions: [...regions.values()]
            .sort((a, b) => a.order - b.order)
            .map(({ slug, name, count }) => ({ slug, name, count })),
          total: searched.length,
        },
      }
    },

    async detail(slug: string, locale: Locale): Promise<DestinationDetail> {
      const d = await repo.findPublishedBySlug(slug)
      if (!d) throw notFound('Destination')
      const imageIds = [...localizedWithImages(d.experiences, locale), ...localizedWithImages(d.stays, locale)]
        .map((x) => x.imageId)
        .filter((x): x is string => !!x)
      const media = await repo.mediaMap(imageIds)
      return mapDetail(d, locale, media)
    },

    // ------------------------------------------------------------ admin: regions

    async adminListRegions(): Promise<AdminRegion[]> {
      return (await repo.adminListRegions()).map(toAdminRegion)
    },

    async adminGetRegion(id: string): Promise<AdminRegion> {
      const r = await repo.adminFindRegion(id)
      if (!r) throw notFound('Region')
      return toAdminRegion(r)
    },

    async createRegion(input: RegionInputT): Promise<AdminRegion> {
      await repo.assertMedia([{ path: 'imageId', id: input.imageId }])
      const r = await repo.createRegion(normalizeRegion(input))
      deps.revalidator.revalidate([Tags.regions, Tags.destinations])
      return toAdminRegion(r)
    },

    async updateRegion(id: string, input: RegionInputT): Promise<AdminRegion> {
      if (!(await repo.regionExists(id))) throw notFound('Region')
      await repo.assertMedia([{ path: 'imageId', id: input.imageId }])
      const r = await repo.updateRegion(id, normalizeRegion(input))
      deps.revalidator.revalidate(await regionTags(id))
      return toAdminRegion(r)
    },

    async reorderRegions(items: { id: string; order: number }[]) {
      await repo.reorderRegions(items)
      deps.revalidator.revalidate([Tags.regions, Tags.destinations])
    },

    async removeRegion(id: string) {
      if (!(await repo.regionExists(id))) throw notFound('Region')
      const tags = await regionTags(id)
      await repo.deleteRegion(id)
      deps.revalidator.revalidate(tags)
    },

    // ------------------------------------------------------------ admin: destinations

    async adminList(q: z.infer<typeof AdminDestinationsQuery>) {
      const where: Prisma.DestinationWhereInput = {
        ...(q.status ? { status: q.status } : {}),
        ...(q.regionId ? { regionId: q.regionId } : {}),
        ...(q.q
          ? {
              OR: [
                { slug: { contains: q.q.toLowerCase() } },
                { name: { path: ['en'], string_contains: q.q } },
              ],
            }
          : {}),
      }
      const { skip, take } = toSkipTake(q)
      const [rows, total] = await repo.adminList(where, skip, take)
      return {
        items: rows.map((d) => ({
          id: d.id,
          slug: d.slug,
          name: tr<string>(d.name, 'en', d.slug),
          status: d.status,
          order: d.order,
          regionId: d.regionId,
          regionName: d.region ? tr<string>(d.region.name, 'en', '') : null,
          cover: toAdminMediaRef(d.cover),
          tourCount: d._count.tours,
          translations: translationFlags(d.name),
          updatedAt: d.updatedAt.toISOString(),
        })),
        meta: pageMeta(q, total),
      }
    },

    async adminGet(id: string): Promise<AdminDestination> {
      const d = await repo.adminFindById(id)
      if (!d) throw notFound('Destination')
      const ids = [...imageIdsInAllLocales(d.experiences), ...imageIdsInAllLocales(d.stays)]
      return toAdminDestination(d, await repo.adminMediaRefs(ids))
    },

    async create(input: DestinationInputT): Promise<AdminDestination> {
      await validateDestination(input)
      const id = await repo.create(normalizeDestination(input))
      deps.revalidator.revalidate(destinationTags(input.slug))
      return this.adminGet(id)
    },

    async update(id: string, input: DestinationInputT): Promise<AdminDestination> {
      const existing = await repo.findSlugById(id)
      if (!existing) throw notFound('Destination')
      await validateDestination(input)
      await repo.update(id, normalizeDestination(input))
      deps.revalidator.revalidate(destinationTags(existing.slug, input.slug))
      return this.adminGet(id)
    },

    async setStatus(id: string, status: 'draft' | 'published'): Promise<AdminDestination> {
      const existing = await repo.findSlugById(id)
      if (!existing) throw notFound('Destination')
      await repo.setStatus(id, status)
      deps.revalidator.revalidate(destinationTags(existing.slug))
      return this.adminGet(id)
    },

    async reorder(items: { id: string; order: number }[]) {
      await repo.reorder(items)
      deps.revalidator.revalidate([Tags.destinations])
    },

    async remove(id: string) {
      const existing = await repo.findSlugById(id)
      if (!existing) throw notFound('Destination')
      await repo.delete(id)
      deps.revalidator.revalidate([...destinationTags(existing.slug), Tags.faqs])
    },
  }
}

function normalizeRegion(input: RegionInputT): RegionInputT {
  return {
    ...input,
    description: compactTranslatable(input.description) as RegionInputT['description'],
    places: compactTranslatable(input.places) as RegionInputT['places'],
  }
}

export type DestinationsService = ReturnType<typeof createDestinationsService>
