import { z } from 'zod'
import { ImageSchema, IconName } from '@/lib/schemas'
import { translatable, translatableOptional } from '@/lib/i18n'
import { AdminMediaRef } from '@/modules/shared/admin-dto'

/**
 * Site settings are stored as one SiteSetting row per key (JSON value).
 * This file is the contract shared by the seed, the admin editor and the public endpoint.
 *
 * Image references are Media ids (e.g. portraitId) and are resolved to Image objects publicly.
 */

const T = (max = 300) => translatable(z.string().max(max))
const TOpt = (max = 300) => translatableOptional(z.string().max(max))

export const SETTING_KEYS = [
  'contact',
  'social',
  'guide',
  'counters',
  'trustBadges',
  'heroSlides',
  'seo',
  'corporateClients',
  'instagramFeed',
  'pageImages',
] as const
export type SettingKey = (typeof SETTING_KEYS)[number]

/** Stored (admin) shapes — translatable fields are { en, zh?, de? } */
export const SettingValueSchemas = {
  contact: z.object({
    phone: z.string().max(40).describe('Display phone, e.g. "+94 11 234 5678"'),
    whatsapp: z.string().max(20).regex(/^\d{6,20}$/, 'Digits only incl. country code, e.g. 94771234567'),
    whatsappDisplay: z.string().max(40).describe('e.g. "+94 77 123 4567"'),
    email: z.email(),
    address: T(300),
    serviceArea: T(300),
    hours: T(200),
    responseTime: T(200),
    mapLat: z.number().min(-90).max(90),
    mapLng: z.number().min(-180).max(180),
  }),
  social: z.object({
    instagram: z.string().max(300).optional(),
    instagramHandle: z.string().max(60).optional(),
    facebook: z.string().max(300).optional(),
    tripadvisor: z.string().max(300).optional(),
    google: z.string().max(300).optional(),
    youtube: z.string().max(300).optional(),
  }),
  guide: z.object({
    name: z.string().max(120),
    title: T(160),
    licenseNumber: z.string().max(60).describe('e.g. "SLTDA/SQA/NTGL/01482"'),
    operatorLicense: z.string().max(60).describe('e.g. "TS/2024/091"'),
    yearsGuiding: z.number().int().min(0).max(80),
    languages: z.array(z.string().max(40)).max(10),
    portraitId: z.string().nullable(),
    candidId: z.string().nullable().describe('Second "in the field" photo'),
    candidCaption: TOpt(120),
    introVideoUrl: z.string().max(300).optional(),
  }),
  counters: z
    .array(z.object({ value: z.string().max(20), label: T(80) }))
    .max(8)
    .describe('Animated trust counters, e.g. { value: "14+", label: { en: "Years Guiding Ceylon" } }'),
  trustBadges: z
    .array(z.object({ icon: IconName, title: T(80), subtitle: T(80), tone: z.enum(['green', 'cinnamon', 'gold']) }))
    .max(4),
  heroSlides: z.array(z.object({ imageId: z.string(), alt: TOpt(200) })).max(6),
  seo: z.object({
    siteName: z.string().max(60),
    defaultTitle: T(70),
    defaultDescription: T(170),
    ogImageId: z.string().nullable(),
  }),
  corporateClients: z.array(z.object({ name: z.string().max(80), logoId: z.string().nullable() })).max(20),
  instagramFeed: z.array(z.string()).max(12).describe('Media ids for the Instagram strip'),
  pageImages: z
    .array(
      z.object({
        slot: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase-kebab-case slot names').max(80),
        imageId: z.string(),
      }),
    )
    .max(300)
    .describe('Images used by the static pages (About, Corporate, Quiz, …), addressed by slot name, e.g. "about-field-zoology-yala"'),
} satisfies Record<SettingKey, z.ZodType>

