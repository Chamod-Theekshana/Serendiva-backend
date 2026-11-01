import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { LightMyRequestResponse } from 'fastify'
import { buildApp, type App } from '@/app'
import { loadEnv, type Env } from '@/config/env'
import type { EmailMessage, EmailProvider } from '@/lib/email'
import type { Revalidator } from '@/lib/revalidate'
import { TEST_DATABASE_URL } from './test-db'

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/** Values every test app starts from. Nothing is read from the developer's .env file. */
export const TEST_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  PORT: '4199',
  HOST: '127.0.0.1',
  API_PUBLIC_URL: 'http://api.serendiva.test',
  TRUST_PROXY: 'false',
  DATABASE_URL: TEST_DATABASE_URL,
  CORS_ORIGINS: 'http://admin.serendiva.test',
  FRONTEND_URL: 'http://www.serendiva.test',
  REVALIDATE_SECRET: 'test-revalidate-secret-0123456789',
  JWT_ACCESS_SECRET: 'test-access-secret-0123456789-0123456789-abcdef',
  JWT_REFRESH_SECRET: 'test-refresh-secret-0123456789-0123456789-abcdef',
  ACCESS_TOKEN_TTL_MINUTES: '15',
  REFRESH_TOKEN_TTL_DAYS: '30',
  COOKIE_SECURE: 'auto',
  COOKIE_SAMESITE: 'lax',
  EMAIL_DRIVER: 'console',
  MAIL_FROM: 'Serendiva Test <hello@serendiva.test>',
  GUIDE_NOTIFY_EMAIL: 'guide@serendiva.test',
  STORAGE_DRIVER: 'local',
  // Generous so ordinary tests never hit it; the rate-limit test builds its own app with a low value.
  FORM_RATE_LIMIT: '1000',
  EMAIL_RETRY_DISABLED: 'true',
  REVALIDATE_DISABLED: 'true',
}

// ---------------------------------------------------------------------------
// Email capture
// ---------------------------------------------------------------------------

export type CapturedEmail = EmailMessage & { from: string }

export interface EmailCapture {
  provider: EmailProvider
  /** Successfully "sent" messages, in order. */
  messages: CapturedEmail[]
  /** Messages the provider refused (because of failWhen). */
  failed: CapturedEmail[]
  /** Make the provider throw for matching messages (until reset / failWhen(null)). */
  failWhen(predicate: ((msg: CapturedEmail) => boolean) | null): void
  /** Messages sent to an address. */
  to(address: string): CapturedEmail[]
  reset(): void
}

const recipients = (m: { to: string | string[] }) => (Array.isArray(m.to) ? m.to : [m.to])

export function createEmailCapture(): EmailCapture {
  const messages: CapturedEmail[] = []
  const failed: CapturedEmail[] = []
  let shouldFail: ((msg: CapturedEmail) => boolean) | null = null
  return {
    messages,
    failed,
    provider: {
      name: 'capture',
      async send(msg) {
        if (shouldFail?.(msg)) {
          failed.push(msg)
          throw new Error('Simulated email provider outage')
        }
        messages.push(msg)
        return { id: `captured-${messages.length}` }
      },
    },
    failWhen(predicate) {
      shouldFail = predicate
    },
    to: (address) => messages.filter((m) => recipients(m).includes(address)),
    reset() {
      messages.length = 0
      failed.length = 0
      shouldFail = null
    },
  }
}

// ---------------------------------------------------------------------------
// Revalidation spy
// ---------------------------------------------------------------------------

export interface RevalidatorSpy {
  revalidator: Revalidator
  /** Tag lists of every call, in order. */
  calls: string[][]
  /** Every tag requested so far. */
  tags(): Set<string>
  reset(): void
}

