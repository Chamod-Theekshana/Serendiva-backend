/**
 * Table-of-contents helpers for blog markdown.
 *
 * Heading ids follow the GitHub / `github-slugger` algorithm (the one used by `rehype-slug`), so a
 * frontend that renders the markdown with rehype-slug (or calls github-slugger on the heading text)
 * produces exactly the same anchors. Keep `headingSlug` and the duplicate handling in sync with it.
 */

export interface BlogHeading {
  id: string
  text: string
  level: 2 | 3
}

/** github-slugger `slug()`: lowercase, drop everything except letters, marks, numbers, "_", "-" and spaces; spaces become "-". */
export function headingSlug(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-')
}

/** github-slugger `BananaSlug`: repeated slugs get "-1", "-2", ... appended. */
export function createSlugger() {
  const occurrences = new Map<string, number>()
  return (text: string): string => {
    const original = headingSlug(text)
    let result = original
    while (occurrences.has(result)) {
      const n = (occurrences.get(original) ?? 0) + 1
      occurrences.set(original, n)
      result = `${original}-${n}`
    }
    occurrences.set(result, 0)
    return result
  }
}

/** Visible text of an inline-markdown heading (what the rendered <h2>/<h3> contains). */
export function headingText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images render no text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url)
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1') // [text][ref]
    .replace(/`+([^`]*)`+/g, '$1') // inline code
    .replace(/<[^>]+>/g, '') // inline html tags
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // strong
    .replace(/~~(.+?)~~/g, '$1') // strikethrough
    .replace(/\*(.+?)\*/g, '$1') // emphasis (*)
    .replace(/(^|[^\p{L}\p{N}])_(.+?)_(?=[^\p{L}\p{N}]|$)/gu, '$1$2') // emphasis (_), not intra-word
    .replace(/\\([!-/:-@[-`{-~])/g, '$1') // backslash escapes
    .trim()
}

/**
 * ATX headings (`## Title`, `### Title`) outside fenced code blocks. Every heading level is run
 * through the slugger (as rehype-slug does) so duplicate numbering matches, but only levels 2–3
 * are returned for the table of contents.
 */
export function extractHeadings(markdown: string): BlogHeading[] {
  const slug = createSlugger()
  const out: BlogHeading[] = []
  let fence: string | null = null

  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line)
    if (fenceMatch) {
      const marker = fenceMatch[1]!
      if (fence === null) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null
      continue
    }
    if (fence !== null) continue

    const m = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/.exec(line)
    if (!m) continue
    const raw = (m[2] ?? '').replace(/(^|[ \t]+)#+$/, '').trim()
    const text = headingText(raw)
    const id = slug(text)
    const level = m[1]!.length
    if ((level === 2 || level === 3) && text) out.push({ id, text, level })
  }
  return out
}

/** Reading time in minutes at ~200 words per minute (minimum 1). */
export function readingTimeOf(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~[\]()!-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
