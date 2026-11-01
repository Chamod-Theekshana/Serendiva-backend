import { z } from 'zod'
import { text } from './sanitize'
import { IconName } from './schemas'
import { translatable, translatableOptional } from './i18n'

/**
 * Re-usable building blocks for structured, translatable content.
 * Input schemas (admin writes) and public DTOs (localized reads) live side by side.
 */

// ---------- Item shapes (one locale) ----------

export const FeatureItem = z.object({ icon: IconName, title: z.string().max(160), text: z.string().max(600) })
export const IconTextItem = z.object({ icon: IconName, text: z.string().max(400) })
export const LabelValueItem = z.object({ label: z.string().max(80), value: z.string().max(300) })
export const TerrainItem = z.object({ label: z.string().max(80), place: z.string().max(120), note: z.string().max(400) })
export const OverviewBlock = z.object({
  kicker: z.string().max(80).optional(),
  heading: z.string().max(200),
  quote: z.string().max(800).optional(),
})
export const CaptionBlock = z.object({ title: z.string().max(120).optional(), caption: z.string().max(200).optional() })
export const MapStop = z.object({
  name: z.string().max(120),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const StringList = (max = 20, len = 200) => z.array(z.string().max(len)).max(max)

// ---------- Translatable wrappers (admin input + admin output) ----------

export const TString = (max = 200) => translatable(z.string().min(1).max(max))
export const TStringOpt = (max = 200) => translatableOptional(z.string().max(max))
export const TMarkdown = (max = 50_000) => translatable(z.string().max(max))
export const TMarkdownOpt = (max = 50_000) => translatableOptional(z.string().max(max))
export const TList = <T extends z.ZodType>(item: T, max = 30) => translatable(z.array(item).max(max))
export const TListOpt = <T extends z.ZodType>(item: T, max = 30) => translatableOptional(z.array(item).max(max))
export const TBlockOpt = <T extends z.ZodType>(block: T) => translatableOptional(block)

/** Slug validation (lowercase-kebab-case) */
export const SlugInput = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes, e.g. "cultural-odyssey"')

export const ShortText = text
