import { z } from 'zod'
import { ImageSchema } from '@/lib/schemas'
import { LocaleSchema } from '@/lib/i18n'
import { PageMetaSchema } from '@/lib/pagination'
import {
  CaptionBlock,
  FeatureItem,
  IconTextItem,
  LabelValueItem,
  MapStop,
  OverviewBlock,
  SlugInput,
  StringList,
  TBlockOpt,
  TList,
  TListOpt,
  TMarkdown,
  TString,
  TStringOpt,
  TerrainItem,
} from '@/lib/content-schemas'
import {
  CategoryRefSchema,
  FaqItemSchema,
  ReviewCardSchema,
  SeoSchema,
  TravellerTypeEnum,
} from '@/modules/shared/public-dto'
import { AdminMediaRef } from '@/modules/shared/admin-dto'

export const SEASONS = ['nov-apr', 'may-sep', 'jul-aug', 'year-round'] as const
export const SeasonEnum = z.enum(SEASONS)

export const DURATION_BANDS = ['1-3', '4-7', '8-11', '12+'] as const

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const ToursQuery = z.object({
  locale: LocaleSchema,
  category: z.string().max(80).optional().describe('Category slug'),
  duration: z.enum(DURATION_BANDS).optional().describe('Duration band in days'),
  minDays: z.coerce.number().int().min(1).max(60).optional(),
  maxDays: z.coerce.number().int().min(1).max(60).optional(),
  q: z.string().trim().max(100).optional().describe('Free-text search (title, summary, route, highlights)'),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  travellerType: TravellerTypeEnum.optional(),
  sort: z.enum(['order', 'duration-asc', 'duration-desc', 'newest']).default('order'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

export const TourCardSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    cardTag: z.string().nullable(),
    durationDays: z.number().int(),
    durationNights: z.number().int(),
    route: z.array(z.string()),
    highlights: z.array(z.string()),
    isFeatured: z.boolean(),
    isMostPopular: z.boolean(),
    cover: ImageSchema.nullable(),
    categories: z.array(CategoryRefSchema),
    travellerTypes: z.array(TravellerTypeEnum),
    seasons: z.array(z.string()),
  })
  .meta({ id: 'TourCard' })

export const TourListSchema = z
  .object({
    items: z.array(TourCardSchema),
    meta: PageMetaSchema,
    facets: z.object({
      categories: z.array(CategoryRefSchema.extend({ count: z.number().int() })),
      total: z.number().int(),
    }),
  })
  .meta({ id: 'TourList' })

const LocalizedFeature = FeatureItem
const LocalizedIconText = IconTextItem

export const TourDaySchema = z
  .object({
    dayNumber: z.number().int(),
    title: z.string(),
    description: z.string(),
    overnightArea: z.string().nullable(),
    meals: z.string().nullable(),
    drivingTime: z.string().nullable(),
    details: z.array(LabelValueItem),
    isHighlight: z.boolean(),
    stops: z.array(MapStop),
  })
  .meta({ id: 'TourDay' })

export const TourDetailSchema = TourCardSchema.extend({
  description: z.string(),
  badges: z.array(z.string()),
  overview: OverviewBlock.nullable(),
  keyFeatures: z.array(LocalizedFeature),
  included: z.array(LocalizedIconText),
  notIncluded: z.array(LocalizedIconText),
  terrains: z.array(TerrainItem),
  routeSummary: z.string().nullable(),
  gallery: z.array(
    z.object({ image: ImageSchema, title: z.string().nullable(), caption: z.string().nullable() }),
  ),
  days: z.array(TourDaySchema),
  destinations: z.array(z.object({ slug: z.string(), name: z.string() })),
  faqs: z.array(FaqItemSchema),
  reviews: z.array(ReviewCardSchema),
  reviewSummary: z.object({ average: z.number(), count: z.number().int() }),
  related: z.array(TourCardSchema),
  seo: SeoSchema,
  updatedAt: z.string(),
}).meta({ id: 'TourDetail' })

export type TourCard = z.infer<typeof TourCardSchema>
export type TourDetail = z.infer<typeof TourDetailSchema>

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const TourDayInput = z
  .object({
    dayNumber: z.number().int().min(1).max(60),
    title: TString(200),
    description: TMarkdown(10_000),
    overnightArea: TStringOpt(160),
    meals: TStringOpt(160),
    drivingTime: TStringOpt(120),
    details: TListOpt(LabelValueItem, 12),
    isHighlight: z.boolean().default(false),
    stops: z.array(MapStop).max(20).default([]),
  })
  .meta({ id: 'TourDayWrite' })

export const TourImageInput = z.object({
  mediaId: z.string().min(1),
  caption: TBlockOpt(CaptionBlock),
})

export const TourInput = z
  .object({
    slug: SlugInput,
    status: z.enum(['draft', 'published']).default('draft'),
    order: z.number().int().min(0).default(0),
    isFeatured: z.boolean().default(false),
    isMostPopular: z.boolean().default(false),
    title: TString(160),
    summary: TString(800),
    description: TMarkdown(),
    cardTag: TStringOpt(60),
    durationDays: z.number().int().min(1).max(60),
    durationNights: z.number().int().min(0).max(60),
    route: StringList(20, 80),
    highlights: TList(z.string().max(120), 12),
    badges: TListOpt(z.string().max(60), 8),
    overview: TBlockOpt(OverviewBlock),
    keyFeatures: TListOpt(FeatureItem, 8),
    included: TList(IconTextItem, 20),
    notIncluded: TList(IconTextItem, 20),
    terrains: TListOpt(TerrainItem, 6),
    routeSummary: TStringOpt(200),
    travellerTypes: z.array(TravellerTypeEnum).max(5).default([]),
    seasons: z.array(SeasonEnum).max(4).default([]),
    coverId: z.string().nullable().default(null),
    gallery: z.array(TourImageInput).max(40).default([]),
    days: z.array(TourDayInput).max(60).default([]),
    categoryIds: z.array(z.string()).max(12).default([]),
    destinationIds: z.array(z.string()).max(30).default([]),
    seoTitle: TStringOpt(70),
    seoDescription: TStringOpt(170),
  })
  .refine((t) => new Set(t.days.map((d) => d.dayNumber)).size === t.days.length, {
    message: 'Day numbers must be unique',
    path: ['days'],
  })
  .meta({ id: 'TourWrite' })

export type TourInputT = z.infer<typeof TourInput>

export const AdminToursQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})


