import { z } from 'zod'
import { ImageSchema } from '@/lib/schemas'
import { LocaleSchema } from '@/lib/i18n'
import { CaptionBlock, SlugInput, TBlockOpt } from '@/lib/content-schemas'
import { AdminMediaRef } from '@/modules/shared/admin-dto'

export const GalleryTypeEnum = z.enum(['image', 'video']).meta({ id: 'GalleryType' })

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const GalleryQuery = z.object({
  locale: LocaleSchema,
  category: z.string().max(60).optional().describe('Category slug, e.g. "wildlife"'),
  type: GalleryTypeEnum.optional(),
})

export const GalleryItemSchema = z
  .object({
    id: z.string(),
    type: GalleryTypeEnum,
    image: ImageSchema.nullable().describe('The photo, or the poster frame of a video'),
    videoUrl: z.string().nullable(),
    category: z.string(),
    title: z.string().nullable().meta({ example: 'The Sky Citadel Awakes' }),
    caption: z.string().nullable(),
    location: z.string().nullable().meta({ example: 'Sigiriya Lion Citadel, Matale District' }),
  })
  .meta({ id: 'GalleryItem' })

export const GalleryListSchema = z
  .object({
    items: z.array(GalleryItemSchema),
    categories: z
      .array(z.object({ slug: z.string(), count: z.number().int() }))
      .describe('Category counts for the current type filter (ignores the category filter)'),
  })
  .meta({ id: 'GalleryList' })

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

const GalleryCategory = SlugInput.describe('Category slug, e.g. "tea-country"')

export const GalleryItemInput = z
  .object({
    type: GalleryTypeEnum.default('image'),
    mediaId: z.string().min(1).nullable().default(null).describe('Photo, or poster frame for a video'),
    videoUrl: z.url({ protocol: /^https?$/ }).max(500).nullable().default(null).describe('YouTube / Vimeo / MP4 URL'),
    category: GalleryCategory,
    caption: TBlockOpt(CaptionBlock),
    location: z.string().trim().max(160).nullable().default(null),
    order: z.number().int().min(0).default(0),
    status: z.enum(['draft', 'published']).default('published'),
  })
  .superRefine((g, ctx) => {
    if (g.type === 'image' && !g.mediaId) ctx.addIssue({ code: 'custom', path: ['mediaId'], message: 'Choose a photo' })
    if (g.type === 'video' && !g.videoUrl) ctx.addIssue({ code: 'custom', path: ['videoUrl'], message: 'Enter the video URL' })
  })
  .meta({ id: 'GalleryItemWrite' })

export type GalleryItemInputT = z.infer<typeof GalleryItemInput>

export const GalleryBulkBody = z
  .object({
    items: z
      .array(
        z.object({
          mediaId: z.string().min(1),
          category: GalleryCategory,
          caption: TBlockOpt(CaptionBlock),
          location: z.string().trim().max(160).nullable().optional(),
        }),
      )
      .min(1)
      .max(50),
  })
  .meta({ id: 'GalleryBulkBody' })

export type GalleryBulkT = z.infer<typeof GalleryBulkBody>

export const AdminGalleryQuery = z.object({
  category: z.string().max(60).optional(),
  type: GalleryTypeEnum.optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export const AdminGalleryItemSchema = z
  .object({
    id: z.string(),
    type: GalleryTypeEnum,
    mediaId: z.string().nullable(),
    media: AdminMediaRef.nullable(),
    videoUrl: z.string().nullable(),
    category: z.string(),
    caption: z.record(z.string(), CaptionBlock).nullable(),
    location: z.string().nullable(),
    order: z.number().int(),
    status: z.enum(['draft', 'published']),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminGalleryItem' })

export const AdminGalleryListSchema = z.array(AdminGalleryItemSchema).meta({ id: 'AdminGalleryList' })

export type AdminGalleryItem = z.infer<typeof AdminGalleryItemSchema>
