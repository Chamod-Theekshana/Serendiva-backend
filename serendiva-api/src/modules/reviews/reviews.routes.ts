import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { publicCache } from '@/plugins/http-cache'
import { adminErrorResponses, errorResponses, IdParams } from '@/lib/schemas'
import { ReviewSummarySchema } from '@/modules/shared/public-dto'
import {
  AdminReviewList,
  AdminReviewSchema,
  AdminReviewsQuery,
  ReviewFeatureBody,
  ReviewInput,
  ReviewListSchema,
  ReviewsQuery,
  ReviewStatusBody,
  ReviewSubmissionBody,
  ReviewSubmissionResult,
} from './reviews.schemas'
import { createReviewsService } from './reviews.service'

/** GET /api/v1/reviews, GET /api/v1/reviews/summary, POST /api/v1/reviews */
export const reviewsPublicRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createReviewsService(app.deps)

  app.get(
    '/reviews',
    {
      config: publicCache,
      schema: {
        tags: ['Reviews'],
        summary: 'Approved reviews (filters: traveller type, countries, tour, featured, rating; pagination)',
        querystring: ReviewsQuery,
        response: { 200: ReviewListSchema, ...errorResponses },
      },
    },
    async (req) => service.list(req.query),
  )

  app.get(
    '/reviews/summary',
    {
      config: publicCache,
      schema: {
        tags: ['Reviews'],
        summary: 'Average rating and counts of approved reviews (per traveller type and rating)',
        response: { 200: ReviewSummarySchema, ...errorResponses },
      },
    },
    async () => service.summary(),
  )

  app.post(
    '/reviews',
    {
      config: { rateLimit: { max: app.deps.env.FORM_RATE_LIMIT, timeWindow: '1 minute' } },
      schema: {
        tags: ['Forms'],
        summary: 'Submit a guest review (saved as pending until approved)',
        body: ReviewSubmissionBody,
        response: { 201: ReviewSubmissionResult, ...errorResponses },
      },
    },
    async (req, reply) => reply.status(201).send(await service.submit(req.body, req.ip)),
  )
}

/** /api/v1/admin/reviews */
export const reviewsAdminRoutes: FastifyPluginAsyncZod = async (app) => {
  const service = createReviewsService(app.deps)
  app.addHook('onRequest', app.authenticate)
  const tags = ['Admin · Content']
  const security = [{ cookieAuth: [] }]

  app.get(
    '/reviews',
    { schema: { tags, security, summary: 'List reviews (moderation queue)', querystring: AdminReviewsQuery, response: { 200: AdminReviewList, ...adminErrorResponses } } },
    async (req) => service.adminList(req.query),
  )
  app.get(
    '/reviews/:id',
    { schema: { tags, security, summary: 'Get a review', params: IdParams, response: { 200: AdminReviewSchema, ...adminErrorResponses } } },
    async (req) => service.adminGet(req.params.id),
  )
  app.post(
    '/reviews',
    { schema: { tags, security, summary: 'Create a review (e.g. imported from TripAdvisor / Google)', body: ReviewInput, response: { 201: AdminReviewSchema, ...adminErrorResponses } } },
    async (req, reply) => reply.status(201).send(await service.create(req.body)),
  )
  app.put(
    '/reviews/:id',
    { schema: { tags, security, summary: 'Replace a review', params: IdParams, body: ReviewInput, response: { 200: AdminReviewSchema, ...adminErrorResponses } } },
    async (req) => service.update(req.params.id, req.body),
  )
  app.patch(
    '/reviews/:id/status',
    { schema: { tags, security, summary: 'Approve / reject / return to pending', params: IdParams, body: ReviewStatusBody, response: { 200: AdminReviewSchema, ...adminErrorResponses } } },
    async (req) => service.setStatus(req.params.id, req.body.status),
  )
  app.patch(
    '/reviews/:id/feature',
    { schema: { tags, security, summary: 'Feature / unfeature a review', params: IdParams, body: ReviewFeatureBody, response: { 200: AdminReviewSchema, ...adminErrorResponses } } },
    async (req) => service.setFeatured(req.params.id, req.body.isFeatured),
  )
  app.delete(
    '/reviews/:id',
    { schema: { tags, security, summary: 'Delete a review', params: IdParams, response: { 204: z.undefined(), ...adminErrorResponses } } },
    async (req, reply) => {
      await service.remove(req.params.id)
      return reply.status(204).send()
    },
  )
}
