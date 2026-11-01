import type { ImageDto } from './schemas'
import { tr, type Locale } from './i18n'

/** Shape of a Media row needed to build an ImageDto (subset of the Prisma model). */
export interface MediaLike {
  id: string
  url: string
  width: number | null
  height: number | null
  blurDataUrl: string | null
  variants: unknown
  altText: unknown
}

type Variant = { url: string; width?: number | null; height?: number | null }

function variant(v: unknown): ImageDto['variants']['thumb'] {
  if (!v || typeof v !== 'object') return undefined
  const x = v as Variant
  if (typeof x.url !== 'string') return undefined
  return { url: x.url, width: x.width ?? null, height: x.height ?? null }
}

export function toImage(media: MediaLike | null | undefined, locale: Locale, fallbackAlt = ''): ImageDto | null {
  if (!media) return null
  const variants = (media.variants ?? {}) as Record<string, unknown>
  return {
    id: media.id,
    url: media.url,
    alt: tr<string>(media.altText, locale, fallbackAlt) || fallbackAlt,
    width: media.width,
    height: media.height,
    blurDataUrl: media.blurDataUrl,
    variants: {
      thumb: variant(variants.thumb),
      medium: variant(variants.medium),
      large: variant(variants.large),
    },
  }
}

/** Prisma `select` for the Media fields toImage() needs. */
export const mediaSelect = {
  id: true,
  url: true,
  width: true,
  height: true,
  blurDataUrl: true,
  variants: true,
  altText: true,
} as const
