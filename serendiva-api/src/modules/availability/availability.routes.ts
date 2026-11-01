import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams } from '@/lib/schemas'
import {
  AdminAvailabilityListSchema,
  AdminAvailabilityQuery,
  AdminAvailabilityRangeSchema,
  AvailabilityCalendarSchema,
  AvailabilityInput,
  AvailabilityQuery,
} from './availability.schemas'
import { createAvailabilityService } from './availability.service'

/** GET /api/v1/availability */
export const availabilityPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createAvailabilityService(app.deps)

  app.get(
    '/availability',
    {
      config: publicCache,
      schema: {
        tags: ['Content'],
        summary: "The guide's busy / available date ranges (default: today to +12 months)",
        querystring: AvailabilityQuery,
        response: { 200: AvailabilityCalendarSchema, ...errorResponses },
      },
    },
    async (req) => service.calendar(req.query),
  )
}

/** /api/v1/admin/availability */
export const availabilityAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createAvailabilityService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/availability',
    { schema: { tags, security, summary: 'List availability ranges (optionally overlapping a window)', querystring: AdminAvailabilityQuery, response: { 200: AdminAvailabilityListSchema, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/availability/:id',
    { schema: { tags, security, summary: 'Get an availability range', params: IdParams, response: { 200: AdminAvailabilityRangeSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/availability',
    { schema: { tags, security, summary: 'Create an availability range', body: AvailabilityInput, response: { 201: AdminAvailabilityRangeSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.put(
    '/availability/:id',
    { schema: { tags, security, summary: 'Replace an availability range', params: IdParams, body: AvailabilityInput, response: { 200: AdminAvailabilityRangeSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.delete(
    '/availability/:id',
    { schema: { tags, security, summary: 'Delete an availability range', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
