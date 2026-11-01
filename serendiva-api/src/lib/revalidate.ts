import type { FastifyBaseLogger } from 'fastify'

export interface Revalidator {
  /** Fire-and-forget: tells the Next.js frontend to drop cached data for these tags. Never throws. */
  revalidate(tags: string[]): void
  /** Awaitable variant (used by tests). */
  revalidateNow(tags: string[]): Promise<boolean>
}

export function createRevalidator(opts: {
  frontendUrl: string
  secret: string
  disabled?: boolean
  log: FastifyBaseLogger
}): Revalidator {
  async function revalidateNow(tags: string[]): Promise<boolean> {
    const unique = [...new Set(tags.filter(Boolean))]
    if (opts.disabled || unique.length === 0) return true
    try {
      const res = await fetch(new URL('/api/revalidate', opts.frontendUrl), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': opts.secret },
        body: JSON.stringify({ tags: unique }),
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) {
        opts.log.warn({ status: res.status, tags: unique }, 'revalidation request was rejected')
        return false
      }
      opts.log.debug({ tags: unique }, 'frontend revalidated')
      return true
    } catch (err) {
      opts.log.warn({ err: (err as Error).message, tags: unique }, 'revalidation request failed (continuing)')
      return false
    }
  }
  return {
    revalidate: (tags) => void revalidateNow(tags),
    revalidateNow,
  }
}

/** Cache tags shared with the frontend. Keep in sync with serendiva-web/src/lib/api/tags.ts */
export const Tags = {
  tours: 'tours',
  tour: (slug: string) => `tour:${slug}`,
  categories: 'categories',
  destinations: 'destinations',
  destination: (slug: string) => `destination:${slug}`,
  regions: 'regions',
  reviews: 'reviews',
  faqs: 'faqs',
  blog: 'blog',
  blogPost: (slug: string) => `blog:${slug}`,
  gallery: 'gallery',
  availability: 'availability',
  settings: 'settings',
  sitemap: 'sitemap',
} as const
