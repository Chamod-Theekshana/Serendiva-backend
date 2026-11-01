import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildTestApp, type ErrorBody, type TestContext } from './helpers'

/**
 * A brand-new installation (migrated, nothing seeded) must not break the website: every public
 * content endpoint answers 200 with empty data or defaults, detail endpoints answer 404.
 */
let ctx: TestContext
let publicGets: string[] = []

beforeAll(async () => {
  ctx = await buildTestApp()
  const spec = ctx.app.swagger() as { paths: Record<string, Record<string, unknown>> }
  publicGets = Object.entries(spec.paths)
    .filter(([p, ops]) => p.startsWith('/api/v1/') && !p.startsWith('/api/v1/admin/') && 'get' in ops)
    .map(([p]) => p)
    // token links are not content endpoints (covered in newsletter.test.ts)
    .filter((p) => !p.startsWith('/api/v1/newsletter/'))
})
afterAll(async () => {
  await ctx.close()
})

describe('public endpoints on an empty database', () => {
  it('discovers the public GET routes from the OpenAPI document', () => {
    expect(publicGets).toEqual(expect.arrayContaining(['/api/v1/tours', '/api/v1/tours/{slug}', '/api/v1/settings/public']))
    expect(publicGets.length).toBeGreaterThanOrEqual(15)
  })

  it('list/settings endpoints answer 200 with cache headers in every locale', async () => {
    for (const p of publicGets.filter((x) => !x.includes('{'))) {
      for (const locale of ['en', 'zh', 'de']) {
        // Endpoints without a locale parameter (availability, sitemap) ignore it
        const url = `${p}?locale=${locale}`
        const res = await ctx.app.inject({ method: 'GET', url })
        expect(res.statusCode, `${url}: ${res.body}`).toBe(200)
        expect(res.headers['cache-control'], url).toMatch(/^public, max-age=\d+/)
      }
    }
  })

  it('detail endpoints answer 404 with the error envelope', async () => {
    for (const p of publicGets.filter((x) => x.includes('{slug}'))) {
      const url = p.replace('{slug}', 'does-not-exist')
      const res = await ctx.app.inject({ method: 'GET', url })
      expect(res.statusCode, url).toBe(404)
      expect(res.json<ErrorBody>().error.code).toBe('NOT_FOUND')
    }
  })

  it('settings fall back to defaults when nothing has been saved yet', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/api/v1/settings/public' })
    expect(res.statusCode).toBe(200)
    const body = res.json<{ contact: { email: string }; guide: { name: string }; reviewSummary?: { count: number } }>()
    expect(typeof body.contact.email).toBe('string')
    expect(typeof body.guide.name).toBe('string')
  })

  it('tour list is empty but well-formed', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/api/v1/tours' })
    expect(res.json()).toEqual({
      items: [],
      meta: { page: 1, pageSize: 12, total: 0, totalPages: 1 },
      facets: { categories: [], total: 0 },
    })
  })
})
