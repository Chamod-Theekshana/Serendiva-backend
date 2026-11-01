import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SETTING_KEYS } from '@/modules/settings/settings.schemas'
import { buildTestApp, login, type Session, type TestContext } from './helpers'
import { TEST_DATABASE_URL } from './test-db'

/**
 * Runs the real seed script (`npm run db:seed`) against the test database, then proves that every
 * seeded record can be read — and saved back unchanged — through the admin API, and rendered by the
 * public API. A mismatch between seed data and the Zod response/write schemas shows up here as a
 * 500 (response serialization) or 400 (write validation).
 */
const run = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')
const SEED_ADMIN = { email: 'seed-admin@serendiva.test', password: 'Seed-Admin-Password-2026' }

async function runSeed(): Promise<string> {
  const { stdout } = await run(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'], {
    cwd: root,
    timeout: 120_000,
    env: {
      PATH: process.env.PATH ?? '',
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      ADMIN_SEED_EMAIL: SEED_ADMIN.email,
      ADMIN_SEED_PASSWORD: SEED_ADMIN.password,
      ADMIN_SEED_NAME: 'Seed Admin',
    },
  })
  return stdout
}

let ctx: TestContext
let session: Session
let firstRunTourIds: string[] = []

const adminGet = (url: string) => ctx.app.inject({ method: 'GET', url: `/api/v1/admin${url}`, cookies: session.cookies })
const itemsOf = (body: unknown): { id: string; slug?: string }[] =>
  (Array.isArray(body) ? body : (body as { items: { id: string }[] }).items) as { id: string; slug?: string }[]

beforeAll(async () => {
  const out = await runSeed()
  expect(out).toContain('Sample content reset and inserted')
  ctx = await buildTestApp()
  firstRunTourIds = (await ctx.app.deps.prisma.tour.findMany({ select: { id: true }, orderBy: { slug: 'asc' } })).map((t) => t.id)
  session = await login(ctx.app, SEED_ADMIN)
}, 180_000)
afterAll(async () => {
  await ctx?.close()
})

/** Admin collections with a GET /<name>/:id detail and a PUT /<name>/:id write endpoint. */
const COLLECTIONS = ['tours', 'categories', 'regions', 'destinations', 'reviews', 'faqs', 'blog', 'gallery', 'availability']

