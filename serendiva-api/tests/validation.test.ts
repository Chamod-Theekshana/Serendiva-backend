import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAdmin, createCategory, createMedia, createTour, tourWrite } from './factories'
import { buildTestApp, login, type ErrorBody, type Session, type TestContext } from './helpers'

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

const createTourReq = (payload: unknown) =>
  ctx.app.inject({ method: 'POST', url: '/api/v1/admin/tours', cookies: session.cookies, payload: payload as Record<string, unknown> })

const details = (res: { json: <T>() => T }) => res.json<ErrorBody>().error.details ?? []

describe('TourWrite validation', () => {
  it('a valid body is accepted and round-trips through the admin schema', async () => {
    const res = await createTourReq(tourWrite({ slug: 'valid-tour', title: { en: 'Valid', zh: '有效', de: 'Gültig' } }))
    expect(res.statusCode, res.body).toBe(201)
    expect(res.json()).toMatchObject({ slug: 'valid-tour', title: { en: 'Valid', zh: '有效', de: 'Gültig' }, status: 'draft' })
  })

  it('rejects duplicate day numbers', async () => {
    const res = await createTourReq(
      tourWrite({
        days: [
          { dayNumber: 1, title: { en: 'One' }, description: { en: 'a' }, isHighlight: false, stops: [] },
          { dayNumber: 1, title: { en: 'Also one' }, description: { en: 'b' }, isHighlight: false, stops: [] },
        ],
      }),
    )
    expect(res.statusCode).toBe(400)
    expect(res.json<ErrorBody>().error.code).toBe('VALIDATION_ERROR')
    expect(details(res)).toEqual([{ path: 'days', message: 'Day numbers must be unique' }])
  })

  it('rejects an empty string for an optional translation (zh: "")', async () => {
    const res = await createTourReq(tourWrite({ title: { en: 'Title', zh: '' } }))
    expect(res.statusCode).toBe(400)
    expect(details(res).map((d) => d.path)).toEqual(['title.zh'])
  })

  it('requires English for translatable fields', async () => {
    const res = await createTourReq(tourWrite({ title: { zh: '只有中文' } } as never))
    expect(res.statusCode).toBe(400)
    expect(details(res).map((d) => d.path)).toContain('title.en')
  })

  it('reports nested paths with dots', async () => {
    const res = await createTourReq(
      tourWrite({
        days: [{ dayNumber: 1, title: { en: 'x' }, description: { en: 'y' }, isHighlight: false, stops: [{ name: 'Nowhere', lat: 123, lng: 80 }] }],
      }),
    )
    expect(res.statusCode).toBe(400)
    expect(details(res).map((d) => d.path)).toEqual(['days.0.stops.0.lat'])
  })

  it('validates slugs, numbers and enums', async () => {
    const res = await createTourReq(tourWrite({ slug: 'Not A Slug', durationDays: 0, seasons: ['winter'] } as never))
    expect(res.statusCode).toBe(400)
    expect(details(res).map((d) => d.path)).toEqual(expect.arrayContaining(['slug', 'durationDays', 'seasons.0']))
  })

  it('duplicate slug -> 409 naming the field', async () => {
    await createTour(ctx.app.deps.prisma, { slug: 'taken-slug' })
    const res = await createTourReq(tourWrite({ slug: 'taken-slug' }))
    expect(res.statusCode).toBe(409)
    expect(res.json<ErrorBody>().error).toEqual({
      code: 'CONFLICT',
      message: 'A record with this slug already exists',
      details: [{ path: 'slug', message: 'This value is already in use' }],
    })
  })

  it('unknown related ids -> 409 with a helpful message, nothing half-written', async () => {
    const before = await ctx.app.deps.prisma.tour.count()
    for (const body of [tourWrite({ categoryIds: ['missing-category'] }), tourWrite({ coverId: 'missing-media' })]) {
      const res = await createTourReq(body)
      expect(res.statusCode).toBe(409)
      expect(res.json<ErrorBody>().error.message).toBe('A selected related record does not exist (it may have been deleted)')
    }
    // the tour row is created in the same transaction as its relations, so it was rolled back
    expect(await ctx.app.deps.prisma.tour.count()).toBe(before)
  })

  it('related ids that exist are linked', async () => {
    const category = await createCategory(ctx.app.deps.prisma)
    const media = await createMedia(ctx.app.deps.prisma)
    const res = await createTourReq(tourWrite({ categoryIds: [category.id], coverId: media.id, gallery: [{ mediaId: media.id }] } as never))
    expect(res.statusCode, res.body).toBe(201)
    expect(res.json()).toMatchObject({ categoryIds: [category.id], coverId: media.id, cover: { id: media.id } })
  })
})

describe('other admin/public bodies', () => {
  it('unknown setting keys are rejected with the list of valid keys', async () => {
    const res = await ctx.app.inject({ method: 'PUT', url: '/api/v1/admin/settings/notAKey', cookies: session.cookies, payload: {} })
    expect(res.statusCode).toBe(400)
    const err = res.json<{ error: { message: string; details: { allowed: string[] } } }>().error
    expect(err.message).toBe('Unknown setting key "notAKey"')
    expect(err.details.allowed).toContain('contact')
  })

  it('setting bodies are validated', async () => {
    const res = await ctx.app.inject({
      method: 'PUT',
      url: '/api/v1/admin/settings/contact',
      cookies: session.cookies,
      payload: { email: 'not-an-email' },
    })
    expect(res.statusCode).toBe(400)
    expect(details(res).map((d) => d.path)).toContain('email')
  })

  it('reorder bodies need at least one item', async () => {
    const res = await ctx.app.inject({ method: 'PATCH', url: '/api/v1/admin/tours/order', cookies: session.cookies, payload: { items: [] } })
    expect(res.statusCode).toBe(400)
    expect(details(res)[0]?.path).toBe('items')
  })

  it('public review submissions are validated', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/reviews',
      payload: { guestName: 'X', email: 'x@example.com', country: 'United Kingdom', travellerType: 'alien', rating: 6, text: 'short' },
    })
    expect(res.statusCode).toBe(400)
    expect(details(res).map((d) => d.path)).toEqual(
      expect.arrayContaining(['guestName', 'country', 'travellerType', 'rating', 'text']),
    )
  })

  it('JSON bodies over 1 MB are refused with 413', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/inquiries',
      payload: { name: 'Big', email: 'big@example.com', message: 'x'.repeat(1_100_000) },
    })
    expect(res.statusCode).toBe(413)
    expect(res.json<ErrorBody>().error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('unsupported content types are refused with 415', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/inquiries',
      headers: { 'content-type': 'application/xml' },
      payload: '<inquiry/>',
    })
    expect(res.statusCode).toBe(415)
    expect(res.json<ErrorBody>().error.code).toBe('UNSUPPORTED_MEDIA_TYPE')
  })
})
