import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams, OkSchema, ReorderBody, StatusBody } from '@/lib/schemas'
import { AdminFaqListSchema, AdminFaqSchema, AdminFaqsQuery, FaqInput, FaqListSchema, FaqsQuery } from './faqs.schemas'
import { createFaqsService } from './faqs.service'

/** GET /api/v1/faqs */
export const faqsPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createFaqsService(app.deps)

  app.get(
    '/faqs',
    {
      config: publicCache,
      schema: {
        tags: ['Content'],
        summary: 'Published FAQs (filter by scope, tour slug or destination slug)',
        querystring: FaqsQuery,
        response: { 200: FaqListSchema, ...errorResponses },
      },
    },
    async (req) => service.list(req.query),
  )
}

/** /api/v1/admin/faqs */
export const faqsAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createFaqsService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/faqs',
    { schema: { tags, security, summary: 'List FAQs', querystring: AdminFaqsQuery, response: { 200: AdminFaqListSchema, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/faqs/:id',
    { schema: { tags, security, summary: 'Get an FAQ', params: IdParams, response: { 200: AdminFaqSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/faqs',
    { schema: { tags, security, summary: 'Create an FAQ', body: FaqInput, response: { 201: AdminFaqSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.put(
    '/faqs/:id',
    { schema: { tags, security, summary: 'Replace an FAQ', params: IdParams, body: FaqInput, response: { 200: AdminFaqSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.patch(
    '/faqs/:id/status',
    { schema: { tags, security, summary: 'Publish / unpublish', params: IdParams, body: StatusBody, response: { 200: AdminFaqSchema, ...adminErrorResponses } } },
    async (req) => service.setStatus(req.params.id, req.body.status),
  )
  app.patch(
    '/faqs/order',
    { schema: { tags, security, summary: 'Bulk update display order (drag & drop)', body: ReorderBody, response: { 200: OkSchema, ...adminErrorResponses } } },
    async (req) => {
      await service.reorder(req.body.items)
      return { ok: true as const }
    },
  )
  app.delete(
    '/faqs/:id',
    { schema: { tags, security, summary: 'Delete an FAQ', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
