import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadEnv } from '@/config/env'
import { TEST_ENV } from './helpers'

const load = (over: Record<string, string>) => loadEnv({ ...TEST_ENV, UPLOAD_DIR: 'uploads', ...over })

describe('environment validation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses lists, booleans and defaults', () => {
    const env = load({ CORS_ORIGINS: 'https://a.example, https://b.example,,', EMAIL_RETRY_DISABLED: '1', PORT: '8080' })
    expect(env.CORS_ORIGINS).toEqual(['https://a.example', 'https://b.example'])
    expect(env.EMAIL_RETRY_DISABLED).toBe(true)
    expect(env.PORT).toBe(8080)
    expect(env.COOKIE_DOMAIN).toBeUndefined()
    expect(env.TURNSTILE_SECRET).toBeUndefined()
  })

  it.each([
    ['', false],
    ['false', false],
    ['0', false],
    ['true', true],
    ['1', 1],
    ['2', 2],
    ['10.0.0.0/8, 127.0.0.1', ['10.0.0.0/8', '127.0.0.1']],
  ])('TRUST_PROXY=%j -> %j', (value, expected) => {
    expect(load({ TRUST_PROXY: value }).TRUST_PROXY).toEqual(expected)
  })

  it('fails fast with a readable list of problems', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit')
    }) as never)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      load({ JWT_ACCESS_SECRET: 'short', COOKIE_SAMESITE: 'none', COOKIE_SECURE: 'false', STORAGE_DRIVER: 's3', EMAIL_DRIVER: 'resend' }),
    ).toThrow('process.exit')
    expect(exit).toHaveBeenCalledWith(1)
    const output = String(error.mock.calls[0]?.[0])
    for (const key of ['JWT_ACCESS_SECRET', 'COOKIE_SECURE', 'S3_BUCKET', 'RESEND_API_KEY']) expect(output).toContain(key)
  })
})
