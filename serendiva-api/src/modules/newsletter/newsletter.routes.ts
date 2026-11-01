import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { adminErrorResponses, errorResponses, IdParams } from '@/lib/schemas'
import { csvFilename } from '@/modules/inquiries/lead-helpers'
import {
  AdminSubscriberList,
  AdminSubscribersExportQuery,
  AdminSubscribersQuery,
  NewsletterSubscribeBody,
  NewsletterSubscribeResult,
  NewsletterTokenQuery,
  NewsletterTokenResult,
  NewsletterUnsubscribeResult,
} from './newsletter.schemas'
import { createNewsletterService } from './newsletter.service'

/** /api/v1/newsletter/* (double opt-in) */
export const newsletterPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createNewsletterService(app.deps)
  const tags = ['Newsletter']

  app.post(
    '/newsletter/subscribe',
    {
      config: { rateLimit: { max: app.deps.env.FORM_RATE_LIMIT, timeWindow: '1 minute' } },
      schema: {
        tags,
        summary: 'Subscribe (sends a confirmation email unless the address is already confirmed)',
        body: NewsletterSubscribeBody,
        response: { 200: NewsletterSubscribeResult, ...errorResponses },
      },
    },
    async (req) => service.subscribe(req.body, { ip: req.ip, log: req.log }),
  )

  app.get(
    '/newsletter/confirm',
    {
      schema: {
        tags,
        summary: 'Confirm a subscription with the token from the confirmation email',
        description: 'Unknown tokens return 400 with code INVALID_TOKEN.',
        querystring: NewsletterTokenQuery,
        response: { 200: NewsletterTokenResult, ...errorResponses },
      },
    },
    async (req, reply) => {
      reply.header('cache-control', 'no-store')
      return service.confirm(req.query.token)
    },
  )

  app.get(
    '/newsletter/unsubscribe',
    {
      schema: {
        tags,
        summary: 'Unsubscribe with the token from any newsletter email (idempotent)',
        description: 'Unknown tokens return 400 with code INVALID_TOKEN.',
        querystring: NewsletterTokenQuery,
        response: { 200: NewsletterUnsubscribeResult, ...errorResponses },
      },
    },
    async (req, reply) => {
      reply.header('cache-control', 'no-store')
      return service.unsubscribe(req.query.token)
    },
  )
}

/** /api/v1/admin/newsletter */
export const newsletterAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createNewsletterService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Leads']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/newsletter',
    { schema: { tags, security, summary: 'List newsletter subscribers (newest first) with status counts', querystring: AdminSubscribersQuery, response: { 200: AdminSubscriberList, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/newsletter/export.csv',
    {
      schema: {
        tags,
        security,
        summary: 'Download subscribers as CSV (confirmed only unless ?status= is given)',
        querystring: AdminSubscribersExportQuery,
        response: { 200: z.string().describe('text/csv attachment'), ...adminErrorResponses },
      },
    },
    async (req, reply) => {
      const csv = await service.exportCsv(req.query)
      return reply
        .header('content-type', 'text/csv; charset=utf-8')
        .header('content-disposition', `attachment; filename="${csvFilename('newsletter')}"`)
        .header('cache-control', 'no-store')
        .send(csv)
    },
  )
  app.delete(
    '/newsletter/:id',
    { schema: { tags, security, summary: 'Delete a subscriber', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
