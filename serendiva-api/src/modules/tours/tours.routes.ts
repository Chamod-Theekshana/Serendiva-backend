import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { LocaleQuery } from '@/lib/i18n'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams, OkSchema, ReorderBody, SlugParams, StatusBody } from '@/lib/schemas'
import {
  AdminTourList,
  AdminTourSchema,
  AdminToursQuery,
  TourDetailSchema,
  TourInput,
  TourListSchema,
  ToursQuery,
} from './tours.schemas'
import { createToursService } from './tours.service'

/** GET /api/v1/tours, GET /api/v1/tours/:slug */
export const toursPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createToursService(app.deps)

  app.get(
    '/tours',
    {
      config: publicCache,
      schema: {
        tags: ['Tours'],
        summary: 'List published tours (filters, search, pagination, category facets)',
        querystring: ToursQuery,
        response: { 200: TourListSchema, ...errorResponses },
      },
    },
    async (req) => service.list(req.query),
  )

  app.get(
    '/tours/:slug',
    {
      config: publicCache,
      schema: {
        tags: ['Tours'],
        summary: 'Tour detail with days, gallery, destinations, FAQs, reviews and related tours',
        params: SlugParams,
        querystring: LocaleQuery,
        response: { 200: TourDetailSchema, ...errorResponses },
      },
    },
    async (req) => service.detail(req.params.slug, req.query.locale),
  )
}

/** /api/v1/admin/tours */
export const toursAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createToursService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/tours',
    { schema: { tags, security, summary: 'List tours', querystring: AdminToursQuery, response: { 200: AdminTourList, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/tours/:id',
    { schema: { tags, security, summary: 'Get a tour for editing', params: IdParams, response: { 200: AdminTourSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/tours',
    { schema: { tags, security, summary: 'Create a tour (with days, gallery, categories, destinations)', body: TourInput, response: { 201: AdminTourSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.put(
    '/tours/:id',
    { schema: { tags, security, summary: 'Replace a tour', params: IdParams, body: TourInput, response: { 200: AdminTourSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.patch(
    '/tours/:id/status',
    { schema: { tags, security, summary: 'Publish / unpublish', params: IdParams, body: StatusBody, response: { 200: AdminTourSchema, ...adminErrorResponses } } },
    async (req) => service.setStatus(req.params.id, req.body.status),
  )
  app.patch(
    '/tours/order',
    { schema: { tags, security, summary: 'Bulk update display order (drag & drop)', body: ReorderBody, response: { 200: OkSchema, ...adminErrorResponses } } },
    async (req) => {
      await service.reorder(req.body.items)
      return { ok: true as const }
    },
  )
  app.delete(
    '/tours/:id',
    { schema: { tags, security, summary: 'Delete a tour', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
