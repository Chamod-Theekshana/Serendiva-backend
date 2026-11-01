import { z } from 'zod'
import { IconName, ImageSchema } from '@/lib/schemas'
import { LocaleSchema } from '@/lib/i18n'
import { SlugInput, TString, TStringOpt } from '@/lib/content-schemas'
import { AdminMediaRef } from '@/modules/shared/admin-dto'

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const CategoriesQuery = z.object({ locale: LocaleSchema })

export const CategorySchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string().meta({ example: 'Cultural & Ancient Kingdoms' }),
    shortName: z.string().describe('Short label for filter chips (falls back to name)'),
    kicker: z.string().nullable().meta({ example: 'Heritage & Monasteries' }),
    description: z.string().nullable(),
    icon: z.string().nullable().describe('Material Symbols icon name'),
    image: ImageSchema.nullable(),
    tourCount: z.number().int().describe('Number of published tours in this category'),
  })
  .meta({ id: 'Category' })

export const CategoryListSchema = z.array(CategorySchema).meta({ id: 'CategoryList' })

export type CategoryDto = z.infer<typeof CategorySchema>

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const CategoryInput = z
  .object({
    slug: SlugInput,
    name: TString(120),
    shortName: TStringOpt(60),
    kicker: TStringOpt(80),
    description: TStringOpt(500),
    icon: IconName.nullable().default(null),
    imageId: z.string().min(1).nullable().default(null),
    order: z.number().int().min(0).default(0),
  })
  .meta({ id: 'CategoryWrite' })

export type CategoryInputT = z.infer<typeof CategoryInput>

const TRecord = z.record(z.string(), z.string())

export const AdminCategorySchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: TRecord,
    shortName: TRecord.nullable(),
    kicker: TRecord.nullable(),
    description: TRecord.nullable(),
    icon: z.string().nullable(),
    imageId: z.string().nullable(),
    image: AdminMediaRef.nullable(),
    order: z.number().int(),
    tourCount: z.number().int().describe('Tours (any status) linked to this category'),
    translations: z.object({ zh: z.boolean(), de: z.boolean() }),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminCategory' })

export const AdminCategoryListSchema = z.array(AdminCategorySchema).meta({ id: 'AdminCategoryList' })

export type AdminCategory = z.infer<typeof AdminCategorySchema>