export const AdminTourListItem = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    status: z.enum(['draft', 'published']),
    order: z.number().int(),
    isFeatured: z.boolean(),
    isMostPopular: z.boolean(),
    durationDays: z.number().int(),
    durationNights: z.number().int(),
    cover: AdminMediaRef.nullable(),
    categories: z.array(z.string()),
    translations: z.object({ zh: z.boolean(), de: z.boolean() }),
    publishedAt: z.string().nullable(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminTourListItem' })

export const AdminTourList = z
  .object({ items: z.array(AdminTourListItem), meta: PageMetaSchema })
  .meta({ id: 'AdminTourList' })

/** Full editable tour (raw translatable JSON) + resolved media previews for the editor. */
export const AdminTourSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    status: z.enum(['draft', 'published']),
    order: z.number().int(),
    isFeatured: z.boolean(),
    isMostPopular: z.boolean(),
    title: z.record(z.string(), z.string()),
    summary: z.record(z.string(), z.string()),
    description: z.record(z.string(), z.string()),
    cardTag: z.record(z.string(), z.string()).nullable(),
    durationDays: z.number().int(),
    durationNights: z.number().int(),
    route: z.array(z.string()),
    highlights: z.record(z.string(), z.array(z.string())),
    badges: z.record(z.string(), z.array(z.string())).nullable(),
    overview: z.record(z.string(), OverviewBlock).nullable(),
    keyFeatures: z.record(z.string(), z.array(FeatureItem)).nullable(),
    included: z.record(z.string(), z.array(IconTextItem)),
    notIncluded: z.record(z.string(), z.array(IconTextItem)),
    terrains: z.record(z.string(), z.array(TerrainItem)).nullable(),
    routeSummary: z.record(z.string(), z.string()).nullable(),
    travellerTypes: z.array(TravellerTypeEnum),
    seasons: z.array(z.string()),
    coverId: z.string().nullable(),
    cover: AdminMediaRef.nullable(),
    gallery: z.array(
      z.object({ mediaId: z.string(), media: AdminMediaRef, caption: z.record(z.string(), CaptionBlock).nullable() }),
    ),
    days: z.array(
      z.object({
        dayNumber: z.number().int(),
        title: z.record(z.string(), z.string()),
        description: z.record(z.string(), z.string()),
        overnightArea: z.record(z.string(), z.string()).nullable(),
        meals: z.record(z.string(), z.string()).nullable(),
        drivingTime: z.record(z.string(), z.string()).nullable(),
        details: z.record(z.string(), z.array(LabelValueItem)).nullable(),
        isHighlight: z.boolean(),
        stops: z.array(MapStop),
      }),
    ),
    categoryIds: z.array(z.string()),
    destinationIds: z.array(z.string()),
    seoTitle: z.record(z.string(), z.string()).nullable(),
    seoDescription: z.record(z.string(), z.string()).nullable(),
    publishedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminTour' })

export type AdminTour = z.infer<typeof AdminTourSchema>
