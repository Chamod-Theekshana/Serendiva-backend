/** Minimal RFC 4180 CSV writer (no dependency). Guards against spreadsheet formula injection. */
export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined | Date)[][]): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    let s = value instanceof Date ? value.toISOString() : String(value)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))]
  // BOM so Excel opens UTF-8 correctly (names like "Zürich", "中文")
  return '\uFEFF' + lines.join('\r\n') + '\r\n'
}
