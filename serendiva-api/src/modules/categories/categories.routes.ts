import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams, OkSchema, ReorderBody } from '@/lib/schemas'
import {
  AdminCategoryListSchema,
  AdminCategorySchema,
  CategoriesQuery,
  CategoryInput,
  CategoryListSchema,
} from './categories.schemas'
import { createCategoriesService } from './categories.service'

/** GET /api/v1/categories */
export const categoriesPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createCategoriesService(app.deps)

  app.get(
    '/categories',
    {
      config: publicCache,
      schema: {
        tags: ['Tours'],
        summary: 'Tour categories (ordered) with published tour counts',
        querystring: CategoriesQuery,
        response: { 200: CategoryListSchema, ...errorResponses },
      },
    },
    async (req) => service.list(req.query.locale),
  )
}

/** /api/v1/admin/categories */
export const categoriesAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createCategoriesService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/categories',
    { schema: { tags, security, summary: 'List categories', response: { 200: AdminCategoryListSchema, ...adminErrorResponses } } },
    async () => service.adminList(),
  )
  app.get(
    '/categories/:id',
    { schema: { tags, security, summary: 'Get a category for editing', params: IdParams, response: { 200: AdminCategorySchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/categories',
    { schema: { tags, security, summary: 'Create a category', body: CategoryInput, response: { 201: AdminCategorySchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.put(
    '/categories/:id',
    { schema: { tags, security, summary: 'Replace a category', params: IdParams, body: CategoryInput, response: { 200: AdminCategorySchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.patch(
    '/categories/order',
    { schema: { tags, security, summary: 'Bulk update display order (drag & drop)', body: ReorderBody, response: { 200: OkSchema, ...adminErrorResponses } } },
    async (req) => {
      await service.reorder(req.body.items)
      return { ok: true as const }
    },
  )
  app.delete(
    '/categories/:id',
    { schema: { tags, security, summary: 'Delete a category (tours are unlinked, not deleted)', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
