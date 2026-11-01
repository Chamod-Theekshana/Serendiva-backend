import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createEmailRetryRunner } from '@/jobs/email-retry'
import { MAX_EMAIL_ATTEMPTS } from '@/modules/inquiries/lead-emails'
import { createAdmin, createDestination, createTour } from './factories'
import { buildTestApp, login, waitFor, type ErrorBody, type Session, type TestContext } from './helpers'

let ctx: TestContext
let session: Session
let tourSlug: string
let destinationSlug: string

const YEAR = new Date().getUTCFullYear()
const GUIDE = 'guide@serendiva.test'
const VISITOR = 'anna.schmidt@example.de'

const validInquiry = (over: Record<string, unknown> = {}) => ({
  name: 'Anna Schmidt',
  email: VISITOR,
  whatsapp: '+49 151 2345 6789',
  country: 'Germany',
  partyType: 'couple',
  adults: 2,
  children: 1,
  travelStart: '2027-01-10',
  travelEnd: '2027-01-24',
  flexibleDates: true,
  interests: ['Wildlife', 'Tea country', 'Wildlife'],
  tourSlug,
  destinationSlug,
  message: 'We would love a slow, nature-focused trip.\nCan we see leopards?',
  sourcePage: `/tours/${tourSlug}`,
  locale: 'en',
  ...over,
})

const submit = (payload: Record<string, unknown>) => ctx.app.inject({ method: 'POST', url: '/api/v1/inquiries', payload })

const inquiryRow = (reference: string) => ctx.app.deps.prisma.inquiry.findUnique({ where: { reference } })

/** Wait until the after-response email task has recorded its outcome. */
const settled = (reference: string) =>
  waitFor(async () => {
    const row = await inquiryRow(reference)
    return row && row.emailStatus !== 'pending' ? row : null
  }, { message: `email outcome of ${reference}` })

/** Runs one pass of the retry job as if it were 3 minutes later (fresh leads are skipped for 2 minutes). */
const runRetryJob = () => createEmailRetryRunner(ctx.app.deps, ctx.app.log)(Date.now() + 3 * 60_000)

beforeAll(async () => {
  ctx = await buildTestApp()
  await createAdmin(ctx.app.deps.prisma)
  session = await login(ctx.app)
  tourSlug = (await createTour(ctx.app.deps.prisma, { slug: 'wild-leopards', title: { en: 'Wild Leopards Safari' } })).slug
  destinationSlug = (await createDestination(ctx.app.deps.prisma, { slug: 'yala', name: { en: 'Yala' } })).slug
})
afterAll(async () => {
  await ctx.close()
})
beforeEach(async () => {
  ctx.email.reset()
})

