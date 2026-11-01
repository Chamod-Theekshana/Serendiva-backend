import { z } from 'zod'
import { IconName, ImageSchema } from '@/lib/schemas'
import { LocaleSchema } from '@/lib/i18n'
import { PageMetaSchema } from '@/lib/pagination'
import {
  CaptionBlock,
  FeatureItem,
  MapStop,
  SlugInput,
  TBlockOpt,
  TListOpt,
  TMarkdownOpt,
  TString,
  TStringOpt,
} from '@/lib/content-schemas'
import { FaqItemSchema, SeoSchema } from '@/modules/shared/public-dto'
import { AdminMediaRef } from '@/modules/shared/admin-dto'
import { TourCardSchema } from '@/modules/tours/tours.schemas'

export const MONTH_RATINGS = ['peak', 'good', 'rain'] as const
export const MonthRatingEnum = z.enum(MONTH_RATINGS).meta({ id: 'MonthRating' })

// ---------------------------------------------------------------------------
// Content block shapes — one locale (admin input + admin output)
// ---------------------------------------------------------------------------

export const QuickFactItem = z.object({
  icon: IconName,
  label: z.string().max(80),
  value: z.string().max(120),
  note: z.string().max(300).optional(),
})

export const GuideNoteBlock = z.object({
  heading: z.string().max(200),
  paragraphs: z.array(z.string().max(2000)).max(8),
  perks: z.array(z.object({ icon: IconName, label: z.string().max(80) })).max(6).optional(),
})

export const ExperienceItem = z.object({
  kicker: z.string().max(80).optional().describe('e.g. "01 • Dawn Awakening"'),
  meta: z.string().max(160).optional().describe('e.g. "Moderate • 1.5 Hours • 05:40 AM Departure"'),
  title: z.string().max(200),
  text: z.string().max(1500),
  tagIcon: IconName.optional(),
  tagLabel: z.string().max(80).optional(),
  imageId: z.string().nullable().optional().describe('Media id'),
})

export const CuisineBlock = z.object({
  heading: z.string().max(200),
  intro: z.string().max(1500).optional(),
  items: z.array(FeatureItem).max(8),
})

export const StayItem = z.object({
  icon: IconName.optional(),
  category: z.string().max(80).describe('e.g. "Heritage Category"'),
  title: z.string().max(200),
  text: z.string().max(1500),
  features: z.array(z.string().max(80)).max(8).optional(),
  imageId: z.string().nullable().optional().describe('Media id'),
})

const MonthsInput = z
  .array(MonthRatingEnum)
  .refine((a) => a.length === 0 || a.length === 12, 'Provide 12 values (Jan..Dec) or none')
  .describe('One value per month, Jan..Dec')

// ---------------------------------------------------------------------------
// Public — regions
// ---------------------------------------------------------------------------

export const LocaleOnlyQuery = z.object({ locale: LocaleSchema })

export const RegionSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    places: z.string().nullable().meta({ example: 'Galle Fort, Mirissa, Bentota, Colombo' }),
    icon: z.string().nullable(),
    bestMonths: z.array(MonthRatingEnum).describe('12 values Jan..Dec, or empty when not set'),
    image: ImageSchema.nullable(),
    destinationCount: z.number().int().describe('Published destinations in this region'),
  })
  .meta({ id: 'Region' })

export const RegionListSchema = z.array(RegionSchema).meta({ id: 'RegionList' })

export type RegionDto = z.infer<typeof RegionSchema>

// ---------------------------------------------------------------------------
// Public — destinations
// ---------------------------------------------------------------------------

export const DestinationsQuery = z.object({
  locale: LocaleSchema,
  region: z.string().max(100).optional().describe('Region slug'),
  q: z.string().trim().max(100).optional().describe('Free-text search (name, tagline, summary, curations, region)'),
})

export const RegionRefSchema = z
  .object({ slug: z.string(), name: z.string(), icon: z.string().nullable() })
  .meta({ id: 'RegionRef' })