export function createRevalidatorSpy(): RevalidatorSpy {
  const calls: string[][] = []
  return {
    calls,
    revalidator: {
      revalidate: (tags) => {
        calls.push([...tags])
      },
      revalidateNow: async (tags) => {
        calls.push([...tags])
        return true
      },
    },
    tags: () => new Set(calls.flat()),
    reset() {
      calls.length = 0
    },
  }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export interface TestContext {
  app: App
  env: Env
  email: EmailCapture
  revalidate: RevalidatorSpy
  /** Temporary UPLOAD_DIR of the local storage driver (deleted on close). */
  uploadDir: string
  close(): Promise<void>
}

/**
 * Builds the real application against the test database with test doubles for the outside world:
 * captured email, a revalidation spy and local storage in a temporary folder.
 */
export async function buildTestApp(overrides: Record<string, string> = {}): Promise<TestContext> {
  const uploadDir = await mkdtemp(path.join(os.tmpdir(), 'serendiva-test-uploads-'))
  const env = loadEnv({ ...TEST_ENV, UPLOAD_DIR: uploadDir, ...overrides })
  const email = createEmailCapture()
  const revalidate = createRevalidatorSpy()
  const app = await buildApp({ env, emailProvider: email.provider, revalidator: revalidate.revalidator })
  await app.ready()
  return {
    app,
    env,
    email,
    revalidate,
    uploadDir,
    async close() {
      // Let after-response email tasks (setImmediate) settle before the database connection closes.
      await new Promise((resolve) => setTimeout(resolve, 20))
      await app.close()
      await rm(uploadDir, { recursive: true, force: true })
    },
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const ADMIN = { email: 'admin@serendiva.test', password: 'Correct-Horse-2026', name: 'Test Admin' } as const

let ipCounter = 0
/**
 * A fresh client IP per call. Login is rate limited per IP (10 / 15 min), so helpers that sign in
 * many times use different addresses — exactly like separate visitors would.
 */
export function nextIp(): string {
  ipCounter++
  return `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter & 255}`
}

export type Cookies = Record<string, string>

/** Cookie jar update from a response: set cookies are stored, cleared ones removed. */
export function applySetCookies(jar: Cookies, res: LightMyRequestResponse): Cookies {
  const next = { ...jar }
  for (const c of res.cookies as { name: string; value: string; maxAge?: number; expires?: Date }[]) {
    const expired = c.value === '' || c.maxAge === 0 || (c.expires instanceof Date && c.expires.getTime() < Date.now())
    if (expired) delete next[c.name]
    else next[c.name] = c.value
  }
  return next
}

export interface Session {
  cookies: Cookies
  user: { id: string; email: string; name: string }
}

/** Signs in through the real endpoint and returns the session cookies. */
export async function login(
  app: App,
  creds: { email: string; password: string } = ADMIN,
): Promise<Session> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/admin/auth/login',
    payload: { email: creds.email, password: creds.password },
    remoteAddress: nextIp(),
  })
  if (res.statusCode !== 200) throw new Error(`login failed: ${res.statusCode} ${res.body}`)
  const body = res.json<{ user: Session['user'] }>()
  return { cookies: applySetCookies({}, res), user: body.user }
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export interface UploadFile {
  field: string
  filename: string
  content: Buffer
  type?: string
}

/** Encodes a multipart/form-data body with the platform's FormData (no extra dependency). */
export async function multipart(
  fields: Record<string, string | string[]>,
  files: UploadFile[] = [],
): Promise<{ payload: Buffer; headers: Record<string, string> }> {
  const form = new FormData()
  for (const [name, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) form.append(name, v)
  }
  for (const f of files) {
    form.append(f.field, new Blob([new Uint8Array(f.content)], { type: f.type ?? 'application/octet-stream' }), f.filename)
  }
  const req = new Request('http://localhost/', { method: 'POST', body: form })
  const payload = Buffer.from(await req.arrayBuffer())
  return { payload, headers: { 'content-type': req.headers.get('content-type') ?? '' } }
}

/** Polls until `fn` returns a truthy value (e.g. for emails sent after the response). */
export async function waitFor<T>(
  fn: () => T | Promise<T>,
  { timeout = 10_000, interval = 15, message = 'condition' }: { timeout?: number; interval?: number; message?: string } = {},
): Promise<NonNullable<T>> {
  const started = Date.now()
  for (;;) {
    const value = await fn()
    if (value) return value as NonNullable<T>
    if (Date.now() - started > timeout) throw new Error(`Timed out after ${timeout} ms waiting for ${message}`)
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/** Standard error envelope returned by every non-2xx response. */
export interface ErrorBody {
  error: { code: string; message: string; details?: { path: string; message: string }[] }
}
