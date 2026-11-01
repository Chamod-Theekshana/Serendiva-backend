/**
 * Availability calendar — busy / available ranges over the next nine months, relative to the day the
 * seed runs (so the calendar always looks current). Notes are private (never exposed publicly).
 *
 * PLACEHOLDER SAMPLE CONTENT — the guide replaces these with his real calendar in the admin panel.
 */
import type { SeedAvailability } from './types'

export const availability: SeedAvailability[] = [
  { startInDays: 4, days: 12, type: 'busy', note: 'Sample: private couple — The Cultural Odyssey' },
  { startInDays: 20, days: 9, type: 'busy', note: 'Sample: family of five — tea country & south coast' },
  { startInDays: 31, days: 12, type: 'available', note: 'Sample: open window before the festive season' },
  { startInDays: 46, days: 14, type: 'busy', note: 'Sample: festive season — Grand Ceylon Odyssey' },
  { startInDays: 64, days: 10, type: 'busy', note: 'Sample: honeymoon couple' },
  { startInDays: 82, days: 11, type: 'busy', note: 'Sample: wildlife photographers — Yala & Wilpattu' },
  { startInDays: 98, days: 18, type: 'available', note: 'Sample: open for new inquiries' },
  { startInDays: 121, days: 8, type: 'busy', note: 'Sample: corporate retreat (8 executives)' },
  { startInDays: 138, days: 13, type: 'busy', note: 'Sample: multi-generational family' },
  { startInDays: 158, days: 9, type: 'busy', note: 'Sample: Ramayana trail group' },
  { startInDays: 172, days: 21, type: 'available', note: 'Sample: east-coast season — open' },
  { startInDays: 199, days: 12, type: 'busy', note: 'Sample: Esala Perahera — Kandy & Minneriya' },
  { startInDays: 222, days: 10, type: 'busy', note: 'Sample: solo traveller — highland trekking' },
  { startInDays: 245, days: 14, type: 'busy', note: 'Sample: annual leave / fleet maintenance' },
]
