import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdmin, createTour } from './factories'
import { buildTestApp, login, multipart, type ErrorBody, type Session, type TestContext, type UploadFile } from './helpers'

let ctx: TestContext
let session: Session
let jpeg: Buffer
let smallJpeg: Buffer

interface AdminMedia {
  id: string
  url: string
  thumbUrl: string | null
  mime: string
  width: number | null
  height: number | null
  variants: Record<'thumb' | 'medium' | 'large', { url: string; width: number | null; height: number | null } | undefined>
  blurDataUrl: string | null
  altText: Record<string, string>
  originalName: string | null
}

async function upload(files: UploadFile[], fields: Record<string, string> = {}) {
  const { payload, headers } = await multipart(fields, files)
  return ctx.app.inject({ method: 'POST', url: '/api/v1/admin/media', payload, headers, cookies: session.cookies })
}

/** Local path of a file served under API_PUBLIC_URL/uploads/. */
const localPath = (url: string) => path.join(ctx.uploadDir, new URL(url).pathname.replace(/^\/uploads\//, ''))

beforeAll(async () => {
  ctx = await buildTestApp()
  await createAdmin(ctx.app.deps.prisma)
  session = await login(ctx.app)
  // Wider than the largest variant (1920px) so every variant is actually resized
  jpeg = await sharp({ create: { width: 2000, height: 1200, channels: 3, background: '#2c4e23' } }).jpeg().toBuffer()
  smallJpeg = await sharp({ create: { width: 640, height: 480, channels: 3, background: '#b5651d' } }).jpeg().toBuffer()
})
afterAll(async () => {
  await ctx.close()
})
beforeEach(() => {
  ctx.revalidate.reset()
})

describe('media upload', () => {
  it('converts an image to WebP with thumb/medium/large variants and a blur placeholder', async () => {
    const res = await upload([{ field: 'files', filename: 'IMG_2041 Sigiriya.JPG', content: jpeg, type: 'image/jpeg' }], {
      altText: 'Sigiriya at sunrise',
      folder: 'tours',
    })
    expect(res.statusCode, res.body).toBe(201)
    const { items, errors } = res.json<{ items: AdminMedia[]; errors: unknown[] }>()
    expect(errors).toEqual([])
    const media = items[0]!
    expect(media).toMatchObject({ mime: 'image/webp', width: 2000, height: 1200, altText: { en: 'Sigiriya at sunrise' }, originalName: 'IMG_2041 Sigiriya.JPG' })
    expect(media.url).toMatch(/^http:\/\/api\.serendiva\.test\/uploads\/media\/tours\/\d{4}\/\d{2}\/.+-img-2041-sigiriya\.webp$/)
    expect(media.variants.thumb?.width).toBe(400)
    expect(media.variants.medium?.width).toBe(1024)
    expect(media.variants.large?.width).toBe(1920)
    expect(media.thumbUrl).toBe(media.variants.thumb?.url)
    expect(media.blurDataUrl).toMatch(/^data:image\/webp;base64,/)

    for (const url of [media.url, media.variants.thumb!.url, media.variants.medium!.url, media.variants.large!.url]) {
      expect(existsSync(localPath(url)), url).toBe(true)
    }
    // Public files are served by the static route with long-lived caching
    const served = await ctx.app.inject({ method: 'GET', url: new URL(media.variants.thumb!.url).pathname })
    expect(served.statusCode).toBe(200)
    expect(served.headers['content-type']).toBe('image/webp')
    expect(served.headers['cache-control']).toContain('immutable')
  })

  it('stores PDFs as-is and reports rejected files per file', async () => {
    const res = await upload([
      { field: 'files', filename: 'price-list.pdf', content: Buffer.from('%PDF-1.7\n%%EOF\n...........') },
      { field: 'files', filename: 'notes.txt', content: Buffer.from('just some plain text, not allowed') },
      { field: 'files', filename: 'broken.jpg', content: Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64)]) },
    ])
    expect(res.statusCode).toBe(201)
    const body = res.json<{ items: AdminMedia[]; errors: { fileName: string; message: string }[] }>()
    expect(body.items.map((m) => m.mime)).toEqual(['application/pdf'])
    expect(body.errors).toEqual([
      { fileName: 'notes.txt', message: expect.stringContaining('Unsupported file type') },
      { fileName: 'broken.jpg', message: expect.stringContaining('could not be read') },
    ])
  })

  it('requires at least one file and multipart/form-data', async () => {
    const empty = await upload([], { altText: 'nothing' })
    expect(empty.statusCode).toBe(400)
    expect(empty.json<ErrorBody>().error.details?.[0]?.path).toBe('files')

    const json = await ctx.app.inject({ method: 'POST', url: '/api/v1/admin/media', cookies: session.cookies, payload: {} })
    expect(json.statusCode).toBe(415)
  })
})

