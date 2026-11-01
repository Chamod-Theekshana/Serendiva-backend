/**
 * Defensive readers for values that come out of JSON columns (already localized with tr()).
 * Public DTOs are built with these so a slightly malformed stored block degrades to empty
 * values instead of failing response validation.
 */

export type JsonObj = Record<string, unknown>

export const asObj = (v: unknown): JsonObj | null =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as JsonObj) : null

export const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)

export const strOrNull = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)

export const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []

export const objList = (v: unknown): JsonObj[] =>
  Array.isArray(v) ? v.map(asObj).filter((x): x is JsonObj => x !== null) : []

export const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/** A `{ title?, caption? }` caption block; a plain string is treated as the caption. */
export function captionOf(v: unknown): { title: string | null; caption: string | null } {
  if (typeof v === 'string') return { title: null, caption: strOrNull(v) }
  const o = asObj(v)
  return { title: strOrNull(o?.title), caption: strOrNull(o?.caption) }
}

/** `[{ name, lat, lng }]` map points; invalid entries are skipped. */
export function mapPointsOf(v: unknown): { name: string; lat: number; lng: number }[] {
  return objList(v).flatMap((p) => {
    const lat = num(p.lat)
    const lng = num(p.lng)
    return lat === null || lng === null ? [] : [{ name: str(p.name), lat, lng }]
  })
}

/**
 * Admin form value of a translatable caption block: `{ [locale]: { title?, caption? } }` or null.
 * Older/plain-string captions are converted so the editor always gets the same shape.
 */
export function captionRecordOf(value: unknown): Record<string, { title?: string; caption?: string }> | null {
  const rec = asObj(value)
  if (!rec) return null
  const out: Record<string, { title?: string; caption?: string }> = {}
  for (const [loc, v] of Object.entries(rec)) {
    if (v === null || v === undefined) continue
    const c = captionOf(v)
    out[loc] = { ...(c.title ? { title: c.title } : {}), ...(c.caption ? { caption: c.caption } : {}) }
  }
  return out
}
