import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { jsonValue as J, optJson as O } from '@/lib/json'
import { mediaSelect } from '@/lib/media-dto'
import { adminMediaSelect } from '@/modules/shared/admin-dto'
import { assertMediaExist } from '@/modules/shared/media-lookup'
import type { BlogPostInputT } from './blog.schemas'

const NEWEST = [
  { publishedAt: { sort: 'desc', nulls: 'last' } },
  { createdAt: 'desc' },
] satisfies Prisma.BlogPostOrderByWithRelationInput[]

export const blogCardInclude = { cover: { select: mediaSelect } } satisfies Prisma.BlogPostInclude

/** Cards never need the (large) markdown bodies. */
const cardOmit = { content: true } satisfies Prisma.BlogPostOmit

export type BlogCardRow = Prisma.BlogPostGetPayload<{ include: typeof blogCardInclude; omit: typeof cardOmit }>
export type BlogDetailRow = Prisma.BlogPostGetPayload<{ include: typeof blogCardInclude }>

const adminBlogInclude = { cover: { select: adminMediaSelect } } satisfies Prisma.BlogPostInclude
export type AdminBlogRow = Prisma.BlogPostGetPayload<{ include: typeof adminBlogInclude }>

export type BlogWriteData = Omit<BlogPostInputT, 'publishedAt'> & { readingTime: number; publishedAt: Date | null }

function data(input: BlogWriteData) {
  return {
    slug: input.slug,
    status: input.status,
    title: J(input.title),
    excerpt: J(input.excerpt),
    content: J(input.content),
    coverId: input.coverId,
    categorySlug: input.categorySlug,
    category: J(input.category),
    tags: input.tags,
    readingTime: input.readingTime,
    authorName: input.authorName,
    isFeatured: input.isFeatured,
    publishedAt: input.publishedAt,
    seoTitle: O(input.seoTitle),
    seoDescription: O(input.seoDescription),
  }
}

export function createBlogRepository(prisma: PrismaClient) {
  return {
    assertMedia: (coverId: string | null) => assertMediaExist(prisma, [{ path: 'coverId', id: coverId }]),

    // ---------- public ----------
    listPublished: () =>
      prisma.blogPost.findMany({ where: { status: 'published' }, include: blogCardInclude, omit: cardOmit, orderBy: NEWEST }),

    findPublishedBySlug: (slug: string) =>
      prisma.blogPost.findFirst({ where: { slug, status: 'published' }, include: blogCardInclude }),

    // ---------- admin ----------
    adminList: (where: Prisma.BlogPostWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.blogPost.findMany({
          where,
          include: adminBlogInclude,
          omit: cardOmit,
          orderBy: [{ updatedAt: 'desc' }],
          skip,
          take,
        }),
        prisma.blogPost.count({ where }),
      ]),

    adminFindById: (id: string) =>
      prisma.blogPost.findUnique({ where: { id }, include: adminBlogInclude }),

    findState: (id: string) => prisma.blogPost.findUnique({ where: { id }, select: { slug: true, publishedAt: true } }),

    create: (input: BlogWriteData) => prisma.blogPost.create({ data: data(input), select: { id: true } }),

    update: (id: string, input: BlogWriteData) =>
      prisma.blogPost.update({ where: { id }, data: data(input), select: { id: true } }),

    setStatus: (id: string, status: 'draft' | 'published', publishedAt: Date | null) =>
      prisma.blogPost.update({ where: { id }, data: { status, publishedAt }, select: { id: true } }),

    delete: (id: string) => prisma.blogPost.delete({ where: { id }, select: { slug: true } }),
  }
}
