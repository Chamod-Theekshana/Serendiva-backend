import { z } from 'zod'
import { SLUG_REGEX } from './slug'

/** Consistent error envelope for every non-2xx response. */
export const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.string().meta({ example: 'VALIDATION_ERROR' }),
      message: z.string().meta({ example: 'Some fields are invalid' }),
      details: z.unknown().optional(),
    }),
  })
  .meta({ id: 'ErrorResponse' })

export const errorResponses = {
  400: ErrorResponseSchema,
  404: ErrorResponseSchema,
  429: ErrorResponseSchema,
  500: ErrorResponseSchema,
} as const

export const adminErrorResponses = {
  400: ErrorResponseSchema,
  401: ErrorResponseSchema,
  404: ErrorResponseSchema,
  409: ErrorResponseSchema,
  500: ErrorResponseSchema,
} as const

export const OkSchema = z.object({ ok: z.literal(true) }).meta({ id: 'Ok' })

export const IdParams = z.object({ id: z.string().min(1).max(64) })
export const SlugParams = z.object({ slug: z.string().regex(SLUG_REGEX).max(100) })

export const ImageVariantSchema = z.object({
  url: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
})

/** Public image object (alt text already localized). */
export const ImageSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    alt: z.string(),
    width: z.number().int().nullable(),
    height: z.number().int().nullable(),
    blurDataUrl: z.string().nullable(),
    variants: z.object({
      thumb: ImageVariantSchema.optional(),
      medium: ImageVariantSchema.optional(),
      large: ImageVariantSchema.optional(),
    }),
  })
  .meta({ id: 'Image' })

export type ImageDto = z.infer<typeof ImageSchema>

/** Bulk re-ordering payload used by every admin list that supports drag & drop. */
export const ReorderBody = z
  .object({ items: z.array(z.object({ id: z.string().min(1), order: z.number().int().min(0) })).min(1).max(500) })
  .meta({ id: 'ReorderBody' })

export const StatusBody = z.object({ status: z.enum(['draft', 'published']) }).meta({ id: 'StatusBody' })

export const IconName = z
  .string()
  .regex(/^[a-z0-9_]{2,60}$/, 'Use a Material Symbols icon name, e.g. "temple_buddhist"')
