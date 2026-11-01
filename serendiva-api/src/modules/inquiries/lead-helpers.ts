import { randomInt } from 'node:crypto'
import type { LeadCounts } from './lead-schemas'

/** Small helpers shared by the lead modules (inquiries, proposals) and their exports. */

/** Reference-like code for honeypot hits, so bots cannot tell they were filtered. */
export function fakeReference(kind: 'inquiry' | 'proposal'): string {
  const year = new Date().getUTCFullYear()
  return `${kind === 'inquiry' ? 'SRD' : 'SRD-C'}-${year}-${String(randomInt(1, 10_000)).padStart(4, '0')}`
}

/** Public website URL for a path, with the locale prefix the Next.js app uses (none for English). */
export function siteUrl(frontendUrl: string, locale: string, path: string): string {
  const base = frontendUrl.replace(/\/$/, '')
  const prefix = locale === 'zh' || locale === 'de' ? `/${locale}` : ''
  return `${base}${prefix}${path}`
}

/** Inclusive YYYY-MM-DD range on createdAt (UTC). */
export function createdAtRange(from?: string, to?: string): { gte?: Date; lt?: Date } | undefined {
  if (!from && !to) return undefined
  const range: { gte?: Date; lt?: Date } = {}
  if (from) range.gte = new Date(`${from}T00:00:00.000Z`)
  if (to) range.lt = new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 86_400_000)
  return range
}

/** "inquiries-2026-10-05.csv" */
export const csvFilename = (prefix: string) => `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`

/**
 * Content-Disposition for a download. Header values must be Latin-1, so non-ASCII names get an
 * ASCII fallback plus the RFC 5987 UTF-8 form that browsers prefer.
 */
export function attachmentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_')
  if (ascii === filename) return `attachment; filename="${ascii}"`
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`
}

export function errorMessage(err: unknown): string {
  return (err instanceof Error ? err.message : String(err)).slice(0, 300)
}

/** One-line preview of a long text for list views. */
export function textPreview(text: string | null, max = 160): string | null {
  if (!text) return null
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

/** Status counts (all statuses present, plus total) from a Prisma groupBy on `status`. */
export function countsFrom(groups: { status: 'new' | 'replied' | 'closed'; _count: { _all: number } }[]): LeadCounts {
  const counts: LeadCounts = { new: 0, replied: 0, closed: 0, total: 0 }
  for (const g of groups) {
    counts[g.status] = g._count._all
    counts.total += g._count._all
  }
  return counts
}