describe('media management', () => {
  it('updates alt text per locale and revalidates pages using the image', async () => {
    const media = (await upload([{ field: 'files', filename: 'a.jpg', content: smallJpeg }])).json<{ items: AdminMedia[] }>().items[0]!
    await createTour(ctx.app.deps.prisma, { slug: 'alt-text-tour', coverId: media.id })
    ctx.revalidate.reset()

    const res = await ctx.app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/media/${media.id}`,
      cookies: session.cookies,
      payload: { altText: { en: 'Lion Rock', zh: '狮子岩', de: '' } },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json<AdminMedia>().altText).toEqual({ en: 'Lion Rock', zh: '狮子岩' })
    expect(ctx.revalidate.tags()).toContain('tour:alt-text-tour')
  })

  it('refuses to delete a file that is in use (409 MEDIA_IN_USE), deletes it once unused', async () => {
    const media = (await upload([{ field: 'files', filename: 'cover.jpg', content: smallJpeg }])).json<{ items: AdminMedia[] }>().items[0]!
    const tour = await createTour(ctx.app.deps.prisma, { slug: 'uses-the-cover', title: { en: 'Uses The Cover' }, coverId: media.id })

    const blocked = await ctx.app.inject({ method: 'DELETE', url: `/api/v1/admin/media/${media.id}`, cookies: session.cookies })
    expect(blocked.statusCode).toBe(409)
    const err = blocked.json<{ error: { code: string; details: { usage: { type: string; id: string; label: string }[] } } }>().error
    expect(err.code).toBe('MEDIA_IN_USE')
    expect(err.details.usage).toEqual([{ type: 'tour', id: tour.id, label: 'Uses The Cover · cover' }])

    const detail = await ctx.app.inject({ method: 'GET', url: `/api/v1/admin/media/${media.id}`, cookies: session.cookies })
    expect(detail.json<{ usage: unknown[] }>().usage).toHaveLength(1)
    expect(existsSync(localPath(media.url))).toBe(true)

    await ctx.app.deps.prisma.tour.delete({ where: { id: tour.id } })
    const deleted = await ctx.app.inject({ method: 'DELETE', url: `/api/v1/admin/media/${media.id}`, cookies: session.cookies })
    expect(deleted.statusCode).toBe(204)
    expect(existsSync(localPath(media.url))).toBe(false)
    expect(existsSync(localPath(media.variants.thumb!.url))).toBe(false)
    expect((await ctx.app.inject({ method: 'GET', url: `/api/v1/admin/media/${media.id}`, cookies: session.cookies })).statusCode).toBe(404)
  })

  it('lists media with type filter and usage counts', async () => {
    await upload([
      { field: 'files', filename: 'terms.pdf', content: Buffer.from('%PDF-1.7\n%%EOF\n...........') },
      { field: 'files', filename: 'photo.jpg', content: smallJpeg },
    ])
    const docs = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/media?type=document', cookies: session.cookies })
    expect(docs.statusCode).toBe(200)
    const docItems = docs.json<{ items: { mime: string; usageCount: number }[] }>().items
    expect(docItems.length).toBeGreaterThan(0)
    expect(docItems.every((m) => m.mime === 'application/pdf' && m.usageCount === 0)).toBe(true)

    const images = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/media?type=image&q=photo', cookies: session.cookies })
    const imageItems = images.json<{ items: { mime: string; originalName: string }[] }>().items
    expect(imageItems.map((m) => m.originalName)).toContain('photo.jpg')
    expect(imageItems.every((m) => m.mime === 'image/webp')).toBe(true)
  })
})
