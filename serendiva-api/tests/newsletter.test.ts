import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdmin } from './factories'
import { buildTestApp, login, waitFor, type ErrorBody, type Session, type TestContext } from './helpers'

let ctx: TestContext
let session: Session

const subscribe = (payload: Record<string, unknown>) =>
  ctx.app.inject({ method: 'POST', url: '/api/v1/newsletter/subscribe', payload })
const confirm = (token: string) =>
  ctx.app.inject({ method: 'GET', url: `/api/v1/newsletter/confirm?token=${encodeURIComponent(token)}` })
const unsubscribe = (token: string) =>
  ctx.app.inject({ method: 'GET', url: `/api/v1/newsletter/unsubscribe?token=${encodeURIComponent(token)}` })

/** Extracts the ?token= of a link in the confirmation email. */
function tokenFrom(html: string, path: string): string {
  const match = html.match(new RegExp(`${path}\\?token=([^"&<\\s]+)`))
  if (!match?.[1]) throw new Error(`no ${path} link in email`)
  return decodeURIComponent(match[1])
}

beforeAll(async () => {
  ctx = await buildTestApp()
  await createAdmin(ctx.app.deps.prisma)
  session = await login(ctx.app)
})
afterAll(async () => {
  await ctx.close()
})
beforeEach(() => {
  ctx.email.reset()
})

describe('newsletter double opt-in', () => {
  it('subscribe -> confirmation email -> confirm -> unsubscribe', async () => {
    const res = await subscribe({ email: ' Reader@Example.com ', locale: 'de', source: 'footer' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ status: 'pending' })

    const row = await ctx.app.deps.prisma.newsletterSubscriber.findUniqueOrThrow({ where: { email: 'reader@example.com' } })
    expect(row).toMatchObject({ locale: 'de', source: 'footer', confirmedAt: null })

    const mail = await waitFor(() => ctx.email.to('reader@example.com')[0], { message: 'confirmation email' })
    expect(mail.subject).toBe('Please confirm your Serendiva subscription')
    // Links point at the localized website pages
    expect(mail.html).toContain('http://www.serendiva.test/de/newsletter/confirm?token=')
    const confirmToken = tokenFrom(mail.html, '/newsletter/confirm')
    const unsubscribeToken = tokenFrom(mail.html, '/newsletter/unsubscribe')
    expect(confirmToken).toBe(row.confirmToken)

    const confirmed = await confirm(confirmToken)
    expect(confirmed.statusCode).toBe(200)
    expect(confirmed.json()).toEqual({ status: 'confirmed' })
    expect(confirmed.headers['cache-control']).toBe('no-store')
    expect((await confirm(confirmToken)).json()).toEqual({ status: 'already_confirmed' })

    // Subscribing again while confirmed sends nothing
    ctx.email.reset()
    const again = await subscribe({ email: 'reader@example.com' })
    expect(again.json()).toMatchObject({ status: 'already_subscribed' })
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(ctx.email.messages).toHaveLength(0)

    const unsub = await unsubscribe(unsubscribeToken)
    expect(unsub.json()).toEqual({ status: 'unsubscribed' })
    expect((await unsubscribe(unsubscribeToken)).json()).toEqual({ status: 'unsubscribed' }) // idempotent

    // The old confirmation link cannot re-subscribe
    const stale = await confirm(confirmToken)
    expect(stale.statusCode).toBe(400)
    expect(stale.json<ErrorBody>().error.code).toBe('INVALID_TOKEN')

    // Re-subscribing restarts double opt-in with a new token
    const resub = await subscribe({ email: 'reader@example.com' })
    expect(resub.json()).toMatchObject({ status: 'pending' })
    const fresh = await ctx.app.deps.prisma.newsletterSubscriber.findUniqueOrThrow({ where: { email: 'reader@example.com' } })
    expect(fresh.confirmToken).not.toBe(confirmToken)
    expect(fresh.unsubscribedAt).toBeNull()
  })

  it('unknown tokens are rejected', async () => {
    const res = await confirm('this-token-does-not-exist-123')
    expect(res.statusCode).toBe(400)
    expect(res.json<ErrorBody>().error).toEqual({ code: 'INVALID_TOKEN', message: 'This link is invalid or has expired' })
    expect((await unsubscribe('this-token-does-not-exist-123')).statusCode).toBe(400)
    // Too short to be a token -> validation error
    expect((await confirm('abc')).json<ErrorBody>().error.code).toBe('VALIDATION_ERROR')
  })

  it('honeypot and invalid emails', async () => {
    const before = await ctx.app.deps.prisma.newsletterSubscriber.count()
    const bot = await subscribe({ email: 'bot@example.com', website: 'x' })
    expect(bot.statusCode).toBe(200)
    expect(await ctx.app.deps.prisma.newsletterSubscriber.count()).toBe(before)

    const bad = await subscribe({ email: 'not-an-email' })
    expect(bad.statusCode).toBe(400)
    expect(bad.json<ErrorBody>().error.details?.[0]?.path).toBe('email')
  })

  it('admin can list, export and delete subscribers', async () => {
    await subscribe({ email: 'pending@example.com' })
    const list = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/newsletter?status=pending', cookies: session.cookies })
    expect(list.statusCode).toBe(200)
    const body = list.json<{ items: { id: string; email: string; status: string }[]; counts: Record<string, number> }>()
    const item = body.items.find((i) => i.email === 'pending@example.com')
    expect(item?.status).toBe('pending')
    expect(list.body).not.toMatch(/confirmToken|unsubscribeToken/)

    const csv = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/newsletter/export.csv?status=all', cookies: session.cookies })
    expect(csv.statusCode).toBe(200)
    expect(csv.headers['content-type']).toBe('text/csv; charset=utf-8')
    expect(csv.body).toContain('pending@example.com')

    const del = await ctx.app.inject({ method: 'DELETE', url: `/api/v1/admin/newsletter/${item!.id}`, cookies: session.cookies })
    expect(del.statusCode).toBe(204)
    const again = await ctx.app.inject({ method: 'DELETE', url: `/api/v1/admin/newsletter/${item!.id}`, cookies: session.cookies })
    expect(again.statusCode).toBe(404)
  })
})
