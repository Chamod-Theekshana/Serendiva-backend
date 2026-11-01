import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { LocaleQuery } from '@/lib/i18n'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams, SlugParams, StatusBody } from '@/lib/schemas'
import {
  AdminBlogList,
  AdminBlogPostSchema,
  AdminBlogQuery,
  BlogListSchema,
  BlogPostDetailSchema,
  BlogPostInput,
  BlogQuery,
} from './blog.schemas'
import { createBlogService } from './blog.service'

/** GET /api/v1/blog, GET /api/v1/blog/:slug */
export const blogPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createBlogService(app.deps)

  app.get(
    '/blog',
    {
      config: publicCache,
      schema: {
        tags: ['Content'],
        summary: 'Published blog posts, newest first (category, tag, search, pagination, category counts)',
        querystring: BlogQuery,
        response: { 200: BlogListSchema, ...errorResponses },
      },
    },
    async (req) => service.list(req.query),
  )

  app.get(
    '/blog/:slug',
    {
      config: publicCache,
      schema: {
        tags: ['Content'],
        summary: 'Blog post with markdown content, table of contents and related posts',
        params: SlugParams,
        querystring: LocaleQuery,
        response: { 200: BlogPostDetailSchema, ...errorResponses },
      },
    },
    async (req) => service.detail(req.params.slug, req.query.locale),
  )
}

/** /api/v1/admin/blog */
export const blogAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createBlogService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/blog',
    { schema: { tags, security, summary: 'List blog posts', querystring: AdminBlogQuery, response: { 200: AdminBlogList, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/blog/:id',
    { schema: { tags, security, summary: 'Get a blog post for editing', params: IdParams, response: { 200: AdminBlogPostSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/blog',
    { schema: { tags, security, summary: 'Create a blog post (reading time is computed from the English content)', body: BlogPostInput, response: { 201: AdminBlogPostSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.put(
    '/blog/:id',
    { schema: { tags, security, summary: 'Replace a blog post', params: IdParams, body: BlogPostInput, response: { 200: AdminBlogPostSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.patch(
    '/blog/:id/status',
    { schema: { tags, security, summary: 'Publish / unpublish (publishedAt is set on first publish)', params: IdParams, body: StatusBody, response: { 200: AdminBlogPostSchema, ...adminErrorResponses } } },
    async (req) => service.setStatus(req.params.id, req.body.status),
  )
  app.delete(
    '/blog/:id',
    { schema: { tags, security, summary: 'Delete a blog post', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