describe('seed', () => {
  it('created the admin and the sample content', async () => {
    const db = ctx.app.deps.prisma
    expect(await db.adminUser.count({ where: { email: SEED_ADMIN.email } })).toBe(1)
    expect(await db.tour.count({ where: { status: 'published' } })).toBeGreaterThanOrEqual(6)
    expect(await db.tourDay.count()).toBeGreaterThan(20)
    expect(await db.blogPost.count()).toBeGreaterThanOrEqual(3)
    expect(await db.siteSetting.count()).toBe(SETTING_KEYS.length)
  })

  it('every admin list and detail endpoint returns 200 for the seeded data', async () => {
    const failures: string[] = []
    for (const name of COLLECTIONS) {
      const list = await adminGet(`/${name}?pageSize=100`)
      if (list.statusCode !== 200) {
        failures.push(`GET /${name} -> ${list.statusCode} ${list.body.slice(0, 200)}`)
        continue
      }
      const items = itemsOf(list.json())
      if (items.length === 0) failures.push(`GET /${name} returned no items`)
      await Promise.all(
        items.map(async (item) => {
          const res = await adminGet(`/${name}/${item.id}`)
          if (res.statusCode !== 200) failures.push(`GET /${name}/${item.id} -> ${res.statusCode} ${res.body.slice(0, 200)}`)
        }),
      )
    }
    for (const url of ['/settings', '/stats', '/media?pageSize=100', '/inquiries', '/proposals', '/newsletter', '/auth/me']) {
      const res = await adminGet(url)
      if (res.statusCode !== 200) failures.push(`GET ${url} -> ${res.statusCode} ${res.body.slice(0, 200)}`)
    }
    const media = itemsOf((await adminGet('/media?pageSize=25')).json())
    await Promise.all(
      media.map(async (m) => {
        const res = await adminGet(`/media/${m.id}`)
        if (res.statusCode !== 200) failures.push(`GET /media/${m.id} -> ${res.statusCode}`)
      }),
    )
    expect(failures).toEqual([])
  })

  it('the admin editor can save every seeded record back unchanged (GET -> PUT round trip)', async () => {
    const failures: string[] = []
    for (const name of COLLECTIONS) {
      const items = itemsOf((await adminGet(`/${name}?pageSize=100`)).json())
      await Promise.all(
        items.map(async (item) => {
          const current = (await adminGet(`/${name}/${item.id}`)).json<Record<string, unknown>>()
          const res = await ctx.app.inject({
            method: 'PUT',
            url: `/api/v1/admin/${name}/${item.id}`,
            cookies: session.cookies,
            payload: current,
          })
          if (res.statusCode !== 200) {
            failures.push(`PUT /${name}/${item.id} -> ${res.statusCode} ${res.body.slice(0, 300)}`)
            return
          }
          // Nothing may be lost or altered by saving (only the update timestamp moves).
          const { updatedAt: _a, ...before } = current
          const { updatedAt: _b, ...after } = res.json<Record<string, unknown>>()
          if (JSON.stringify(after) !== JSON.stringify(before)) failures.push(`PUT /${name}/${item.id} changed the record`)
        }),
      )
    }
    const settings = (await adminGet('/settings')).json<Record<string, unknown>>()
    for (const key of SETTING_KEYS) {
      if (settings[key] === null) continue
      const res = await ctx.app.inject({
        method: 'PUT',
        url: `/api/v1/admin/settings/${key}`,
        cookies: session.cookies,
        payload: settings[key] as Record<string, unknown>,
      })
      if (res.statusCode !== 200) failures.push(`PUT /settings/${key} -> ${res.statusCode} ${res.body.slice(0, 300)}`)
    }
    expect(failures).toEqual([])
  })

  it('every seeded public page renders in all locales', async () => {
    const failures: string[] = []
    const check = async (url: string) => {
      const res = await ctx.app.inject({ method: 'GET', url })
      if (res.statusCode !== 200) failures.push(`${url} -> ${res.statusCode} ${res.body.slice(0, 200)}`)
      return res
    }
    const sitemap = (await check('/api/v1/sitemap-data')).json<Record<string, { slug: string }[]>>()
    for (const locale of ['en', 'zh', 'de']) {
      for (const url of ['/tours?pageSize=50', '/destinations', '/regions', '/categories', '/reviews', '/reviews/summary', '/faqs', '/blog', '/gallery', '/settings/public']) {
        await check(`/api/v1${url}${url.includes('?') ? '&' : '?'}locale=${locale}`)
      }
      await Promise.all([
        ...(sitemap.tours ?? []).map((t) => check(`/api/v1/tours/${t.slug}?locale=${locale}`)),
        ...(sitemap.destinations ?? []).map((d) => check(`/api/v1/destinations/${d.slug}?locale=${locale}`)),
        ...(sitemap.blog ?? []).map((b) => check(`/api/v1/blog/${b.slug}?locale=${locale}`)),
      ])
    }
    await check('/api/v1/availability')
    expect(sitemap.tours?.length).toBeGreaterThanOrEqual(6)
    expect(failures).toEqual([])
  })

  it('is idempotent: running it again keeps ids stable and does not duplicate anything', async () => {
    const db = ctx.app.deps.prisma
    const before = { reviews: await db.review.count(), media: await db.media.count(), admins: await db.adminUser.count() }
    await runSeed()
    const ids = (await db.tour.findMany({ select: { id: true }, orderBy: { slug: 'asc' } })).map((t) => t.id)
    expect(ids).toEqual(firstRunTourIds)
    expect({ reviews: await db.review.count(), media: await db.media.count(), admins: await db.adminUser.count() }).toEqual(before)
  }, 120_000)
})
