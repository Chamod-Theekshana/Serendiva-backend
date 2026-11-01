import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import type { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { adminErrorResponses, ErrorResponseSchema, IdParams } from '@/lib/schemas'
import { unsupportedMedia } from '@/lib/errors'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_FILES } from './media.files'
import {
  AdminMediaDetailSchema,
  AdminMediaListSchema,
  AdminMediaQuery,
  AdminMediaSchema,
  MediaUpdateBody,
  MediaUploadResultSchema,
} from './media.schemas'
import { createMediaService, type IncomingFile, type UploadInput } from './media.service'

type PartsOptions = NonNullable<Parameters<FastifyRequest['parts']>[0]>

/**
 * Reads the multipart body into memory (files are capped at 10 MB × 20) so the text fields can be
 * used no matter whether the client sends them before or after the files.
 */
async function readUpload(req: FastifyRequest): Promise<UploadInput> {
  // Oversized files are reported per file (part.file.truncated) instead of failing the whole request.
  const options: PartsOptions & { throwFileSizeLimit: boolean } = {
    limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES },
    throwFileSizeLimit: false,
  }
  const files: IncomingFile[] = []
  const fields: Record<string, string> = {}
  for await (const part of req.parts(options)) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer()
      // Browsers send an empty, nameless part for a file input with nothing selected.
      if (!part.filename && buffer.length === 0) continue
      files.push({ fileName: part.filename, buffer, truncated: part.file.truncated })
    } else if (typeof part.value === 'string') {
      fields[part.fieldname] = part.value
    }
  }
  return { files, altText: fields.altText, folder: fields.folder }
}

const UPLOAD_DESCRIPTION = [
  'Send `multipart/form-data` with:',
  '',
  `- \`files\` — 1–${MAX_UPLOAD_FILES} files (repeat the field). Images: JPEG, PNG, WebP, AVIF, GIF; documents: PDF, DOCX. Max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB each. The type is detected from the file content, not the name or browser MIME type.`,
  '- `altText` (optional) — English alt text applied to every uploaded file (max 300 characters).',
  '- `folder` (optional) — lowercase slug used in the storage path, e.g. `tours`, `blog`, `gallery` (default `general`).',
  '',
  'Images are re-encoded to WebP (EXIF removed) with `thumb` (400px), `medium` (1024px) and `large` (1920px) variants and a blur placeholder; animated GIFs keep their first frame. Documents are stored as-is.',
  '',
  'Every file is handled independently: rejected files are listed in `errors` and the others are still saved (the response is 201 even when every file was rejected — check `errors`). ' +
    'More than 20 files → 413.',
].join('\n')

/** /api/v1/admin/media */
export const mediaAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createMediaService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Media']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/media',
    {
      schema: {
        tags,
        security,
        summary: 'List media (newest first; search, type and folder filters)',
        description: '`usageCount` is computed for every item on the page; use GET /media/:id for the list of places.',
        querystring: AdminMediaQuery,
        response: { 200: AdminMediaListSchema, ...adminErrorResponses },
      },
    },
    async (req) => service.list(req.query),
  )

  app.get(
    '/media/:id',
    {
      schema: {
        tags,
        security,
        summary: 'Get one media file with the list of places that use it',
        params: IdParams,
        response: { 200: AdminMediaDetailSchema, ...adminErrorResponses },
      },
    },
    async (req) => service.get(req.params.id),
  )

  app.post(
    '/media',
    {
      schema: {
        tags,
        security,
        summary: 'Upload 1–20 images or documents (multipart/form-data)',
        description: UPLOAD_DESCRIPTION,
        consumes: ['multipart/form-data'],
        response: {
          201: MediaUploadResultSchema,
          ...adminErrorResponses,
          413: ErrorResponseSchema,
          415: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.isMultipart()) throw unsupportedMedia('Send the files as multipart/form-data')
      const input = await readUpload(req)
      const result = await service.upload(input, { uploadedById: req.admin?.id ?? null, log: req.log })
      return reply.status(201).send(result)
    },
  )

  app.patch(
    '/media/:id',
    {
      schema: {
        tags,
        security,
        summary: 'Update alt text (per locale)',
        params: IdParams,
        body: MediaUpdateBody,
        response: { 200: AdminMediaSchema, ...adminErrorResponses },
      },
    },
    async (req) => service.updateAltText(req.params.id, req.body),
  )

  app.delete(
    '/media/:id',
    {
      schema: {
        tags,
        security,
        summary: 'Delete a media file (409 MEDIA_IN_USE with details.usage while it is referenced)',
        params: IdParams,
        response: { 204: z.undefined(), ...adminErrorResponses },
      },
    },
    async (req, reply) => {
      await service.remove(req.params.id, req.log)
      return reply.status(204).send()
    },
  )
}