describe('POST /api/v1/inquiries', () => {
  it('saves the inquiry and returns sequential SRD-YYYY-NNNN references', async () => {
    await ctx.app.deps.prisma.inquiry.deleteMany()
    await ctx.app.deps.prisma.referenceCounter.deleteMany()

    const first = await submit(validInquiry())
    expect(first.statusCode).toBe(201)
    expect(first.json()).toEqual({ reference: `SRD-${YEAR}-0001`, message: 'Thank you — I will reply within 24 hours.' })

    const second = await submit(validInquiry({ name: 'Second Visitor' }))
    expect(second.json<{ reference: string }>().reference).toBe(`SRD-${YEAR}-0002`)

    const row = await inquiryRow(`SRD-${YEAR}-0001`)
    expect(row).toMatchObject({
      name: 'Anna Schmidt',
      email: VISITOR,
      whatsapp: '+49 151 2345 6789',
      partyType: 'couple',
      adults: 2,
      children: 1,
      flexibleDates: true,
      interests: ['Wildlife', 'Tea country'],
      status: 'new',
      locale: 'en',
    })
    expect(row?.travelStart?.toISOString().slice(0, 10)).toBe('2027-01-10')
    expect(row?.tourId).not.toBeNull()
    expect(row?.destinationId).not.toBeNull()
    await settled(`SRD-${YEAR}-0001`)
    await settled(`SRD-${YEAR}-0002`)
  })

  it('emails the guide (reply-to visitor) and confirms to the visitor', async () => {
    const res = await submit(validInquiry())
    const { reference } = res.json<{ reference: string }>()
    await waitFor(() => ctx.email.messages.length >= 2, { message: 'two emails' })

    const [guide] = ctx.email.to(GUIDE)
    expect(guide).toBeDefined()
    expect(guide?.replyTo).toBe(VISITOR)
    expect(guide?.from).toBe('Serendiva Test <hello@serendiva.test>')
    expect(guide?.subject).toBe(`New inquiry ${reference} — Anna Schmidt · Wild Leopards Safari`)
    expect(guide?.html).toContain('https://wa.me/4915123456789')
    expect(guide?.html).toContain(`http://www.serendiva.test/tours/${tourSlug}`)
    expect(guide?.text).toContain('Can we see leopards?')

    const [visitor] = ctx.email.to(VISITOR)
    expect(visitor).toBeDefined()
    expect(visitor?.subject).toContain(reference)
    expect(visitor?.text).toContain(reference)
    expect(visitor?.text).toContain('I will reply within 24 hours')
    expect(ctx.email.messages).toHaveLength(2)

    const row = await settled(reference)
    expect(row.emailStatus).toBe('sent')
    expect(row.guideEmailSentAt).not.toBeNull()
    expect(row.visitorEmailSentAt).not.toBeNull()
    expect(row.emailAttempts).toBe(1)
    expect(row.lastEmailError).toBeNull()
  })

  it('accepts "" for optional fields and ignores unknown tour/destination slugs', async () => {
    const res = await submit({
      name: 'Minimal Person',
      email: '  Minimal@Example.com ',
      whatsapp: '',
      country: '',
      partyType: '',
      travelStart: '',
      travelEnd: '',
      tourSlug: 'does-not-exist',
      destinationSlug: '',
      message: '',
    })
    expect(res.statusCode).toBe(201)
    const row = await inquiryRow(res.json<{ reference: string }>().reference)
    expect(row).toMatchObject({ email: 'minimal@example.com', whatsapp: null, country: null, tourId: null, destinationId: null, adults: 2, children: 0 })
    await settled(row!.reference)
  })

  it('strips HTML from free-text fields', async () => {
    const res = await submit(validInquiry({ name: '<b>Bold</b> Name', message: 'Hello <script>alert(1)</script>there' }))
    const row = await inquiryRow(res.json<{ reference: string }>().reference)
    expect(row?.name).toBe('Bold Name')
    expect(row?.message).toBe('Hello alert(1)there')
    await settled(row!.reference)
  })

  it('honeypot: pretends success but saves and sends nothing', async () => {
    const before = await ctx.app.deps.prisma.inquiry.count()
    const res = await submit(validInquiry({ website: 'http://spam.example' }))
    expect(res.statusCode).toBe(201)
    expect(res.json<{ reference: string }>().reference).toMatch(new RegExp(`^SRD-${YEAR}-\\d{4}$`))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(await ctx.app.deps.prisma.inquiry.count()).toBe(before)
    expect(ctx.email.messages).toHaveLength(0)
  })

  it('returns field-level validation errors in the standard shape', async () => {
    const before = await ctx.app.deps.prisma.inquiry.count()
    const res = await submit(validInquiry({ name: 'A', email: 'not-an-email', adults: 0, travelStart: '2027-02-10', travelEnd: '2027-02-01' }))
    expect(res.statusCode).toBe(400)
    const body = res.json<ErrorBody>()
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.message).toBe('Some fields are invalid')
    const paths = body.error.details?.map((d) => d.path)
    expect(paths).toEqual(expect.arrayContaining(['name', 'email', 'adults']))
    for (const d of body.error.details ?? []) expect(typeof d.message).toBe('string')
    expect(await ctx.app.deps.prisma.inquiry.count()).toBe(before)

    // Cross-field rule (only reported once the fields themselves are valid)
    const dates = await submit(validInquiry({ travelStart: '2027-02-10', travelEnd: '2027-02-01' }))
    expect(dates.statusCode).toBe(400)
    expect(dates.json<ErrorBody>().error.details).toEqual([
      { path: 'travelEnd', message: 'The end date must be on or after the start date' },
    ])

    const badDate = await submit(validInquiry({ travelStart: '2027-02-30' }))
    expect(badDate.json<ErrorBody>().error.details?.[0]).toMatchObject({ path: 'travelStart' })
  })

  it('rejects a malformed JSON body with 400', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/inquiries',
      headers: { 'content-type': 'application/json' },
      payload: '{"name": ',
    })
    expect(res.statusCode).toBe(400)
    expect(res.json<ErrorBody>().error.code).toBe('BAD_REQUEST')
  })
})

