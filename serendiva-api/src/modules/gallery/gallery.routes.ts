import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams, OkSchema, ReorderBody, StatusBody } from '@/lib/schemas'
import {
  AdminGalleryItemSchema,
  AdminGalleryListSchema,
  AdminGalleryQuery,
  GalleryBulkBody,
  GalleryItemInput,
  GalleryListSchema,
  GalleryQuery,
} from './gallery.schemas'
import { createGalleryService } from './gallery.service'

/** GET /api/v1/gallery */
export const galleryPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createGalleryService(app.deps)

  app.get(
    '/gallery',
    {
      config: publicCache,
      schema: {
        tags: ['Content'],
        summary: 'Published gallery photos and videos (category / type filter, category counts)',
        querystring: GalleryQuery,
        response: { 200: GalleryListSchema, ...errorResponses },
      },
    },
    async (req) => service.list(req.query),
  )
}

/** /api/v1/admin/gallery */
export const galleryAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createGalleryService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/gallery',
    { schema: { tags, security, summary: 'List gallery items', querystring: AdminGalleryQuery, response: { 200: AdminGalleryListSchema, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/gallery/:id',
    { schema: { tags, security, summary: 'Get a gallery item', params: IdParams, response: { 200: AdminGalleryItemSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/gallery',
    { schema: { tags, security, summary: 'Create a gallery item (photo or video)', body: GalleryItemInput, response: { 201: AdminGalleryItemSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.post(
    '/gallery/bulk',
    { schema: { tags, security, summary: 'Add several uploaded photos at once (appended at the end)', body: GalleryBulkBody, response: { 201: AdminGalleryListSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.createBulk(req.body)),
  )
  app.put(
    '/gallery/:id',
    { schema: { tags, security, summary: 'Replace a gallery item', params: IdParams, body: GalleryItemInput, response: { 200: AdminGalleryItemSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.patch(
    '/gallery/:id/status',
    { schema: { tags, security, summary: 'Publish / hide', params: IdParams, body: StatusBody, response: { 200: AdminGalleryItemSchema, ...adminErrorResponses } } },
    async (req) => service.setStatus(req.params.id, req.body.status),
  )
  app.patch(
    '/gallery/order',
    { schema: { tags, security, summary: 'Bulk update display order (drag & drop)', body: ReorderBody, response: { 200: OkSchema, ...adminErrorResponses } } },
    async (req) => {
      await service.reorder(req.body.items)
      return { ok: true as const }
    },
  )
  app.delete(
    '/gallery/:id',
    { schema: { tags, security, summary: 'Delete a gallery item (the media file is kept)', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
