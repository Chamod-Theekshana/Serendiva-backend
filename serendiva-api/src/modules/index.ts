import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import authRoutes from './auth/auth.routes'
import { toursAdminRoutes, toursPublicRoutes } from './tours/tours.routes'
import { categoriesAdminRoutes, categoriesPublicRoutes } from './categories/categories.routes'
import { destinationsAdminRoutes, destinationsPublicRoutes } from './destinations/destinations.routes'
import { reviewsAdminRoutes, reviewsPublicRoutes } from './reviews/reviews.routes'
import { faqsAdminRoutes, faqsPublicRoutes } from './faqs/faqs.routes'
import { blogAdminRoutes, blogPublicRoutes } from './blog/blog.routes'
import { galleryAdminRoutes, galleryPublicRoutes } from './gallery/gallery.routes'
import { availabilityAdminRoutes, availabilityPublicRoutes } from './availability/availability.routes'
import { settingsAdminRoutes, settingsPublicRoutes } from './settings/settings.routes'
import { inquiriesAdminRoutes, inquiriesPublicRoutes } from './inquiries/inquiries.routes'
import { proposalsAdminRoutes, proposalsPublicRoutes } from './proposals/proposals.routes'
import { newsletterAdminRoutes, newsletterPublicRoutes } from './newsletter/newsletter.routes'
import { sitemapPublicRoutes } from './sitemap/sitemap.routes'
import { mediaAdminRoutes } from './media/media.routes'
import { statsAdminRoutes } from './stats/stats.routes'

interface ModuleEntry {
  plugin: FastifyPluginAsyncZod
  prefix: string
}

/** Registered under /api/v1 (no authentication). */
export const publicModules: ModuleEntry[] = [
  { plugin: toursPublicRoutes, prefix: '' },
  { plugin: categoriesPublicRoutes, prefix: '' },
  { plugin: destinationsPublicRoutes, prefix: '' },
  { plugin: reviewsPublicRoutes, prefix: '' },
  { plugin: faqsPublicRoutes, prefix: '' },
  { plugin: blogPublicRoutes, prefix: '' },
  { plugin: galleryPublicRoutes, prefix: '' },
  { plugin: availabilityPublicRoutes, prefix: '' },
  { plugin: settingsPublicRoutes, prefix: '' },
  { plugin: inquiriesPublicRoutes, prefix: '' },
  { plugin: proposalsPublicRoutes, prefix: '' },
  { plugin: newsletterPublicRoutes, prefix: '' },
  { plugin: sitemapPublicRoutes, prefix: '' },
]

/** Registered under /api/v1/admin. Every module except auth adds the `app.authenticate` hook itself. */
export const adminModules: ModuleEntry[] = [
  { plugin: authRoutes, prefix: '/auth' },
  { plugin: toursAdminRoutes, prefix: '' },
  { plugin: categoriesAdminRoutes, prefix: '' },
  { plugin: destinationsAdminRoutes, prefix: '' },
  { plugin: reviewsAdminRoutes, prefix: '' },
  { plugin: faqsAdminRoutes, prefix: '' },
  { plugin: blogAdminRoutes, prefix: '' },
  { plugin: galleryAdminRoutes, prefix: '' },
  { plugin: availabilityAdminRoutes, prefix: '' },
  { plugin: inquiriesAdminRoutes, prefix: '' },
  { plugin: proposalsAdminRoutes, prefix: '' },
  { plugin: newsletterAdminRoutes, prefix: '' },
  { plugin: mediaAdminRoutes, prefix: '' },
  { plugin: settingsAdminRoutes, prefix: '' },
  { plugin: statsAdminRoutes, prefix: '' },
]
