import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { buildTestApp, type ErrorBody, type TestContext } from './helpers'

const inquiry = (over: Record<string, unknown> = {}) => ({ name: 'Rate Tester', email: 'rate@example.com', ...over })

describe('form rate limit (FORM_RATE_LIMIT per IP per minute)', () => {
  let ctx: TestContext
  beforeAll(async () => {
    ctx = await buildTestApp({ FORM_RATE_LIMIT: '2' })
  })
  afterAll(async () => {
    await ctx.close()
  })

  it('answers 429 with the error envelope once the limit is reached', async () => {
    const email = 'rate-limit@example.com'
    const send = (ip: string) =>
      ctx.app.inject({ method: 'POST', url: '/api/v1/inquiries', payload: inquiry({ email }), remoteAddress: ip })

    expect((await send('203.0.113.10')).statusCode).toBe(201)
    expect((await send('203.0.113.10')).statusCode).toBe(201)
    const limited = await send('203.0.113.10')
    expect(limited.statusCode).toBe(429)
    expect(limited.json<ErrorBody>().error.code).toBe('RATE_LIMITED')
    expect(limited.headers['retry-after']).toBeDefined()

    // Another visitor is not affected
    expect((await send('203.0.113.11')).statusCode).toBe(201)
    // Two from the first IP + one from the second; the rejected request stored nothing
    expect(await ctx.app.deps.prisma.inquiry.count({ where: { email } })).toBe(3)
  })

  it('applies to the newsletter form as well', async () => {
    const send = () =>
      ctx.app.inject({
        method: 'POST',
        url: '/api/v1/newsletter/subscribe',
        payload: { email: 'limit@example.com' },
        remoteAddress: '203.0.113.20',
      })
    await send()
    await send()
    expect((await send()).statusCode).toBe(429)
  })
})

describe('client IP behind a reverse proxy (TRUST_PROXY)', () => {
  const subscribe = (ctx: TestContext, n: number, xff: string) =>
    ctx.app.inject({
      method: 'POST',
      url: '/api/v1/newsletter/subscribe',
      payload: { email: `proxy-${n}@example.com` },
      remoteAddress: '10.0.0.2', // the platform's load balancer
      headers: { 'x-forwarded-for': xff },
    })

  it('TRUST_PROXY=1: a forged X-Forwarded-For prefix cannot dodge the per-IP limit', async () => {
    const ctx = await buildTestApp({ TRUST_PROXY: '1', FORM_RATE_LIMIT: '2' })
    try {
      // The proxy appends the real client address (198.51.100.1); the client invents the rest.
      const codes: number[] = []
      for (let i = 0; i < 3; i++) codes.push((await subscribe(ctx, i, `1.2.3.${i}, 198.51.100.1`)).statusCode)
      expect(codes).toEqual([200, 200, 429])
      // A different real client is unaffected
      expect((await subscribe(ctx, 9, '198.51.100.2')).statusCode).toBe(200)
    } finally {
      await ctx.close()
    }
  })

  it('TRUST_PROXY=false: X-Forwarded-For is ignored entirely', async () => {
    const ctx = await buildTestApp({ TRUST_PROXY: 'false', FORM_RATE_LIMIT: '2' })
    try {
      const codes: number[] = []
      for (let i = 0; i < 3; i++) codes.push((await subscribe(ctx, i, `198.51.100.${i}`)).statusCode)
      expect(codes).toEqual([200, 200, 429]) // all counted against the socket address
    } finally {
      await ctx.close()
    }
  })
})

describe('Cloudflare Turnstile (when TURNSTILE_SECRET is set)', () => {
  let ctx: TestContext
  beforeAll(async () => {
    ctx = await buildTestApp({ TURNSTILE_SECRET: 'test-turnstile-secret' })
  })
  afterAll(async () => {
    await ctx.close()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockSiteverify = (success: boolean) =>
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ success }))

  it('requires a token', async () => {
    const res = await ctx.app.inject({ method: 'POST', url: '/api/v1/inquiries', payload: inquiry() })
    expect(res.statusCode).toBe(400)
    expect(res.json<ErrorBody>().error.message).toBe('Please complete the anti-spam check')
  })

  it('rejects a token Cloudflare does not accept', async () => {
    const fetchSpy = mockSiteverify(false)
    const res = await ctx.app.inject({ method: 'POST', url: '/api/v1/inquiries', payload: inquiry({ turnstileToken: 'bad' }) })
    expect(res.statusCode).toBe(400)
    expect(res.json<ErrorBody>().error.message).toBe('Anti-spam check failed, please try again')
    expect(String(fetchSpy.mock.calls[0]?.[0])).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
  })

  it('accepts a valid token and sends secret + remote IP to Cloudflare', async () => {
    const fetchSpy = mockSiteverify(true)
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/inquiries',
      payload: inquiry({ turnstileToken: 'good-token' }),
      remoteAddress: '198.51.100.7',
    })
    expect(res.statusCode).toBe(201)
    const body = fetchSpy.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(body.get('secret')).toBe('test-turnstile-secret')
    expect(body.get('response')).toBe('good-token')
    expect(body.get('remoteip')).toBe('198.51.100.7')
  })

  it('a Cloudflare outage is reported as a retryable 400, not a 500', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'))
    const res = await ctx.app.inject({ method: 'POST', url: '/api/v1/inquiries', payload: inquiry({ turnstileToken: 'x' }) })
    expect(res.statusCode).toBe(400)
    expect(res.json<ErrorBody>().error.message).toBe('Anti-spam check could not be verified, please try again')
  })
})
