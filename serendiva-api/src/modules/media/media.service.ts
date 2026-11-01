import type { FastifyBaseLogger } from 'fastify'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import { compactTranslatable, LOCALES } from '@/lib/i18n'
import { AppError, notFound, validationError } from '@/lib/errors'
import { IMAGE_MIME, processImage, sniffMime, type ProcessedImage } from '@/lib/image'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { Tags } from '@/lib/revalidate'
import { asObj } from '@/modules/shared/json-read'
import { createMediaRepository, type AdminMediaRow } from './media.repository'
import { findMediaUsage, scanMediaUsage } from './media.usage'
import {
  createMediaId,
  DEFAULT_FOLDER,
  deleteStoredKeys,
  DOC_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  mediaKeyBase,
  storageKeysOf,
  storeProcessedImage,
} from './media.files'
import {
  MediaUploadFields,
  type AdminMedia,
  type AdminMediaDetail,
  type AdminMediaQueryT,
  type MediaUpdateBodyT,
  type MediaUploadResult,
} from './media.schemas'

/** One file read from the multipart request. */
export interface IncomingFile {
  fileName: string
  buffer: Buffer
  /** true when the file exceeded the size limit and was cut off by the parser */
  truncated: boolean
}

export interface UploadInput {
  files: IncomingFile[]
  altText?: string
  folder?: string
}

/** A per-file problem the admin can act on (shown next to the file name). */
class FileRejected extends Error {}

const ALLOWED_LABEL = 'JPEG, PNG, WebP, AVIF, GIF, PDF, DOCX'
const MAX_MB = MAX_UPLOAD_BYTES / 1024 / 1024

function variantOf(v: unknown) {
  const o = asObj(v)
  if (!o || typeof o.url !== 'string') return undefined
  const int = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : null)
  return { url: o.url, width: int(o.width), height: int(o.height) }
}

function toAdminMedia(m: AdminMediaRow, usageCount: number): AdminMedia {
  const variants = asObj(m.variants) ?? {}
  const thumb = variantOf(variants.thumb)
  const medium = variantOf(variants.medium)
  const large = variantOf(variants.large)
  const alt: Record<string, string> = {}
  const rawAlt = asObj(m.altText) ?? {}
  for (const loc of LOCALES) {
    const v = rawAlt[loc]
    if (typeof v === 'string' && v.trim()) alt[loc] = v
  }
  return {
    id: m.id,
    url: m.url,
    thumbUrl: thumb?.url ?? null,
    mime: m.mime,
    size: m.size,
    width: m.width,
    height: m.height,
    variants: { ...(thumb ? { thumb } : {}), ...(medium ? { medium } : {}), ...(large ? { large } : {}) },
    blurDataUrl: m.blurDataUrl,
    altText: alt,
    originalName: m.originalName,
    createdAt: m.createdAt.toISOString(),
    usageCount,
  }
}

