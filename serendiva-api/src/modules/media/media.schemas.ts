import { z } from 'zod'
import { ImageVariantSchema } from '@/lib/schemas'
import { PageMetaSchema } from '@/lib/pagination'
import { SLUG_REGEX } from '@/lib/slug'
import { MEDIA_USAGE_TYPES } from './media.usage'

const ALT_MAX = 300

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

export const MediaUsageSchema = z
  .object({
    type: z.enum(MEDIA_USAGE_TYPES).meta({ id: 'MediaUsageType' }),
    id: z.string().describe('Id of the referencing record; for type "setting" the setting key (e.g. "guide")'),
    label: z.string().meta({ example: 'Cultural Odyssey · cover' }),
  })
  .meta({ id: 'MediaUsage' })

export const AdminMediaSchema = z
  .object({
    id: z.string(),
    url: z.string().describe('Original file (images: full-size WebP)'),
    thumbUrl: z.string().nullable().describe('400px WebP preview; null for documents and not-yet-imported seed images (use `url`)'),
    mime: z.string().meta({ example: 'image/webp' }),
    size: z.number().int().describe('Bytes of the stored original'),
    width: z.number().int().nullable(),
    height: z.number().int().nullable(),
    variants: z.object({
      thumb: ImageVariantSchema.optional(),
      medium: ImageVariantSchema.optional(),
      large: ImageVariantSchema.optional(),
    }),
    blurDataUrl: z.string().nullable(),
    altText: z.record(z.string(), z.string()).describe('Alt text per locale, e.g. { "en": "Sigiriya at dawn" }; {} when not set'),
    originalName: z.string().nullable(),
    createdAt: z.string(),
    usageCount: z.number().int().describe('How many places reference this file (0 = can be deleted)'),
  })
  .meta({ id: 'AdminMedia' })

export type AdminMedia = z.infer<typeof AdminMediaSchema>

export const AdminMediaDetailSchema = AdminMediaSchema.extend({
  usage: z.array(MediaUsageSchema),
}).meta({ id: 'AdminMediaDetail' })

export type AdminMediaDetail = z.infer<typeof AdminMediaDetailSchema>

export const AdminMediaListSchema = z
  .object({ items: z.array(AdminMediaSchema), meta: PageMetaSchema })
  .meta({ id: 'AdminMediaList' })

export const MediaUploadErrorSchema = z
  .object({
    fileName: z.string(),
    message: z.string().meta({ example: 'Unsupported file type. Allowed: JPEG, PNG, WebP, AVIF, GIF, PDF, DOCX' }),
  })
  .meta({ id: 'MediaUploadError' })

export const MediaUploadResultSchema = z
  .object({
    items: z.array(AdminMediaSchema).describe('Files stored successfully, in upload order'),
    errors: z.array(MediaUploadErrorSchema).describe('Files that were rejected (the others are still saved)'),
  })
  .meta({ id: 'MediaUploadResult' })

export type MediaUploadResult = z.infer<typeof MediaUploadResultSchema>

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export const AdminMediaQuery = z.object({
  q: z.string().trim().max(100).optional().describe('Search file name and alt text (any locale)'),
  type: z.enum(['image', 'document']).optional(),
  folder: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers and dashes')
    .optional()
    .describe('Upload folder, e.g. "tours", "blog", "gallery", "seed"'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(40),
})

export type AdminMediaQueryT = z.infer<typeof AdminMediaQuery>

const altString = z.string().trim().max(ALT_MAX)

export const MediaUpdateBody = z
  .object({
    altText: z
      .object({ en: altString.optional(), zh: altString.optional(), de: altString.optional() })
      .nullable()
      .describe('Empty strings remove a locale; null clears all alt text'),
  })
  .meta({ id: 'MediaUpdateBody' })

export type MediaUpdateBodyT = z.infer<typeof MediaUpdateBody>

/** Text fields of the multipart upload (validated in the service; multipart bodies have no Zod body schema). */
export const MediaUploadFields = z.object({
  altText: z
    .string()
    .trim()
    .max(ALT_MAX)
    .optional()
    .transform((v) => v || undefined),
  folder: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || undefined)
    .pipe(z.string().regex(SLUG_REGEX, 'Use lowercase letters, numbers and dashes, e.g. "tours"').optional()),
})

export type MediaUploadFieldsT = z.infer<typeof MediaUploadFields>
