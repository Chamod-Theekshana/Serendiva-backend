import { z } from 'zod'

/**
 * Remove HTML tags and control characters from plain-text user input and collapse whitespace
 * inside single-line fields. Markdown/multi-line fields keep their line breaks.
 */
export function cleanText(input: string, opts: { multiline?: boolean } = {}): string {
  let s = input.replace(/<[^>]*>/g, '')
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  if (opts.multiline) {
    s = s.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n')
    return s.trim()
  }
  return s.replace(/\s+/g, ' ').trim()
}

/** Plain single-line text field: trimmed, tags stripped. */
export const text = (max = 200) =>
  z
    .string()
    .max(max * 2)
    .transform((v) => cleanText(v))
    .pipe(z.string().max(max))

/** Plain multi-line text field. */
export const longText = (max = 5000) =>
  z
    .string()
    .max(max * 2)
    .transform((v) => cleanText(v, { multiline: true }))
    .pipe(z.string().max(max))
