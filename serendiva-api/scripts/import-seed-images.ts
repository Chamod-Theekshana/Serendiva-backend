/**
 * Imports the remote seed images into the configured storage.
 *
 * The seed creates Media rows that point at remote images (design-export URLs, keys "seed/..."), with no
 * variants. This script downloads each one, converts it like an upload (WebP original + thumb/medium/large
 * variants + blur placeholder), stores it under "media/seed/<name>..." and updates the Media row in place,
 * so every reference to the media id keeps working.
 *
 * PowerShell:
 *   npm run media:import-seed
 *   npm run media:import-seed -- --dry-run      (only lists what would be imported)
 *
 * Safe to run again: rows whose URL already points at the configured storage are skipped.
 */
import type { FastifyBaseLogger } from 'fastify'
import { loadEnv } from '@/config/env'
import { createPrisma } from '@/lib/prisma'
import { createStorage } from '@/lib/storage'
import { IMAGE_MIME, processImage, sniffMime } from '@/lib/image'
import { jsonValue } from '@/lib/json'
import { createRevalidator, Tags } from '@/lib/revalidate'
import { slugify } from '@/lib/slug'
import { deleteStoredKeys, storageKeysOf, storeProcessedImage } from '@/modules/media/media.files'

const MAX_BYTES = 15 * 1024 * 1024
const TIMEOUT_MS = 30_000
const CONCURRENCY = 4

// `npm run x --dry-run` (without "--") reaches the script as npm_config_dry_run instead of an argument.
const dryRun = process.argv.includes('--dry-run') || process.env.npm_config_dry_run === 'true'

/** Errors that a retry cannot fix (wrong content, too large). */
class PermanentError extends Error {}

/** Console-backed logger with the shape the revalidator expects. */
function consoleLogger(): FastifyBaseLogger {
  const fmt = (args: unknown[]) =>
    args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).reverse().join(' ')
  const logger: FastifyBaseLogger = {
    level: 'info',
    fatal: (...a: unknown[]) => console.error(fmt(a)),
    error: (...a: unknown[]) => console.error(fmt(a)),
    warn: (...a: unknown[]) => console.warn(fmt(a)),
    info: (...a: unknown[]) => console.info(fmt(a)),
    debug: () => {},
    trace: () => {},
    silent: () => {},
    child: () => logger,
  }
  return logger
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'serendiva-media-import/1.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const declared = Number(res.headers.get('content-length') ?? 0)
  if (declared > MAX_BYTES) throw new PermanentError(`larger than ${MAX_BYTES / 1024 / 1024} MB`)
  if (!res.body) throw new Error('empty response')

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BYTES) {
      await reader.cancel()
      throw new PermanentError(`larger than ${MAX_BYTES / 1024 / 1024} MB`)
    }
    chunks.push(value)
  }
  const buf = Buffer.concat(chunks)
  const mime = sniffMime(buf)
  if (!mime || !IMAGE_MIME.includes(mime)) {
    throw new PermanentError(`not an image (detected: ${mime ?? 'unknown'}, content-type: ${res.headers.get('content-type') ?? '-'})`)
  }
  return buf
}

async function downloadWithRetry(url: string): Promise<Buffer> {
  try {
    return await download(url)
  } catch (err) {
    if (err instanceof PermanentError) throw err
    await new Promise((r) => setTimeout(r, 1500))
    return download(url)
  }
}

/** "seed/tours/Cultural Odyssey.jpg" -> "tours-cultural-odyssey" */
function seedName(key: string, id: string): string {
  const path = key.replace(/^seed\//, '').replace(/\.[a-z0-9]{1,5}$/i, '')
  return slugify(path.replace(/[\\/]+/g, '-')) || id
}

async function runPool<T>(items: T[], size: number, worker: (item: T) => Promise<void>) {
  let next = 0
  const lanes = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++]!
      await worker(item)
    }
  })
  await Promise.all(lanes)
}

