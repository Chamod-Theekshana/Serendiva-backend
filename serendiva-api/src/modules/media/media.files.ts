import { randomBytes } from 'node:crypto'
import type { StorageDriver } from '@/lib/storage'
import { IMAGE_VARIANTS, type ProcessedImage, type VariantName } from '@/lib/image'
import { slugify } from '@/lib/slug'

/**
 * Storage helpers shared by the media module and `scripts/import-seed-images.ts`.
 *
 * Key layout (same for the local driver and S3/R2):
 *   media/<folder>/<yyyy>/<mm>/<id>-<name>.webp          original, re-encoded as WebP
 *   media/<folder>/<yyyy>/<mm>/<id>-<name>-thumb.webp     + -medium / -large variants
 *   media/<folder>/<yyyy>/<mm>/<id>-<name>.pdf            documents are stored as uploaded
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const MAX_UPLOAD_FILES = 20
export const DEFAULT_FOLDER = 'general'

export const DOC_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

/** cuid-like id ("c" + time + randomness) so the key can embed the row id before the row exists. */
export function createMediaId(): string {
  const time = Date.now().toString(36).padStart(9, '0')
  const rand = BigInt(`0x${randomBytes(10).toString('hex')}`).toString(36).padStart(16, '0')
  return `c${time}${rand}`.slice(0, 26)
}

/** "IMG_2041 Sigiriya.JPG" -> "img-2041-sigiriya" (extension dropped, never empty). */
export function fileSlug(fileName: string): string {
  const base = fileName.replace(/\.[a-z0-9]{1,5}$/i, '')
  return slugify(base).slice(0, 60).replace(/-+$/, '') || 'file'
}

/** `media/<folder>/<yyyy>/<mm>/<id>-<slug>` (without extension). */
export function mediaKeyBase(folder: string, id: string, fileName: string, now = new Date()): string {
  const yyyy = String(now.getUTCFullYear())
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `media/${folder}/${yyyy}/${mm}/${id}-${fileSlug(fileName)}`
}

export interface StoredVariant {
  key: string
  url: string
  width: number
  height: number
}

export interface StoredImage {
  key: string
  url: string
  mime: 'image/webp'
  size: number
  width: number
  height: number
  /** Value for the `Media.variants` JSON column */
  variants: Record<VariantName, StoredVariant>
  blurDataUrl: string
}

/** Best-effort removal; returns the keys that could not be deleted (missing files count as deleted). */
export async function deleteStoredKeys(storage: StorageDriver, keys: string[]): Promise<string[]> {
  const results = await Promise.allSettled(keys.map((k) => storage.delete(k)))
  return keys.filter((_, i) => results[i]?.status === 'rejected')
}

/**
 * Writes the WebP original and every variant under `<base>.webp` / `<base>-<variant>.webp`.
 * If any write fails, the files already written are removed before the error is re-thrown.
 */
export async function storeProcessedImage(
  storage: StorageDriver,
  base: string,
  img: ProcessedImage,
): Promise<StoredImage> {
  const names = Object.keys(IMAGE_VARIANTS) as VariantName[]
  const jobs = [
    { name: null, key: `${base}.webp`, buffer: img.original.buffer },
    ...names.map((name) => ({ name, key: `${base}-${name}.webp`, buffer: img.variants[name].buffer })),
  ]
  const results = await Promise.allSettled(jobs.map((j) => storage.put(j.key, j.buffer, 'image/webp')))
  const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
  if (failed) {
    await deleteStoredKeys(
      storage,
      jobs.filter((_, i) => results[i]?.status === 'fulfilled').map((j) => j.key),
    )
    throw failed.reason
  }

  const urlOf = (i: number) => (results[i] as PromiseFulfilledResult<{ url: string }>).value.url
  const variants = {} as Record<VariantName, StoredVariant>
  names.forEach((name, i) => {
    const v = img.variants[name]
    variants[name] = { key: jobs[i + 1]!.key, url: urlOf(i + 1), width: v.width, height: v.height }
  })

  return {
    key: jobs[0]!.key,
    url: urlOf(0),
    mime: 'image/webp',
    size: img.original.buffer.length,
    width: img.width,
    height: img.height,
    variants,
    blurDataUrl: img.blurDataUrl,
  }
}

/** Every storage key that belongs to a Media row: the original plus all variant keys. */
export function storageKeysOf(media: { key: string; variants: unknown }): string[] {
  const keys = [media.key]
  const variants = media.variants
  if (variants && typeof variants === 'object' && !Array.isArray(variants)) {
    for (const v of Object.values(variants as Record<string, unknown>)) {
      const key = v && typeof v === 'object' ? (v as { key?: unknown }).key : undefined
      if (typeof key === 'string' && key) keys.push(key)
    }
  }
  return [...new Set(keys)]
}
