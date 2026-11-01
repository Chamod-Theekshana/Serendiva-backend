import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildTestApp, type ErrorBody, type TestContext } from './helpers'

let ctx: TestContext

beforeAll(async () => {
  ctx = await buildTestApp()
})
afterAll(async () => {
  await ctx.close()
})

describe('health & platform', () => {
  it('GET /health is a cheap liveness probe', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ status: 'ok' })
  })

  it('GET /health/ready checks the database', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/health/ready' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok', database: 'up' })
  })

  it('unknown routes use the standard error envelope', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/api/v1/nope?x=1' })
    expect(res.statusCode).toBe(404)
    expect(res.json<ErrorBody>()).toEqual({ error: { code: 'NOT_FOUND', message: 'Route GET /api/v1/nope not found' } })
  })

  it('echoes a request id and sets security headers', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/health', headers: { 'x-request-id': 'req-123' } })
    expect(res.headers['x-request-id']).toBe('req-123')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['strict-transport-security']).toBeDefined()
  })

  it('CORS: allow-listed origins get credentials, others are refused', async () => {
    const allowed = await ctx.app.inject({
      method: 'OPTIONS',
      url: '/api/v1/admin/auth/me',
      headers: { origin: 'http://admin.serendiva.test', 'access-control-request-method': 'GET' },
    })
    expect(allowed.statusCode).toBe(204)
    expect(allowed.headers['access-control-allow-origin']).toBe('http://admin.serendiva.test')
    expect(allowed.headers['access-control-allow-credentials']).toBe('true')

    // FRONTEND_URL is always allowed
    const frontend = await ctx.app.inject({ method: 'GET', url: '/health', headers: { origin: 'http://www.serendiva.test' } })
    expect(frontend.headers['access-control-allow-origin']).toBe('http://www.serendiva.test')

    const evil = await ctx.app.inject({ method: 'GET', url: '/health', headers: { origin: 'https://evil.example' } })
    expect(evil.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('serves the OpenAPI document', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/openapi.json' })
    expect(res.statusCode).toBe(200)
    const spec = res.json<{ openapi: string; paths: Record<string, unknown> }>()
    expect(spec.openapi).toMatch(/^3\./)
    expect(Object.keys(spec.paths)).toContain('/api/v1/inquiries')
  })
})