const env = loadEnv()
const prisma = createPrisma(env.DATABASE_URL)
const storage = createStorage(env)
const storagePrefix = storage.urlFor('')

try {
  const rows = await prisma.media.findMany({
    where: { url: { startsWith: 'http' }, NOT: { url: { startsWith: storagePrefix } } },
    select: { id: true, key: true, url: true },
    orderBy: { createdAt: 'asc' },
  })

  console.info(`Storage: ${storage.name} (${storagePrefix})`)
  console.info(`${rows.length} remote image(s) to import${dryRun ? ' — dry run, nothing will be changed' : ''}\n`)

  // Unique target names inside this run and against existing keys.
  const taken = new Set(
    (await prisma.media.findMany({ where: { key: { startsWith: 'media/seed/' } }, select: { key: true } })).map((m) => m.key),
  )
  const plan = rows.map((row) => {
    let base = `media/seed/${seedName(row.key, row.id)}`
    if (taken.has(`${base}.webp`)) base = `${base}-${row.id.slice(-8)}`
    taken.add(`${base}.webp`)
    return { ...row, base }
  })

  if (dryRun) {
    for (const p of plan) console.info(`  ${p.id}  ${p.url}\n      -> ${p.base}.webp (+ -thumb/-medium/-large)`)
  } else {
    let done = 0
    const failures: { id: string; url: string; error: string }[] = []

    await runPool(plan, CONCURRENCY, async (p) => {
      const n = () => `[${++done}/${plan.length}]`
      try {
        const buf = await downloadWithRetry(p.url)
        let img
        try {
          img = await processImage(buf)
        } catch {
          throw new PermanentError('image could not be decoded')
        }
        const stored = await storeProcessedImage(storage, p.base, img)
        try {
          await prisma.media.update({
            where: { id: p.id },
            data: {
              url: stored.url,
              key: stored.key,
              mime: stored.mime,
              size: stored.size,
              width: stored.width,
              height: stored.height,
              variants: jsonValue(stored.variants),
              blurDataUrl: stored.blurDataUrl,
            },
          })
        } catch (err) {
          await deleteStoredKeys(storage, storageKeysOf(stored))
          throw err
        }
        console.info(`${n()} ok    ${p.id}  ${stored.width}x${stored.height}  ${stored.key}`)
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        failures.push({ id: p.id, url: p.url, error })
        console.warn(`${n()} FAIL  ${p.id}  ${p.url}\n        ${error}`)
      }
    })

    const imported = plan.length - failures.length
    console.info(`\nSummary: ${imported} imported, ${failures.length} failed, ${plan.length} total.`)
    if (failures.length) {
      console.info('Failed rows keep their remote URL; fix the cause and run the script again.')
      process.exitCode = 1
    }

    if (imported > 0) {
      const [tours, destinations, posts] = await Promise.all([
        prisma.tour.findMany({ select: { slug: true } }),
        prisma.destination.findMany({ select: { slug: true } }),
        prisma.blogPost.findMany({ select: { slug: true } }),
      ])
      const tags = [
        ...Object.values(Tags).flatMap((t) => (typeof t === 'string' ? [t] : [])),
        ...tours.map((t) => Tags.tour(t.slug)),
        ...destinations.map((d) => Tags.destination(d.slug)),
        ...posts.map((b) => Tags.blogPost(b.slug)),
      ]
      const revalidator = createRevalidator({
        frontendUrl: env.FRONTEND_URL,
        secret: env.REVALIDATE_SECRET,
        disabled: env.REVALIDATE_DISABLED,
        log: consoleLogger(),
      })
      const ok = await revalidator.revalidateNow(tags)
      console.info(
        env.REVALIDATE_DISABLED
          ? 'Revalidation is disabled (REVALIDATE_DISABLED=true).'
          : ok
            ? `Frontend revalidated (${tags.length} tags).`
            : 'Frontend revalidation failed (is the website running?) — pages refresh on their next revalidate interval.',
      )
    }
  }
} finally {
  await prisma.$disconnect()
}
