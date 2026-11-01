import { z } from 'zod'
import { tr } from '@/lib/i18n'

/** Compact media preview used inside admin payloads (editor thumbnails). */
export const AdminMediaRef = z
  .object({ id: z.string(), url: z.string(), thumbUrl: z.string().nullable(), alt: z.string() })
  .meta({ id: 'AdminMediaRef' })

export type AdminMediaRefT = z.infer<typeof AdminMediaRef>

export function toAdminMediaRef(
  m: { id: string; url: string; variants: unknown; altText: unknown } | null | undefined,
): AdminMediaRefT | null {
  if (!m) return null
  const variants = (m.variants ?? {}) as { thumb?: { url?: string } }
  return { id: m.id, url: m.url, thumbUrl: variants.thumb?.url ?? null, alt: tr<string>(m.altText, 'en', '') ?? '' }
}

export const adminMediaSelect = { id: true, url: true, variants: true, altText: true } as const

/** Which optional locales have a value for the (required) title-like field */
export function translationFlags(value: unknown): { zh: boolean; de: boolean } {
  const v = (value ?? {}) as Record<string, unknown>
  const has = (k: string) => typeof v[k] === 'string' ? (v[k] as string).trim() !== '' : v[k] != null
  return { zh: has('zh'), de: has('de') }
}

/** Cast a JSON column to the record shape used by admin schemas (null stays null). */
export function asRecord<T>(value: unknown): Record<string, T> | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object' || Array.isArray(value)) return null
  // Drop empty locales so the editor shows them as "not translated"
  const out: Record<string, T> = {}
  for (const [k, v] of Object.entries(value as Record<string, T>)) if (v !== undefined && v !== null) out[k] = v
  return out
}

export function asRecordRequired<T>(value: unknown, fallback: T): Record<string, T> {
  return asRecord<T>(value) ?? { en: fallback }
}
