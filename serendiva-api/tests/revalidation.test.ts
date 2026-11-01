import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRevalidator } from '@/lib/revalidate'
import { createAdmin, createDestination, createReview, createTour, tourWrite } from './factories'
import { buildTestApp, login, type Session, type TestContext } from './helpers'

let ctx: TestContext
let session: Session

beforeAll(async () => {
  ctx = await buildTestApp()
  await createAdmin(ctx.app.deps.prisma)
  session = await login(ctx.app)
})
afterAll(async () => {
  await ctx.close()
})
beforeEach(() => {
  ctx.revalidate.reset()
})

const admin = (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, payload?: Record<string, unknown>) =>
  ctx.app.inject({ method, url: `/api/v1/admin${url}`, cookies: session.cookies, ...(payload ? { payload } : {}) })

describe('admin changes revalidate the right frontend cache tags', () => {
  it('tour create / update (slug change) / publish / reorder / delete', async () => {
    const created = await admin('POST', '/tours', tourWrite({ slug: 'old-slug' }))
    expect(created.statusCode).toBe(201)
    const id = created.json<{ id: string }>().id
    expect(ctx.revalidate.calls).toEqual([['tours', 'tour:old-slug', 'sitemap']])

    ctx.revalidate.reset()
    const updated = await admin('PUT', `/tours/${id}`, tourWrite({ slug: 'new-slug', title: { en: 'Renamed' } }))
    expect(updated.statusCode).toBe(200)
    // both the old and the new URL must be refreshed
    expect(ctx.revalidate.calls).toEqual([['tours', 'tour:old-slug', 'tour:new-slug', 'sitemap']])

    ctx.revalidate.reset()
    await admin('PATCH', `/tours/${id}/status`, { status: 'published' })
    expect(ctx.revalidate.calls).toEqual([['tours', 'tour:new-slug', 'sitemap']])

    ctx.revalidate.reset()
    await admin('PATCH', '/tours/order', { items: [{ id, order: 3 }] })
    expect(ctx.revalidate.calls).toEqual([['tours']])

    ctx.revalidate.reset()
    expect((await admin('DELETE', `/tours/${id}`)).statusCode).toBe(204)
    expect(ctx.revalidate.calls).toEqual([['tours', 'tour:new-slug', 'sitemap']])
  })

  it('failed or rejected changes do not revalidate', async () => {
    expect((await admin('POST', '/tours', { slug: 'x' })).statusCode).toBe(400)
    expect((await admin('PUT', '/tours/does-not-exist', tourWrite())).statusCode).toBe(404)
    expect(ctx.revalidate.calls).toEqual([])
  })

  it('moderating a review refreshes reviews, settings (summary) and the tour page', async () => {
    const tour = await createTour(ctx.app.deps.prisma, { slug: 'reviewed-tour' })
    const review = await createReview(ctx.app.deps.prisma, { status: 'pending', tourId: tour.id })
    const res = await admin('PATCH', `/reviews/${review.id}/status`, { status: 'approved' })
    expect(res.statusCode).toBe(200)
    expect(ctx.revalidate.tags()).toEqual(new Set(['reviews', 'settings', 'tour:reviewed-tour']))
  })

  it('publishing a destination refreshes destinations, its page, regions, tours and the sitemap', async () => {
    const dest = await createDestination(ctx.app.deps.prisma, { slug: 'ella', status: 'draft' })
    expect((await admin('PATCH', `/destinations/${dest.id}/status`, { status: 'published' })).statusCode).toBe(200)
    expect(ctx.revalidate.tags()).toEqual(new Set(['destinations', 'destination:ella', 'regions', 'sitemap', 'tours']))
  })

  it('settings changes refresh "settings"', async () => {
    const res = await admin('PUT', '/settings/social', { instagram: 'https://instagram.com/serendiva' })
    expect(res.statusCode, res.body).toBe(200)
    expect(ctx.revalidate.calls).toEqual([['settings']])
  })

  it('visitor form submissions never trigger revalidation', async () => {
    await ctx.app.inject({ method: 'POST', url: '/api/v1/inquiries', payload: { name: 'Visitor', email: 'v@example.com' } })
    expect(ctx.revalidate.calls).toEqual([])
  })
})

describe('revalidation webhook client', () => {
  const log = { warn: vi.fn(), debug: vi.fn() }
  const make = (disabled = false) =>
    createRevalidator({
      frontendUrl: 'https://www.serendiva.test',
      secret: 'shared-secret-1234567890',
      disabled,
      log: log as never,
    })

  afterEach(() => {
    vi.restoreAllMocks()
    log.warn.mockReset()
  })

  it('POSTs the unique tags with the shared secret to FRONTEND_URL/api/revalidate', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"revalidated":true}', { status: 200 }))
    await expect(make().revalidateNow(['tours', 'tour:a', 'tours', ''])).resolves.toBe(true)
    const [url, init] = fetchSpy.mock.calls[0] ?? []
    expect(String(url)).toBe('https://www.serendiva.test/api/revalidate')
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>)['x-revalidate-secret']).toBe('shared-secret-1234567890')
    expect(JSON.parse(String(init?.body))).toEqual({ tags: ['tours', 'tour:a'] })
  })

  it('never throws: a rejected or failed call is logged and reported as false', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('nope', { status: 401 }))
    await expect(make().revalidateNow(['tours'])).resolves.toBe(false)
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('fetch failed'))
    await expect(make().revalidateNow(['tours'])).resolves.toBe(false)
    expect(log.warn).toHaveBeenCalledTimes(2)
    // fire-and-forget variant does not throw either
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('fetch failed'))
    expect(() => make().revalidate(['tours'])).not.toThrow()
  })

  it('REVALIDATE_DISABLED skips the call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await expect(make(true).revalidateNow(['tours'])).resolves.toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
