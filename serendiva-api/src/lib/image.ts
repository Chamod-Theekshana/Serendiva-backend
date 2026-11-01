import sharp from 'sharp'

export const IMAGE_VARIANTS = {
  thumb: 400,
  medium: 1024,
  large: 1920,
} as const

export type VariantName = keyof typeof IMAGE_VARIANTS

export interface ProcessedImage {
  width: number
  height: number
  /** Original re-encoded as webp (EXIF stripped, auto-rotated) */
  original: { buffer: Buffer; width: number; height: number }
  variants: Record<VariantName, { buffer: Buffer; width: number; height: number }>
  blurDataUrl: string
}

/**
 * Generates webp variants (thumb / medium / large) and a tiny base64 blur placeholder.
 * Images are never upscaled; EXIF metadata (GPS etc.) is removed.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const base = sharp(input, { failOn: 'error' }).rotate()
  const meta = await base.metadata()
  if (!meta.width || !meta.height) throw new Error('Unreadable image')

  const original = await base.clone().webp({ quality: 86 }).toBuffer({ resolveWithObject: true })

  const variants = {} as ProcessedImage['variants']
  for (const [name, width] of Object.entries(IMAGE_VARIANTS) as [VariantName, number][]) {
    const out = await base
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: name === 'thumb' ? 72 : 80 })
      .toBuffer({ resolveWithObject: true })
    variants[name] = { buffer: out.data, width: out.info.width, height: out.info.height }
  }

  const blur = await base.clone().resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer()

  return {
    width: original.info.width,
    height: original.info.height,
    original: { buffer: original.data, width: original.info.width, height: original.info.height },
    variants,
    blurDataUrl: `data:image/webp;base64,${blur.toString('base64')}`,
  }
}

/** Magic-byte sniffing for the upload types we accept (never trust the client MIME type). */
export function sniffMime(buf: Buffer): string | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  if (buf.subarray(4, 12).toString('ascii').startsWith('ftypavif')) return 'image/avif'
  if (buf.subarray(0, 6).toString('ascii') === 'GIF87a' || buf.subarray(0, 6).toString('ascii') === 'GIF89a') return 'image/gif'
  if (buf.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf'
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    // ZIP container — accept only Word documents (DOCX contains "word/" entries)
    const head = buf.subarray(0, Math.min(buf.length, 64 * 1024)).toString('latin1')
    if (head.includes('word/') || head.includes('[Content_Types].xml')) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    return 'application/zip'
  }
  if (buf.subarray(4, 8).toString('ascii') === 'ftyp') return 'video/mp4'
  return null
}

export const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
export const DOC_MIME = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