/** Keep only the last path segment, drop control characters, cap the length. */
function cleanFileName(name: string): string {
  // eslint-disable-next-line no-control-regex
  const base = (name.split(/[\\/]/).pop() ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim()
  return base.slice(-200) || 'file'
}

export function createMediaService(deps: AppDeps) {
  const repo = createMediaRepository(deps.prisma)
  const { storage } = deps

  async function withUsageCounts(rows: AdminMediaRow[]): Promise<AdminMedia[]> {
    const usage = await scanMediaUsage(deps.prisma, rows.map((r) => r.id))
    return rows.map((r) => toAdminMedia(r, usage.get(r.id)?.length ?? 0))
  }

  async function storeOne(
    file: IncomingFile,
    ctx: { folder: string; altText: string | undefined; uploadedById: string | null; log?: FastifyBaseLogger },
  ): Promise<AdminMedia> {
    if (file.truncated) throw new FileRejected(`File is larger than ${MAX_MB} MB`)
    if (!file.buffer.length) throw new FileRejected('File is empty')

    const mime = sniffMime(file.buffer)
    const docExt = mime ? DOC_EXTENSIONS[mime] : undefined
    if (!mime || (!IMAGE_MIME.includes(mime) && !docExt)) {
      throw new FileRejected(`Unsupported file type. Allowed: ${ALLOWED_LABEL}`)
    }

    let processed: ProcessedImage | null = null
    if (IMAGE_MIME.includes(mime)) {
      try {
        processed = await processImage(file.buffer)
      } catch {
        throw new FileRejected('This image could not be read (corrupt or unsupported encoding)')
      }
    }

    const id = createMediaId()
    const base = mediaKeyBase(ctx.folder, id, file.fileName)
    const altText = ctx.altText ? { en: ctx.altText } : null
    const written: string[] = []
    try {
      if (processed) {
        const stored = await storeProcessedImage(storage, base, processed)
        written.push(...storageKeysOf(stored))
        const row = await repo.create({
          id,
          key: stored.key,
          url: stored.url,
          mime: stored.mime,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          variants: stored.variants,
          blurDataUrl: stored.blurDataUrl,
          altText,
          originalName: file.fileName,
          uploadedById: ctx.uploadedById,
        })
        return toAdminMedia(row, 0)
      }

      const key = `${base}.${docExt}`
      const stored = await storage.put(key, file.buffer, mime)
      written.push(stored.key)
      const row = await repo.create({
        id,
        key: stored.key,
        url: stored.url,
        mime,
        size: file.buffer.length,
        width: null,
        height: null,
        variants: null,
        blurDataUrl: null,
        altText,
        originalName: file.fileName,
        uploadedById: ctx.uploadedById,
      })
      return toAdminMedia(row, 0)
    } catch (err) {
      ctx.log?.error({ err, fileName: file.fileName }, 'media upload failed, removing stored files')
      const left = await deleteStoredKeys(storage, written)
      if (left.length) ctx.log?.warn({ keys: left }, 'could not remove files of a failed upload')
      throw new Error('The file could not be saved, please try again')
    }
  }

  return {
    async list(q: AdminMediaQueryT) {
      const and: Prisma.MediaWhereInput[] = []
      if (q.type === 'image') and.push({ mime: { startsWith: 'image/' } })
      if (q.type === 'document') and.push({ NOT: { mime: { startsWith: 'image/' } } })
      if (q.folder) {
        // Seed rows that were not imported yet still use "seed/..." keys.
        and.push({ OR: [{ key: { startsWith: `media/${q.folder}/` } }, { key: { startsWith: `${q.folder}/` } }] })
      }
      if (q.q) {
        and.push({
          OR: [
            { originalName: { contains: q.q, mode: 'insensitive' } },
            { key: { contains: q.q, mode: 'insensitive' } },
            ...LOCALES.map((loc) => ({ altText: { path: [loc], string_contains: q.q, mode: 'insensitive' as const } })),
          ],
        })
      }
      const { skip, take } = toSkipTake(q)
      const [rows, total] = await repo.list({ AND: and }, skip, take)
      return { items: await withUsageCounts(rows), meta: pageMeta(q, total) }
    },

    async get(id: string): Promise<AdminMediaDetail> {
      const row = await repo.findById(id)
      if (!row) throw notFound('Media')
      const usage = await findMediaUsage(deps.prisma, id)
      return { ...toAdminMedia(row, usage.length), usage }
    },

    /**
     * Stores every file independently: a rejected or failed file is reported in `errors`
     * and never prevents the other files from being saved.
     */
    async upload(
      input: UploadInput,
      ctx: { uploadedById: string | null; log?: FastifyBaseLogger },
    ): Promise<MediaUploadResult> {
      const fields = MediaUploadFields.safeParse({ altText: input.altText, folder: input.folder })
      if (!fields.success) {
        throw validationError(fields.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
      }
      if (!input.files.length) throw validationError([{ path: 'files', message: 'Attach at least one file' }])

      const folder = fields.data.folder ?? DEFAULT_FOLDER
      const result: MediaUploadResult = { items: [], errors: [] }
      // Sequential on purpose: image processing is CPU/memory heavy.
      for (const file of input.files) {
        const fileName = cleanFileName(file.fileName)
        try {
          result.items.push(
            await storeOne({ ...file, fileName }, { folder, altText: fields.data.altText, ...ctx }),
          )
        } catch (err) {
          result.errors.push({ fileName, message: (err as Error).message })
        }
      }
      return result
    },

    async updateAltText(id: string, body: MediaUpdateBodyT): Promise<AdminMedia> {
      const existing = await repo.findById(id)
      if (!existing) throw notFound('Media')
      const row = await repo.updateAltText(id, compactTranslatable(body.altText))
      const hits = (await scanMediaUsage(deps.prisma, [id])).get(id) ?? []
      deps.revalidator.revalidate([
        Tags.gallery,
        Tags.tours,
        Tags.destinations,
        Tags.blog,
        Tags.settings,
        ...hits.flatMap((h) => h.tags),
      ])
      return toAdminMedia(row, hits.length)
    },

    /** 409 MEDIA_IN_USE (with the usage list) while anything still references the file. */
    async remove(id: string, log?: FastifyBaseLogger): Promise<void> {
      const existing = await repo.findById(id)
      if (!existing) throw notFound('Media')
      const usage = await findMediaUsage(deps.prisma, id)
      if (usage.length) {
        throw new AppError(409, 'MEDIA_IN_USE', `This file is still used in ${usage.length} place(s). Remove it there first.`, {
          usage,
        })
      }
      // Row first: if that fails nothing is lost; leftover files after a failed storage delete are only orphans.
      await repo.delete(id)
      const left = await deleteStoredKeys(storage, storageKeysOf(existing))
      if (left.length) log?.warn({ mediaId: id, keys: left }, 'media row deleted but some files could not be removed')
    },
  }
}

export type MediaService = ReturnType<typeof createMediaService>
