import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createCategory, createDestination, createRegion, createReview, createTour } from './factories'
import { buildTestApp, type ErrorBody, type TestContext } from './helpers'

let ctx: TestContext
let cultureSlug: string
let wildlifeSlug: string

interface TourCard {
  slug: string
  title: string
  summary: string
  durationDays: number
  categories: { slug: string; name: string }[]
}
interface TourList {
  items: TourCard[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
  facets: { categories: { slug: string; count: number }[]; total: number }
}

const get = (url: string, headers: Record<string, string> = {}) => ctx.app.inject({ method: 'GET', url, headers })
const slugs = (list: TourList) => list.items.map((t) => t.slug)
const tours = async (query = '') => {
  const res = await get(`/api/v1/tours${query}`)
  expect(res.statusCode, res.body).toBe(200)
  return res.json<TourList>()
}

beforeAll(async () => {
  ctx = await buildTestApp()
  const db = ctx.app.deps.prisma

  const culture = await createCategory(db, { slug: 'culture', name: { en: 'Cultural & Heritage', zh: '文化遗产' }, order: 0 })
  const wildlife = await createCategory(db, { slug: 'wildlife', name: { en: 'Wildlife' }, order: 1 })
  cultureSlug = culture.slug
  wildlifeSlug = wildlife.slug

  const south = await createRegion(db, { slug: 'south', name: { en: 'The South' } })
  const yala = await createDestination(db, { slug: 'yala', name: { en: 'Yala National Park', zh: '雅拉国家公园' }, regionId: south.id })
  await createDestination(db, { slug: 'hidden-gem', status: 'draft', name: { en: 'Hidden Gem' } })

  await createTour(db, {
    slug: 'cultural-odyssey',
    order: 0,
    isFeatured: true,
    durationDays: 10,
    title: { en: 'Cultural Odyssey', zh: '文化之旅' },
    summary: { en: 'Ancient kingdoms and sacred cities.' },
    highlights: { en: ['Sigiriya at dawn'], zh: [] },
    route: ['Colombo', 'Anuradhapura', 'Sigiriya', 'Kandy'],
    categoryIds: [culture.id],
    days: [
      { dayNumber: 1, title: { en: 'Arrival', zh: '抵达' }, description: { en: 'Welcome.' } },
      { dayNumber: 2, title: { en: 'Anuradhapura' }, description: { en: 'Sacred city.', zh: '' } },
    ],
  })
  const leopards = await createTour(db, {
    slug: 'wild-leopards',
    order: 1,
    durationDays: 4,
    title: { en: 'Wild Leopards Safari' },
    route: ['Colombo', 'Yala'],
    categoryIds: [wildlife.id],
    destinationIds: [yala.id],
    travellerTypes: ['family'],
  })
  await createTour(db, {
    slug: 'tea-trails',
    order: 2,
    durationDays: 6,
    title: { en: 'Tea Trails & Elephants' },
    route: ['Kandy', 'Ella', 'Udawalawe'],
    categoryIds: [culture.id, wildlife.id],
  })
  await createTour(db, { slug: 'secret-draft', status: 'draft', order: 3, title: { en: 'Secret Draft Tour' }, categoryIds: [culture.id] })

  await createReview(db, { guestName: 'Oliver Smith', country: 'GB', rating: 5, tourId: leopards.id, email: 'oliver@private.example' })
  await createReview(db, { guestName: 'Lena Weber', country: 'DE', travellerType: 'family', rating: 4 })
  await createReview(db, { guestName: 'Pending Person', status: 'pending', rating: 1, tourId: leopards.id })
  await createReview(db, { guestName: 'Rejected Person', status: 'rejected', rating: 2 })
})
afterAll(async () => {
  await ctx.close()
})

describe('GET /api/v1/tours', () => {
  it('lists published tours in display order with pagination meta and category facets', async () => {
    const list = await tours()
    expect(slugs(list)).toEqual(['cultural-odyssey', 'wild-leopards', 'tea-trails'])
    expect(list.meta).toEqual({ page: 1, pageSize: 12, total: 3, totalPages: 1 })
    expect(list.facets.total).toBe(3)
    expect(list.facets.categories.map((c) => [c.slug, c.count])).toEqual([
      ['culture', 2],
      ['wildlife', 2],
    ])
  })

  it('filters by category (facets keep counting every category)', async () => {
    const list = await tours(`?category=${wildlifeSlug}`)
    expect(slugs(list)).toEqual(['wild-leopards', 'tea-trails'])
    expect(list.meta.total).toBe(2)
    expect(list.facets.categories.find((c) => c.slug === cultureSlug)?.count).toBe(2)
  })

  it('filters by duration band, min/max days, featured and traveller type', async () => {
    expect(slugs(await tours('?duration=4-7'))).toEqual(['wild-leopards', 'tea-trails'])
    expect(slugs(await tours('?duration=1-3'))).toEqual([])
    expect(slugs(await tours('?minDays=8'))).toEqual(['cultural-odyssey'])
    expect(slugs(await tours('?maxDays=5'))).toEqual(['wild-leopards'])
    expect(slugs(await tours('?featured=true'))).toEqual(['cultural-odyssey'])
    expect(slugs(await tours('?travellerType=family'))).toEqual(['wild-leopards'])
  })

  it('searches title, route and highlights (case-insensitive, all terms must match)', async () => {
    expect(slugs(await tours('?q=LEOPARD'))).toEqual(['wild-leopards'])
    expect(slugs(await tours('?q=sigiriya'))).toEqual(['cultural-odyssey'])
    expect(slugs(await tours('?q=kandy'))).toEqual(['cultural-odyssey', 'tea-trails'])
    expect(slugs(await tours('?q=kandy%20ella'))).toEqual(['tea-trails'])
    expect(slugs(await tours('?q=secret'))).toEqual([]) // drafts are never searchable
  })

  it('paginates and sorts', async () => {
    const page2 = await tours('?pageSize=2&page=2')
    expect(slugs(page2)).toEqual(['tea-trails'])
    expect(page2.meta).toEqual({ page: 2, pageSize: 2, total: 3, totalPages: 2 })
    expect(slugs(await tours('?sort=duration-asc'))).toEqual(['wild-leopards', 'tea-trails', 'cultural-odyssey'])
    expect(slugs(await tours('?sort=duration-desc'))).toEqual(['cultural-odyssey', 'tea-trails', 'wild-leopards'])
  })

  it('localizes with English fallback', async () => {
    const zh = await tours('?locale=zh')
    const odyssey = zh.items.find((t) => t.slug === 'cultural-odyssey')
    expect(odyssey?.title).toBe('文化之旅')
    expect(odyssey?.summary).toBe('Ancient kingdoms and sacred cities.')
    expect(odyssey?.categories[0]?.name).toBe('文化遗产')
    expect(zh.items.find((t) => t.slug === 'wild-leopards')?.title).toBe('Wild Leopards Safari')
  })

  it('rejects invalid query parameters with 400', async () => {
    for (const q of ['?pageSize=0', '?duration=99', '?locale=fr', '?sort=random']) {
      const res = await get(`/api/v1/tours${q}`)
      expect(res.statusCode, q).toBe(400)
      expect(res.json<ErrorBody>().error.code).toBe('VALIDATION_ERROR')
    }
  })
})

describe('GET /api/v1/tours/:slug', () => {
  it('returns the detail with days, destinations, approved reviews only and related tours', async () => {
    const res = await get('/api/v1/tours/wild-leopards')
    expect(res.statusCode).toBe(200)
    const tour = res.json<{
      slug: string
      days: { dayNumber: number }[]
      destinations: { slug: string; name: string }[]
      reviews: { guestName: string }[]
      reviewSummary: { average: number; count: number }
      related: { slug: string }[]
      seo: { title: string }
    }>()
    expect(tour.days.map((d) => d.dayNumber)).toEqual([1, 2])
    expect(tour.destinations).toEqual([{ slug: 'yala', name: 'Yala National Park' }])
    expect(tour.reviews.map((r) => r.guestName)).toEqual(['Oliver Smith'])
    expect(tour.reviewSummary).toEqual({ average: 5, count: 1 })
    // shares the wildlife category first; never itself or a draft
    expect(tour.related[0]?.slug).toBe('tea-trails')
    expect(tour.related.map((r) => r.slug)).not.toContain('wild-leopards')
    expect(tour.related.map((r) => r.slug)).not.toContain('secret-draft')
    expect(tour.seo.title).toBeTruthy()
    expect(res.body).not.toContain('oliver@private.example')
  })

  it('falls back to English per field for missing or empty translations (zh -> en)', async () => {
    const res = await get('/api/v1/tours/cultural-odyssey?locale=zh')
    expect(res.statusCode).toBe(200)
    const tour = res.json<{ title: string; summary: string; highlights: string[]; days: { title: string; description: string }[] }>()
    expect(tour.title).toBe('文化之旅')
    expect(tour.summary).toBe('Ancient kingdoms and sacred cities.')
    expect(tour.highlights).toEqual(['Sigiriya at dawn']) // zh: [] counts as missing
    expect(tour.days[0]?.title).toBe('抵达')
    expect(tour.days[1]?.title).toBe('Anuradhapura')
    expect(tour.days[1]?.description).toBe('Sacred city.') // zh: "" counts as missing

    const de = await get('/api/v1/tours/cultural-odyssey?locale=de')
    expect(de.json<{ title: string }>().title).toBe('Cultural Odyssey')
  })

  it('404 for drafts and unknown slugs, 400 for malformed slugs', async () => {
    for (const slug of ['secret-draft', 'no-such-tour']) {
      const res = await get(`/api/v1/tours/${slug}`)
      expect(res.statusCode).toBe(404)
      expect(res.json<ErrorBody>()).toEqual({ error: { code: 'NOT_FOUND', message: 'Tour not found' } })
    }
    expect((await get('/api/v1/tours/Not_A_Slug')).statusCode).toBe(400)
  })
})

describe('HTTP caching', () => {
  it('sets Cache-Control + ETag and answers 304 for a matching If-None-Match', async () => {
    const first = await get('/api/v1/tours/cultural-odyssey')
    expect(first.headers['cache-control']).toBe('public, max-age=60, stale-while-revalidate=300')
    const etag = first.headers.etag as string
    expect(etag).toMatch(/^W\/".+"$/)

    const cached = await get('/api/v1/tours/cultural-odyssey', { 'if-none-match': etag })
    expect(cached.statusCode).toBe(304)
    expect(cached.body).toBe('')

    // Different representation (locale) -> different ETag
    const zh = await get('/api/v1/tours/cultural-odyssey?locale=zh', { 'if-none-match': etag })
    expect(zh.statusCode).toBe(200)
    expect(zh.headers.etag).not.toBe(etag)
  })

  it('the ETag changes when the content changes', async () => {
    const before = (await get('/api/v1/tours')).headers.etag as string
    await ctx.app.deps.prisma.tour.update({ where: { slug: 'tea-trails' }, data: { durationDays: 7 } })
    const after = await get('/api/v1/tours', { 'if-none-match': before })
    expect(after.statusCode).toBe(200)
    expect(after.headers.etag).not.toBe(before)
    await ctx.app.deps.prisma.tour.update({ where: { slug: 'tea-trails' }, data: { durationDays: 6 } })
  })

  it('errors and admin routes are not cached publicly', async () => {
    const missing = await get('/api/v1/tours/no-such-tour')
    expect(missing.headers.etag).toBeUndefined()
    expect(missing.headers['cache-control']).toBeUndefined()
    const admin = await get('/api/v1/admin/tours')
    expect(admin.headers['cache-control']).toBeUndefined()
  })
})

describe('destinations', () => {
  it('lists only published destinations, with region facets', async () => {
    const res = await get('/api/v1/destinations')
    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: { slug: string }[]; facets: { regions: { slug: string; count: number }[] } }>()
    expect(body.items.map((d) => d.slug)).toEqual(['yala'])
    expect(body.facets.regions).toEqual([expect.objectContaining({ slug: 'south', count: 1 })])
  })

  it('detail is localized and lists the published tours that visit it', async () => {
    const res = await get('/api/v1/destinations/yala?locale=zh')
    expect(res.statusCode).toBe(200)
    const body = res.json<{ name: string; summary: string; tours: { slug: string }[] }>()
    expect(body.name).toBe('雅拉国家公园')
    expect(body.summary).toBe('A place worth the detour.')
    expect(body.tours.map((t) => t.slug)).toEqual(['wild-leopards'])
  })

  it('404 for draft destinations', async () => {
    expect((await get('/api/v1/destinations/hidden-gem')).statusCode).toBe(404)
  })

  it('regions endpoint', async () => {
    const res = await get('/api/v1/regions')
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('The South')
  })
})

