import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { jsonValue as J, optJson as O } from '@/lib/json'
import { mediaSelect } from '@/lib/media-dto'
import { adminMediaSelect } from '@/modules/shared/admin-dto'
import { assertMediaExist } from '@/modules/shared/media-lookup'
import type { CategoryInputT } from './categories.schemas'

export const publicCategoryInclude = {
  image: { select: mediaSelect },
  _count: { select: { tours: { where: { tour: { status: 'published' } } } } },
} satisfies Prisma.CategoryInclude

export type PublicCategoryRow = Prisma.CategoryGetPayload<{ include: typeof publicCategoryInclude }>

export const adminCategoryInclude = {
  image: { select: adminMediaSelect },
  _count: { select: { tours: true } },
} satisfies Prisma.CategoryInclude

export type AdminCategoryRow = Prisma.CategoryGetPayload<{ include: typeof adminCategoryInclude }>

const ORDER = [{ order: 'asc' }, { createdAt: 'asc' }] satisfies Prisma.CategoryOrderByWithRelationInput[]

function data(input: CategoryInputT) {
  return {
    slug: input.slug,
    name: J(input.name),
    shortName: O(input.shortName),
    kicker: O(input.kicker),
    description: O(input.description),
    icon: input.icon,
    imageId: input.imageId,
    order: input.order,
  }
}

export function createCategoriesRepository(prisma: PrismaClient) {
  return {
    listPublic: () => prisma.category.findMany({ include: publicCategoryInclude, orderBy: ORDER }),

    adminList: () => prisma.category.findMany({ include: adminCategoryInclude, orderBy: ORDER }),

    adminFindById: (id: string) => prisma.category.findUnique({ where: { id }, include: adminCategoryInclude }),

    exists: (id: string) => prisma.category.findUnique({ where: { id }, select: { id: true } }),

    assertMedia: (imageId: string | null) => assertMediaExist(prisma, [{ path: 'imageId', id: imageId }]),

    create: (input: CategoryInputT) =>
      prisma.category.create({ data: data(input), include: adminCategoryInclude }),

    update: (id: string, input: CategoryInputT) =>
      prisma.category.update({ where: { id }, data: data(input), include: adminCategoryInclude }),

    reorder: (items: { id: string; order: number }[]) =>
      prisma.$transaction(items.map((i) => prisma.category.update({ where: { id: i.id }, data: { order: i.order } }))),

    delete: (id: string) => prisma.category.delete({ where: { id }, select: { id: true } }),
  }
}