export const AdminSettingsSchema = z
  .object({
    contact: SettingValueSchemas.contact.nullable(),
    social: SettingValueSchemas.social.nullable(),
    guide: SettingValueSchemas.guide.nullable(),
    counters: SettingValueSchemas.counters.nullable(),
    trustBadges: SettingValueSchemas.trustBadges.nullable(),
    heroSlides: SettingValueSchemas.heroSlides.nullable(),
    seo: SettingValueSchemas.seo.nullable(),
    corporateClients: SettingValueSchemas.corporateClients.nullable(),
    instagramFeed: SettingValueSchemas.instagramFeed.nullable(),
    pageImages: SettingValueSchemas.pageImages.nullable(),
    mediaRefs: z
      .record(z.string(), AdminMediaRef)
      .describe('Previews for every media id referenced by the settings above, keyed by id'),
  })
  .meta({ id: 'AdminSettings' })

export type AdminSettings = z.infer<typeof AdminSettingsSchema>

/**
 * PUT /admin/settings/:key body is the value for that key (validated with SettingValueSchemas[key]).
 * One OpenAPI component per key so the generated client gets a typed body for each.
 */
export const SettingBodySchemas = {
  contact: SettingValueSchemas.contact.meta({ id: 'SettingContactBody' }),
  social: SettingValueSchemas.social.meta({ id: 'SettingSocialBody' }),
  guide: SettingValueSchemas.guide.meta({ id: 'SettingGuideBody' }),
  counters: SettingValueSchemas.counters.meta({ id: 'SettingCountersBody' }),
  trustBadges: SettingValueSchemas.trustBadges.meta({ id: 'SettingTrustBadgesBody' }),
  heroSlides: SettingValueSchemas.heroSlides.meta({ id: 'SettingHeroSlidesBody' }),
  seo: SettingValueSchemas.seo.meta({ id: 'SettingSeoBody' }),
  corporateClients: SettingValueSchemas.corporateClients.meta({ id: 'SettingCorporateClientsBody' }),
  instagramFeed: SettingValueSchemas.instagramFeed.meta({ id: 'SettingInstagramFeedBody' }),
  pageImages: SettingValueSchemas.pageImages.meta({ id: 'SettingPageImagesBody' }),
} satisfies Record<SettingKey, z.ZodType>

export type SettingValues = { [K in SettingKey]: z.infer<(typeof SettingValueSchemas)[K]> }

// ---------------------------------------------------------------------------
// Public (localized) — GET /api/v1/settings/public?locale=en
// ---------------------------------------------------------------------------

export const PublicSettingsSchema = z
  .object({
    contact: z.object({
      phone: z.string(),
      whatsapp: z.string(),
      whatsappDisplay: z.string(),
      email: z.string(),
      address: z.string(),
      serviceArea: z.string(),
      hours: z.string(),
      responseTime: z.string(),
      mapLat: z.number(),
      mapLng: z.number(),
    }),
    social: z.object({
      instagram: z.string().nullable(),
      instagramHandle: z.string().nullable(),
      facebook: z.string().nullable(),
      tripadvisor: z.string().nullable(),
      google: z.string().nullable(),
      youtube: z.string().nullable(),
    }),
    guide: z.object({
      name: z.string(),
      title: z.string(),
      licenseNumber: z.string(),
      operatorLicense: z.string(),
      yearsGuiding: z.number().int(),
      languages: z.array(z.string()),
      portrait: ImageSchema.nullable(),
      candid: ImageSchema.nullable(),
      candidCaption: z.string().nullable(),
      introVideoUrl: z.string().nullable(),
    }),
    counters: z.array(z.object({ value: z.string(), label: z.string() })),
    trustBadges: z.array(z.object({ icon: z.string(), title: z.string(), subtitle: z.string(), tone: z.enum(['green', 'cinnamon', 'gold']) })),
    heroSlides: z.array(ImageSchema),
    seo: z.object({ siteName: z.string(), defaultTitle: z.string(), defaultDescription: z.string(), ogImage: ImageSchema.nullable() }),
    corporateClients: z.array(z.object({ name: z.string(), logo: ImageSchema.nullable() })),
    instagramFeed: z.array(ImageSchema),
    pageImages: z.record(z.string(), ImageSchema).describe('Static page images keyed by slot name'),
    reviewSummary: z.object({ average: z.number(), count: z.number().int() }),
  })
  .meta({ id: 'PublicSettings' })

export type PublicSettings = z.infer<typeof PublicSettingsSchema>