describe('reviews', () => {
  it('only approved reviews are public, and private fields never leak', async () => {
    const res = await get('/api/v1/reviews')
    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: { guestName: string; initials: string }[]; meta: { total: number } }>()
    expect(body.items.map((r) => r.guestName).sort()).toEqual(['Lena Weber', 'Oliver Smith'])
    expect(body.meta.total).toBe(2)
    expect(res.body).not.toMatch(/@private\.example|guest@example\.com|"email"/)
  })

  it('filters by traveller type, country and tour', async () => {
    const family = (await get('/api/v1/reviews?travellerType=family')).json<{ items: { guestName: string }[] }>()
    expect(family.items.map((r) => r.guestName)).toEqual(['Lena Weber'])
    const gb = (await get('/api/v1/reviews?country=gb')).json<{ items: { guestName: string }[] }>()
    expect(gb.items.map((r) => r.guestName)).toEqual(['Oliver Smith'])
    const byTour = (await get('/api/v1/reviews?tour=wild-leopards')).json<{ items: { guestName: string }[] }>()
    expect(byTour.items.map((r) => r.guestName)).toEqual(['Oliver Smith'])
  })

  it('summary counts approved reviews only', async () => {
    const res = await get('/api/v1/reviews/summary')
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ average: 4.5, count: 2 })
  })

  it('guest submissions are stored as pending (moderation)', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/reviews',
      payload: {
        guestName: 'New Guest',
        email: ' New.Guest@Example.com ',
        country: 'fr',
        travellerType: 'couple',
        tourSlug: 'wild-leopards',
        rating: 5,
        text: 'An unforgettable week, every detail was taken care of.',
      },
    })
    expect(res.statusCode).toBe(201)
    const stored = await ctx.app.deps.prisma.review.findFirstOrThrow({ where: { guestName: 'New Guest' } })
    expect(stored).toMatchObject({ status: 'pending', country: 'FR', email: 'new.guest@example.com' })
    const pub = (await get('/api/v1/reviews')).json<{ items: { guestName: string }[] }>()
    expect(pub.items.map((r) => r.guestName)).not.toContain('New Guest')
  })
})

describe('other public content', () => {
  it('categories are localized and ordered', async () => {
    const res = await get('/api/v1/categories?locale=zh')
    expect(res.statusCode).toBe(200)
    expect(res.json<{ slug: string; name: string }[]>().map((c) => [c.slug, c.name])).toEqual([
      ['culture', '文化遗产'],
      ['wildlife', 'Wildlife'],
    ])
  })

  it('sitemap data lists published slugs only', async () => {
    const res = await get('/api/v1/sitemap-data')
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('cultural-odyssey')
    expect(res.body).toContain('yala')
    expect(res.body).not.toContain('secret-draft')
    expect(res.body).not.toContain('hidden-gem')
  })
})
