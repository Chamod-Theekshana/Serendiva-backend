import type { AppDeps } from '@/types'
import { compactTranslatable, tr, trOrNull, type Locale } from '@/lib/i18n'
import { toImage } from '@/lib/media-dto'
import { notFound } from '@/lib/errors'
import { Tags } from '@/lib/revalidate'
import { asRecord, asRecordRequired, toAdminMediaRef, translationFlags } from '@/modules/shared/admin-dto'
import { createCategoriesRepository, type AdminCategoryRow, type PublicCategoryRow } from './categories.repository'
import type { AdminCategory, CategoryDto, CategoryInputT } from './categories.schemas'

export function toCategory(c: PublicCategoryRow, locale: Locale): CategoryDto {
  const name = tr<string>(c.name, locale, c.slug)
  return {
    id: c.id,
    slug: c.slug,
    name,
    shortName: trOrNull<string>(c.shortName, locale) ?? name,
    kicker: trOrNull<string>(c.kicker, locale),
    description: trOrNull<string>(c.description, locale),
    icon: c.icon,
    image: toImage(c.image, locale, name),
    tourCount: c._count.tours,
  }
}

function toAdmin(c: AdminCategoryRow): AdminCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: asRecordRequired<string>(c.name, ''),
    shortName: asRecord<string>(c.shortName),
    kicker: asRecord<string>(c.kicker),
    description: asRecord<string>(c.description),
    icon: c.icon,
    imageId: c.imageId,
    image: toAdminMediaRef(c.image),
    order: c.order,
    tourCount: c._count.tours,
    translations: translationFlags(c.name),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

function normalize(input: CategoryInputT): CategoryInputT {
  return {
    ...input,
    shortName: compactTranslatable(input.shortName) as CategoryInputT['shortName'],
    kicker: compactTranslatable(input.kicker) as CategoryInputT['kicker'],
    description: compactTranslatable(input.description) as CategoryInputT['description'],
  }
}

export function createCategoriesService(deps: AppDeps) {
  const repo = createCategoriesRepository(deps.prisma)
  // Tour cards and filter chips embed category names, so tour pages are refreshed too.
  const revalidate = () => deps.revalidator.revalidate([Tags.categories, Tags.tours])

  return {
    async list(locale: Locale): Promise<CategoryDto[]> {
      const rows = await repo.listPublic()
      return rows.map((c) => toCategory(c, locale))
    },

    async adminList(): Promise<AdminCategory[]> {
      return (await repo.adminList()).map(toAdmin)
    },

    async adminGet(id: string): Promise<AdminCategory> {
      const c = await repo.adminFindById(id)
      if (!c) throw notFound('Category')
      return toAdmin(c)
    },

    async create(input: CategoryInputT): Promise<AdminCategory> {
      await repo.assertMedia(input.imageId)
      const c = await repo.create(normalize(input))
      revalidate()
      return toAdmin(c)
    },

    async update(id: string, input: CategoryInputT): Promise<AdminCategory> {
      if (!(await repo.exists(id))) throw notFound('Category')
      await repo.assertMedia(input.imageId)
      const c = await repo.update(id, normalize(input))
      revalidate()
      return toAdmin(c)
    },

    async reorder(items: { id: string; order: number }[]) {
      await repo.reorder(items)
      revalidate()
    },

    async remove(id: string) {
      if (!(await repo.exists(id))) throw notFound('Category')
      await repo.delete(id)
      revalidate()
    },
  }
}
