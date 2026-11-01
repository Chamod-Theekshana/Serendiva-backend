import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { adminErrorResponses, ErrorResponseSchema, errorResponses, IdParams } from '@/lib/schemas'
import { attachmentDisposition, csvFilename } from '@/modules/inquiries/lead-helpers'
import {
  AdminProposalList,
  AdminProposalSchema,
  AdminProposalsQuery,
  ProposalResult,
  ProposalUpdateBody,
} from './proposals.schemas'
import { readProposalForm } from './proposals.multipart'
import { createProposalsService } from './proposals.service'

const FORM_DESCRIPTION = `Send as **multipart/form-data** (not JSON). Fields:

| field | rules |
| --- | --- |
| company | required, 2–160 chars |
| contactPerson | required, 2–120 chars |
| email | required, valid email |
| phone | required, 5–40 chars |
| groupSize | required, ≤ 60 chars (e.g. "25–40 guests") |
| dates | required, ≤ 120 chars |
| eventType | required, ≤ 80 chars |
| logistics | optional, ≤ 10 items of ≤ 60 chars — repeat the field per item or send one comma-separated value |
| message | optional, ≤ 5000 chars |
| sourcePage | optional, ≤ 300 chars |
| locale | optional, en / zh / de (default en) |
| website | honeypot — leave empty |
| turnstileToken | Cloudflare Turnstile token (required only when Turnstile is enabled) |
| attachment | optional file, PDF or DOCX, ≤ 5 MB (checked by content, not by extension) |

Errors: 400 VALIDATION_ERROR with \`details: [{ path, message }]\`, 413 when the attachment is larger than 5 MB,
415 when it is not a PDF/DOCX (both with \`details: [{ path: "attachment", message }]\`).`

/** Binary download (streamed, never serialized). */
const FileDownload = z
  .custom<Buffer | NodeJS.ReadableStream>()
  .meta({ type: 'string', format: 'binary', description: 'File contents (application/pdf or DOCX)' })

/** POST /api/v1/corporate-proposals */
export const proposalsPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createProposalsService(app.deps)

  app.post(
    '/corporate-proposals',
    {
      config: { rateLimit: { max: app.deps.env.FORM_RATE_LIMIT, timeWindow: '1 minute' } },
      schema: {
        tags: ['Forms'],
        summary: 'Request a corporate proposal (multipart form with optional PDF/DOCX brief)',
        description: FORM_DESCRIPTION,
        consumes: ['multipart/form-data'],
        response: { 201: ProposalResult, 413: ErrorResponseSchema, 415: ErrorResponseSchema, ...errorResponses },
      },
    },
    async (req, reply) => {
      const form = await readProposalForm(req)
      return reply.status(201).send(await service.submit(form, { ip: req.ip, log: req.log }))
    },
  )
}

/** /api/v1/admin/proposals */
export const proposalsAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createProposalsService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Leads']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/proposals',
    { schema: { tags, security, summary: 'List corporate proposals (newest first) with status counts', querystring: AdminProposalsQuery, response: { 200: AdminProposalList, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/proposals/export.csv',
    {
      schema: {
        tags,
        security,
        summary: 'Download corporate proposals as CSV (same filters as the list, no pagination)',
        querystring: AdminProposalsQuery.omit({ page: true, pageSize: true }),
        response: { 200: z.string().describe('text/csv attachment'), ...adminErrorResponses },
      },
    },
    async (req, reply) => {
      const csv = await service.exportCsv(req.query)
      return reply
        .header('content-type', 'text/csv; charset=utf-8')
        .header('content-disposition', `attachment; filename="${csvFilename('proposals')}"`)
        .header('cache-control', 'no-store')
        .send(csv)
    },
  )
  app.get(
    '/proposals/:id',
    { schema: { tags, security, summary: 'Get a corporate proposal', params: IdParams, response: { 200: AdminProposalSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.get(
    '/proposals/:id/attachment',
    {
      schema: {
        tags,
        security,
        summary: 'Download the attached brief (PDF / DOCX)',
        params: IdParams,
        response: { 200: FileDownload, ...adminErrorResponses },
      },
    },
    async (req, reply) => {
      const file = await service.attachment(req.params.id)
      reply
        .header('content-type', file.contentType)
        .header('content-disposition', attachmentDisposition(file.filename))
        .header('cache-control', 'private, no-store')
      if (file.size !== undefined) reply.header('content-length', file.size)
      return reply.send(file.body)
    },
  )
  app.patch(
    '/proposals/:id',
    { schema: { tags, security, summary: 'Update status and/or internal notes', params: IdParams, body: ProposalUpdateBody, response: { 200: AdminProposalSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.delete(
    '/proposals/:id',
    { schema: { tags, security, summary: 'Delete a corporate proposal (and its attachment)', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id, req.log)
      return reply.status(204).send()
    },
  )
  app.post(
    '/proposals/:id/resend-emails',
    {
      schema: {
        tags,
        security,
        summary: 'Retry the guide / visitor emails that have not been delivered yet',
        description: 'Send no body (or an empty JSON object). Emails that were already delivered are not sent again.',
        params: IdParams,
        response: { 200: AdminProposalSchema, ...adminErrorResponses },
      },
    },
    async (req) => service.resendEmails(req.params.id, req.log),
  )
}
