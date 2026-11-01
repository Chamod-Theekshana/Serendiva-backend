import type { FastifyRequest } from 'fastify'
import { AppError, unsupportedMedia } from '@/lib/errors'
import { MAX_ATTACHMENT_BYTES } from './proposals.schemas'

export interface RawAttachment {
  buffer: Buffer
  filename: string
}

/** Raw multipart form: every text field as a list of values (fields may repeat). */
export interface RawProposalForm {
  fields: Record<string, string[]>
  /** Fields whose value was cut off by the per-field size limit (rejected by validation). */
  truncated: string[]
  attachment: RawAttachment | null
}

const ATTACHMENT_FIELD = 'attachment'

export const attachmentTooLarge = () =>
  new AppError(413, 'PAYLOAD_TOO_LARGE', 'The attachment must be 5 MB or smaller', [
    { path: ATTACHMENT_FIELD, message: 'The file must be 5 MB or smaller' },
  ])

/**
 * Reads a multipart/form-data request. The attachment is read through busboy's size limit, so at
 * most 5 MB is ever held in memory; anything larger is rejected with 413.
 */
export async function readProposalForm(req: FastifyRequest): Promise<RawProposalForm> {
  if (!req.isMultipart()) throw unsupportedMedia('Send the form as multipart/form-data')

  const form: RawProposalForm = { fields: {}, truncated: [], attachment: null }
  const parts = req.parts({
    limits: { fileSize: MAX_ATTACHMENT_BYTES, files: 1, fields: 60, fieldSize: 32 * 1024, parts: 62 },
  })

  for await (const part of parts) {
    if (part.type === 'file') {
      let buffer: Buffer
      try {
        buffer = await part.toBuffer()
      } catch (err) {
        if ((err as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE') throw attachmentTooLarge()
        throw err
      }
      // Browsers send an empty part for an untouched file input.
      if (part.fieldname === ATTACHMENT_FIELD && buffer.length > 0) {
        form.attachment = { buffer, filename: part.filename ?? '' }
      }
      continue
    }
    const value = typeof part.value === 'string' ? part.value : JSON.stringify(part.value)
    ;(form.fields[part.fieldname] ??= []).push(value)
    if (part.valueTruncated) form.truncated.push(part.fieldname)
  }
  return form
}
