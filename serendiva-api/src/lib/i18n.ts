import { z } from 'zod'

export const LOCALES = ['en', 'zh', 'de'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export const LocaleSchema = z.enum(LOCALES).default('en').describe('Content language; falls back to English')
export const LocaleQuery = z.object({ locale: LocaleSchema })

/** A translatable value as stored in the database: { en: T, zh?: T, de?: T } */
export type Translatable<T> = { en: T } & Partial<Record<Exclude<Locale, 'en'>, T>>

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  return false
}

/**
 * Pick the value for `locale` from a translatable JSON value, falling back to English.
 * Accepts `unknown` because Prisma returns JSON columns as JsonValue.
 */
export function tr<T = string>(value: unknown, locale: Locale, fallback?: T): T {
  if (!isRecord(value)) return (fallback ?? (value as T)) as T
  const picked = value[locale]
  if (!isEmpty(picked)) return picked as T
  const en = value[DEFAULT_LOCALE]
  if (!isEmpty(en)) return en as T
  return fallback as T
}

/** Like tr() but returns null instead of undefined when nothing is set. */
export function trOrNull<T = string>(value: unknown, locale: Locale): T | null {
  const v = tr<T | undefined>(value, locale, undefined)
  return v === undefined || isEmpty(v) ? null : (v as T)
}

/** Translatable list helper (always returns an array). */
export function trList<T = string>(value: unknown, locale: Locale): T[] {
  const v = tr<T[] | undefined>(value, locale, undefined)
  return Array.isArray(v) ? v : []
}

/** Zod schema for a translatable value with required English. */
export function translatable<T extends z.ZodType>(inner: T) {
  return z.object({ en: inner, zh: inner.optional(), de: inner.optional() })
}

/** Optional translatable value (null allowed). */
export function translatableOptional<T extends z.ZodType>(inner: T) {
  return z.object({ en: inner.optional(), zh: inner.optional(), de: inner.optional() }).nullable().optional()
}

/**
 * Normalize an optional translatable value coming from the admin: drop locales whose value is empty
 * ("" / [] / {} / null) and return null when nothing is left.
 */
export function compactTranslatable<T>(value: Partial<Record<Locale, T>> | null | undefined): Partial<Record<Locale, T>> | null {
  if (!value) return null
  const out: Partial<Record<Locale, T>> = {}
  for (const loc of LOCALES) {
    const v = value[loc]
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && v.trim() === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    if (typeof v === 'object' && !Array.isArray(v) && Object.values(v as object).every((x) => x === undefined || x === null || x === '')) continue
    out[loc] = v
  }
  return Object.keys(out).length ? out : null
}