export const DestinationCardSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    tagline: z.string().nullable(),
    summary: z.string(),
    metaLabel: z.string().nullable().meta({ example: 'Central Hill Country · 1,041m' }),
    badge: z.string().nullable().meta({ example: 'Trekker & Tea Sanctuary' }),
    bestTimeLabel: z.string().nullable().meta({ example: 'Dec – Apr & Jul – Aug' }),
    curations: z.array(z.string()),
    region: RegionRefSchema.nullable(),
    cover: ImageSchema.nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    elevation: z.number().int().nullable().describe('Metres above sea level'),
  })
  .meta({ id: 'DestinationCard' })

export const DestinationListSchema = z
  .object({
    items: z.array(DestinationCardSchema),
    facets: z.object({
      regions: z.array(z.object({ slug: z.string(), name: z.string(), count: z.number().int() })),
      total: z.number().int().describe('Destinations matching the search, ignoring the region filter'),
    }),
  })
  .meta({ id: 'DestinationList' })

const MapPoint = z.object({ name: z.string(), lat: z.number(), lng: z.number() })

export const DestinationDetailSchema = DestinationCardSchema.extend({
  headline: z.string().describe('Long H1 headline (falls back to name)'),
  description: z.string().describe('Markdown'),
  quickFacts: z.array(z.object({ icon: z.string(), label: z.string(), value: z.string(), note: z.string().nullable() })),
  guideNote: z
    .object({
      heading: z.string(),
      paragraphs: z.array(z.string()),
      perks: z.array(z.object({ icon: z.string(), label: z.string() })),
    })
    .nullable(),
  experiences: z.array(
    z.object({
      kicker: z.string().nullable(),
      meta: z.string().nullable(),
      title: z.string(),
      text: z.string(),
      tagIcon: z.string().nullable(),
      tagLabel: z.string().nullable(),
      image: ImageSchema.nullable(),
    }),
  ),
  cuisine: z
    .object({
      heading: z.string(),
      intro: z.string().nullable(),
      items: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string() })),
    })
    .nullable(),
  stays: z.array(
    z.object({
      icon: z.string().nullable(),
      category: z.string(),
      title: z.string(),
      text: z.string(),
      features: z.array(z.string()),
      image: ImageSchema.nullable(),
    }),
  ),
  fieldNotes: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string() })),
  interests: z.array(z.string()).describe('Interest pills for the "include this in my trip" form'),
  mapPoints: z.array(MapPoint),
  gallery: z.array(z.object({ image: ImageSchema, title: z.string().nullable(), caption: z.string().nullable() })),
  region: RegionRefSchema.extend({
    description: z.string().nullable(),
    places: z.string().nullable(),
    bestMonths: z.array(MonthRatingEnum),
  })
    .nullable()
    .describe('The destination region incl. its month-by-month climate (null when unassigned)'),
  tours: z.array(TourCardSchema).describe('Published tours that visit this destination'),
  faqs: z.array(FaqItemSchema),
  seo: SeoSchema,
  updatedAt: z.string(),
}).meta({ id: 'DestinationDetail' })

export type DestinationCard = z.infer<typeof DestinationCardSchema>
export type DestinationDetail = z.infer<typeof DestinationDetailSchema>

// ---------------------------------------------------------------------------
// Admin — regions
// ---------------------------------------------------------------------------

export const RegionInput = z
  .object({
    slug: SlugInput,
    name: TString(120),
    description: TStringOpt(800),
    places: TStringOpt(300),
    icon: IconName.nullable().default(null),
    bestMonths: MonthsInput.default([]),
    imageId: z.string().min(1).nullable().default(null),
    order: z.number().int().min(0).default(0),
  })
  .meta({ id: 'RegionWrite' })

export type RegionInputT = z.infer<typeof RegionInput>

const TRecord = z.record(z.string(), z.string())
const TRecordOf = <T extends z.ZodType>(item: T) => z.record(z.string(), item)

export const AdminRegionSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: TRecord,
    description: TRecord.nullable(),
    places: TRecord.nullable(),
    icon: z.string().nullable(),
    bestMonths: z.array(z.string()),
    imageId: z.string().nullable(),
    image: AdminMediaRef.nullable(),
    order: z.number().int(),
    destinationCount: z.number().int().describe('Destinations (any status) in this region'),
    translations: z.object({ zh: z.boolean(), de: z.boolean() }),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminRegion' })

export const AdminRegionListSchema = z.array(AdminRegionSchema).meta({ id: 'AdminRegionList' })

export type AdminRegion = z.infer<typeof AdminRegionSchema>

