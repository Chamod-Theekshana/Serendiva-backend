export const iso = (d: Date | null | undefined): string | null => (d ? d.toISOString() : null)
export const isoDate = (d: Date | null | undefined): string | null => (d ? d.toISOString().slice(0, 10) : null)

/** Parse YYYY-MM-DD into a UTC Date at midnight */
export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}
