import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { LocaleQuery } from '@/lib/i18n'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams, OkSchema, ReorderBody, SlugParams, StatusBody } from '@/lib/schemas'
import {
  AdminDestinationList,
  AdminDestinationSchema,
  AdminDestinationsQuery,
  AdminRegionListSchema,
  AdminRegionSchema,
  DestinationDetailSchema,
  DestinationInput,
  DestinationListSchema,
  DestinationsQuery,
  LocaleOnlyQuery,
  RegionInput,
  RegionListSchema,
} from './destinations.schemas'
import { createDestinationsService } from './destinations.service'

/** GET /api/v1/regions, /api/v1/destinations, /api/v1/destinations/:slug */
export const destinationsPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createDestinationsService(app.deps)
  const tags = ['Destinations']

  app.get(
    '/regions',
    {
      config: publicCache,
      schema: {
        tags,
        summary: 'Regions (ordered) with month-by-month climate and published destination counts',
        querystring: LocaleOnlyQuery,
        response: { 200: RegionListSchema, ...errorResponses },
      },
    },
    async (req) => service.listRegions(req.query.locale),
  )

  app.get(
    '/destinations',
    {
      config: publicCache,
      schema: {
        tags,
        summary: 'Published destinations (region filter, search, region facets)',
        querystring: DestinationsQuery,
        response: { 200: DestinationListSchema, ...errorResponses },
      },
    },
    async (req) => service.list(req.query),
  )

  app.get(
    '/destinations/:slug',
    {
      config: publicCache,
      schema: {
        tags,
        summary: 'Destination detail with experiences, stays, gallery, tours and FAQs',
        params: SlugParams,
        querystring: LocaleQuery,
        response: { 200: DestinationDetailSchema, ...errorResponses },
      },
    },
    async (req) => service.detail(req.params.slug, req.query.locale),
  )
}

/** /api/v1/admin/regions, /api/v1/admin/destinations */
export const destinationsAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createDestinationsService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  // ---------------------------------------------------------------- regions

  app.get(
    '/regions',
    { schema: { tags, security, summary: 'List regions', response: { 200: AdminRegionListSchema, ...adminErrorResponses } } },
    async () => service.adminListRegions(),
  )
  app.get(
    '/regions/:id',
    { schema: { tags, security, summary: 'Get a region for editing', params: IdParams, response: { 200: AdminRegionSchema, ...adminErrorResponses } } },
    async (req) => service.adminGetRegion(req.params.id),
  )
  app.post(
    '/regions',
    { schema: { tags, security, summary: 'Create a region', body: RegionInput, response: { 201: AdminRegionSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.createRegion(req.body)),
  )
  app.put(
    '/regions/:id',
    { schema: { tags, security, summary: 'Replace a region', params: IdParams, body: RegionInput, response: { 200: AdminRegionSchema, ...adminErrorResponses } } },
    async (req) => service.updateRegion(req.params.id, req.body),
  )
  app.patch(
    '/regions/order',
    { schema: { tags, security, summary: 'Bulk update region order (drag & drop)', body: ReorderBody, response: { 200: OkSchema, ...adminErrorResponses } } },
    async (req) => {
      await service.reorderRegions(req.body.items)
      return { ok: true as const }
    },
  )
  app.delete(
    '/regions/:id',
    { schema: { tags, security, summary: 'Delete a region (its destinations become unassigned)', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.removeRegion(req.params.id)
      return reply.status(204).send()
    },
  )

  // ---------------------------------------------------------------- destinations

  app.get(
    '/destinations',
    { schema: { tags, security, summary: 'List destinations', querystring: AdminDestinationsQuery, response: { 200: AdminDestinationList, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/destinations/:id',
    { schema: { tags, security, summary: 'Get a destination for editing', params: IdParams, response: { 200: AdminDestinationSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/destinations',
    { schema: { tags, security, summary: 'Create a destination (with gallery)', body: DestinationInput, response: { 201: AdminDestinationSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.put(
    '/destinations/:id',
    { schema: { tags, security, summary: 'Replace a destination', params: IdParams, body: DestinationInput, response: { 200: AdminDestinationSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.patch(
    '/destinations/:id/status',
    { schema: { tags, security, summary: 'Publish / unpublish', params: IdParams, body: StatusBody, response: { 200: AdminDestinationSchema, ...adminErrorResponses } } },
    async (req) => service.setStatus(req.params.id, req.body.status),
  )
  app.patch(
    '/destinations/order',
    { schema: { tags, security, summary: 'Bulk update display order (drag & drop)', body: ReorderBody, response: { 200: OkSchema, ...adminErrorResponses } } },
    async (req) => {
      await service.reorder(req.body.items)
      return { ok: true as const }
    },
  )
  app.delete(
    '/destinations/:id',
    { schema: { tags, security, summary: 'Delete a destination (also deletes its FAQs)', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