// ---------------------------------------------------------------------------
// Admin — destinations
// ---------------------------------------------------------------------------

export const DestinationImageInput = z.object({
  mediaId: z.string().min(1),
  caption: TBlockOpt(CaptionBlock),
})

export const DestinationInput = z
  .object({
    slug: SlugInput,
    status: z.enum(['draft', 'published']).default('draft'),
    order: z.number().int().min(0).default(0),
    regionId: z.string().min(1).nullable().default(null),
    name: TString(120),
    headline: TStringOpt(250),
    tagline: TStringOpt(250),
    summary: TString(1000),
    description: TMarkdownOpt(),
    metaLabel: TStringOpt(120),
    badge: TStringOpt(80),
    bestTimeLabel: TStringOpt(120),
    curations: TListOpt(z.string().max(200), 6),
    quickFacts: TListOpt(QuickFactItem, 8),
    guideNote: TBlockOpt(GuideNoteBlock),
    experiences: TListOpt(ExperienceItem, 12),
    cuisine: TBlockOpt(CuisineBlock),
    stays: TListOpt(StayItem, 8),
    fieldNotes: TListOpt(FeatureItem, 10),
    interests: TListOpt(z.string().max(60), 12),
    mapPoints: z.array(MapStop).max(30).default([]),
    latitude: z.number().min(-90).max(90).nullable().default(null),
    longitude: z.number().min(-180).max(180).nullable().default(null),
    elevation: z.number().int().min(-500).max(9000).nullable().default(null),
    coverId: z.string().min(1).nullable().default(null),
    gallery: z.array(DestinationImageInput).max(40).default([]),
    seoTitle: TStringOpt(70),
    seoDescription: TStringOpt(170),
  })
  .meta({ id: 'DestinationWrite' })

export type DestinationInputT = z.infer<typeof DestinationInput>

export const AdminDestinationsQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
  regionId: z.string().max(64).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export const AdminDestinationListItem = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    status: z.enum(['draft', 'published']),
    order: z.number().int(),
    regionId: z.string().nullable(),
    regionName: z.string().nullable(),
    cover: AdminMediaRef.nullable(),
    tourCount: z.number().int(),
    translations: z.object({ zh: z.boolean(), de: z.boolean() }),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminDestinationListItem' })

export const AdminDestinationList = z
  .object({ items: z.array(AdminDestinationListItem), meta: PageMetaSchema })
  .meta({ id: 'AdminDestinationList' })

export const AdminDestinationSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    status: z.enum(['draft', 'published']),
    order: z.number().int(),
    regionId: z.string().nullable(),
    name: TRecord,
    headline: TRecord.nullable(),
    tagline: TRecord.nullable(),
    summary: TRecord,
    description: TRecord.nullable(),
    metaLabel: TRecord.nullable(),
    badge: TRecord.nullable(),
    bestTimeLabel: TRecord.nullable(),
    curations: TRecordOf(z.array(z.string())).nullable(),
    quickFacts: TRecordOf(z.array(QuickFactItem)).nullable(),
    guideNote: TRecordOf(GuideNoteBlock).nullable(),
    experiences: TRecordOf(z.array(ExperienceItem)).nullable(),
    cuisine: TRecordOf(CuisineBlock).nullable(),
    stays: TRecordOf(z.array(StayItem)).nullable(),
    fieldNotes: TRecordOf(z.array(FeatureItem)).nullable(),
    interests: TRecordOf(z.array(z.string())).nullable(),
    mapPoints: z.array(MapStop),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    elevation: z.number().int().nullable(),
    coverId: z.string().nullable(),
    cover: AdminMediaRef.nullable(),
    gallery: z.array(
      z.object({ mediaId: z.string(), media: AdminMediaRef, caption: TRecordOf(CaptionBlock).nullable() }),
    ),
    mediaRefs: z
      .record(z.string(), AdminMediaRef)
      .describe('Previews for every imageId used inside experiences / stays (all locales), keyed by media id'),
    tourIds: z.array(z.string()).describe('Tours that include this destination (managed on the tour)'),
    seoTitle: TRecord.nullable(),
    seoDescription: TRecord.nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminDestination' })

export type AdminDestination = z.infer<typeof AdminDestinationSchema>
