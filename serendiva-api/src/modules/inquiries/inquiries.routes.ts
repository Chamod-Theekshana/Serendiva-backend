import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { adminErrorResponses, errorResponses, IdParams } from '@/lib/schemas'
import {
  AdminInquiriesQuery,
  AdminInquiryList,
  AdminInquirySchema,
  InquiryBody,
  InquiryResult,
  InquiryUpdateBody,
} from './inquiries.schemas'
import { createInquiriesService } from './inquiries.service'
import { csvFilename } from './lead-helpers'

/** POST /api/v1/inquiries */
export const inquiriesPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createInquiriesService(app.deps)

  app.post(
    '/inquiries',
    {
      config: { rateLimit: { max: app.deps.env.FORM_RATE_LIMIT, timeWindow: '1 minute' } },
      schema: {
        tags: ['Forms'],
        summary: 'Send a travel inquiry (saved first, then the guide and the visitor are emailed)',
        description:
          'Returns the reference code immediately; emails are sent in the background and retried if they fail. ' +
          'Optional fields may be omitted or sent as "".',
        body: InquiryBody,
        response: { 201: InquiryResult, ...errorResponses },
      },
    },
    async (req, reply) => reply.status(201).send(await service.submit(req.body, { ip: req.ip, log: req.log })),
  )
}

/** /api/v1/admin/inquiries */
export const inquiriesAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createInquiriesService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Leads']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/inquiries',
    { schema: { tags, security, summary: 'List inquiries (newest first) with status counts', querystring: AdminInquiriesQuery, response: { 200: AdminInquiryList, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/inquiries/export.csv',
    {
      schema: {
        tags,
        security,
        summary: 'Download inquiries as CSV (same filters as the list, no pagination)',
        querystring: AdminInquiriesQuery.omit({ page: true, pageSize: true }),
        response: { 200: z.string().describe('text/csv attachment'), ...adminErrorResponses },
      },
    },
    async (req, reply) => {
      const csv = await service.exportCsv(req.query)
      return reply
        .header('content-type', 'text/csv; charset=utf-8')
        .header('content-disposition', `attachment; filename="${csvFilename('inquiries')}"`)
        .header('cache-control', 'no-store')
        .send(csv)
    },
  )
  app.get(
    '/inquiries/:id',
    { schema: { tags, security, summary: 'Get an inquiry', params: IdParams, response: { 200: AdminInquirySchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.patch(
    '/inquiries/:id',
    { schema: { tags, security, summary: 'Update status and/or internal notes', params: IdParams, body: InquiryUpdateBody, response: { 200: AdminInquirySchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.delete(
    '/inquiries/:id',
    { schema: { tags, security, summary: 'Delete an inquiry', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
  app.post(
    '/inquiries/:id/resend-emails',
    {
      schema: {
        tags,
        security,
        summary: 'Retry the guide / visitor emails that have not been delivered yet',
        description: 'Send no body (or an empty JSON object). Emails that were already delivered are not sent again.',
        params: IdParams,
        response: { 200: AdminInquirySchema, ...adminErrorResponses },
      },
    },
    async (req) => service.resendEmails(req.params.id, req.log),
  )
}