describe('email failures never lose an inquiry', () => {
  it('both emails fail -> saved as "failed"; the retry job delivers them later', async () => {
    ctx.email.failWhen(() => true)
    const res = await submit(validInquiry())
    expect(res.statusCode).toBe(201)
    const { reference } = res.json<{ reference: string }>()

    const failed = await settled(reference)
    expect(failed.emailStatus).toBe('failed')
    expect(failed.emailAttempts).toBe(1)
    expect(failed.lastEmailError).toContain('guide: Simulated email provider outage')
    expect(failed.lastEmailError).toContain('visitor: Simulated email provider outage')
    expect(ctx.email.failed).toHaveLength(2)

    // Provider is back
    ctx.email.failWhen(null)
    const summary = await runRetryJob()
    expect(summary.inquiries.sent).toBeGreaterThanOrEqual(1)

    const fixed = await inquiryRow(reference)
    expect(fixed?.emailStatus).toBe('sent')
    expect(fixed?.emailAttempts).toBe(2)
    expect(fixed?.lastEmailError).toBeNull()
    expect(ctx.email.to(GUIDE)).toHaveLength(1)
    expect(ctx.email.to(VISITOR)).toHaveLength(1)
  })

  it('only the guide email fails -> "partial"; a retry sends only the missing one', async () => {
    ctx.email.failWhen((m) => m.to === GUIDE)
    const { reference } = (await submit(validInquiry())).json<{ reference: string }>()
    const partial = await settled(reference)
    expect(partial.emailStatus).toBe('partial')
    expect(partial.guideEmailSentAt).toBeNull()
    expect(partial.visitorEmailSentAt).not.toBeNull()
    expect(ctx.email.to(VISITOR)).toHaveLength(1)

    ctx.email.failWhen(null)
    await runRetryJob()
    expect((await inquiryRow(reference))?.emailStatus).toBe('sent')
    expect(ctx.email.to(GUIDE)).toHaveLength(1)
    // The visitor is not emailed twice
    expect(ctx.email.to(VISITOR)).toHaveLength(1)
  })

  it('the retry job gives up after the maximum attempts; the admin can still resend', async () => {
    ctx.email.failWhen(() => true)
    const { reference } = (await submit(validInquiry())).json<{ reference: string }>()
    const row = await settled(reference)
    await ctx.app.deps.prisma.inquiry.update({ where: { id: row.id }, data: { emailAttempts: MAX_EMAIL_ATTEMPTS } })

    ctx.email.failWhen(null)
    await runRetryJob()
    expect((await inquiryRow(reference))?.emailStatus).toBe('failed')
    expect(ctx.email.messages).toHaveLength(0)

    const res = await ctx.app.inject({
      method: 'POST',
      url: `/api/v1/admin/inquiries/${row.id}/resend-emails`,
      cookies: session.cookies,
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ reference, emailStatus: 'sent', lastEmailError: null })
    expect(ctx.email.messages).toHaveLength(2)
  })
})

describe('admin inquiry management', () => {
  it('lists, filters, updates, and deletes inquiries', async () => {
    const { reference } = (await submit(validInquiry({ name: 'Findable Person', email: 'findable@example.com' }))).json<{ reference: string }>()
    const row = await settled(reference)

    const list = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/inquiries?q=findable&pageSize=5', cookies: session.cookies })
    expect(list.statusCode).toBe(200)
    const body = list.json<{ items: { reference: string; hasNotes: boolean }[]; meta: { total: number; pageSize: number }; counts: { new: number } }>()
    expect(body.items.map((i) => i.reference)).toEqual([reference])
    expect(body.meta).toMatchObject({ total: 1, pageSize: 5 })

    const patched = await ctx.app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/inquiries/${row.id}`,
      cookies: session.cookies,
      payload: { status: 'replied', internalNotes: 'Sent a draft itinerary on WhatsApp' },
    })
    expect(patched.statusCode).toBe(200)
    expect(patched.json()).toMatchObject({ status: 'replied', internalNotes: 'Sent a draft itinerary on WhatsApp' })

    const replied = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/inquiries?status=replied', cookies: session.cookies })
    expect(replied.json<{ items: { reference: string; hasNotes: boolean }[] }>().items).toEqual([
      expect.objectContaining({ reference, hasNotes: true }),
    ])

    const detail = await ctx.app.inject({ method: 'GET', url: `/api/v1/admin/inquiries/${row.id}`, cookies: session.cookies })
    expect(detail.json()).toMatchObject({ reference, tour: { slug: tourSlug }, destination: { slug: destinationSlug } })

    const del = await ctx.app.inject({ method: 'DELETE', url: `/api/v1/admin/inquiries/${row.id}`, cookies: session.cookies })
    expect(del.statusCode).toBe(204)
    expect(del.body).toBe('')
    const gone = await ctx.app.inject({ method: 'GET', url: `/api/v1/admin/inquiries/${row.id}`, cookies: session.cookies })
    expect(gone.statusCode).toBe(404)
    expect(gone.json<ErrorBody>().error).toEqual({ code: 'NOT_FOUND', message: 'Inquiry not found' })
  })

  it('filters by date range (inclusive, UTC)', async () => {
    const { reference } = (await submit(validInquiry())).json<{ reference: string }>()
    const row = await settled(reference)
    const day = row.createdAt.toISOString().slice(0, 10)
    const res = await ctx.app.inject({ method: 'GET', url: `/api/v1/admin/inquiries?from=${day}&to=${day}`, cookies: session.cookies })
    expect(res.statusCode).toBe(200)
    expect(res.json<{ meta: { total: number } }>().meta.total).toBeGreaterThan(0)
    const past = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/inquiries?from=2020-01-01&to=2020-12-31', cookies: session.cookies })
    expect(past.json<{ meta: { total: number } }>().meta.total).toBe(0)
  })
})
