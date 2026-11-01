import type { z } from 'zod'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import { compactTranslatable, tr, trOrNull, type Locale } from '@/lib/i18n'
import { toImage } from '@/lib/media-dto'
import { notFound } from '@/lib/errors'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { iso } from '@/lib/dates'
import { Tags } from '@/lib/revalidate'
import { asRecord, asRecordRequired, toAdminMediaRef, translationFlags } from '@/modules/shared/admin-dto'
import { createBlogRepository, type AdminBlogRow, type BlogCardRow, type BlogDetailRow } from './blog.repository'
import { extractHeadings, readingTimeOf } from './blog.headings'
import type { AdminBlogPost, AdminBlogQuery, BlogCard, BlogPostDetail, BlogPostInputT, BlogQuery } from './blog.schemas'

type BlogQueryT = z.infer<typeof BlogQuery>

export function toBlogCard(p: BlogCardRow, locale: Locale): BlogCard {
  const title = tr<string>(p.title, locale, p.slug)
  return {
    id: p.id,
    slug: p.slug,
    title,
    excerpt: tr<string>(p.excerpt, locale, ''),
    category: { slug: p.categorySlug, label: tr<string>(p.category, locale, p.categorySlug) },
    tags: p.tags,
    readingTime: p.readingTime,
    cover: toImage(p.cover, locale, title),
    publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
    isFeatured: p.isFeatured,
    authorName: p.authorName,
  }
}

function searchText(p: BlogCardRow): string {
  const parts: string[] = [p.slug, p.categorySlug, ...p.tags]
  for (const v of [p.title, p.excerpt, p.category]) if (v && typeof v === 'object') parts.push(JSON.stringify(v))
  return parts.join(' ').toLowerCase()
}

function filterPosts(all: BlogCardRow[], q: Omit<BlogQueryT, 'category'> & { category?: string }) {
  let items = all
  if (q.category) items = items.filter((p) => p.categorySlug === q.category)
  if (q.tag) {
    const tag = q.tag.toLowerCase()
    items = items.filter((p) => p.tags.some((t) => t.toLowerCase() === tag))
  }
  if (q.featured !== undefined) items = items.filter((p) => p.isFeatured === q.featured)
  if (q.q) {
    const terms = q.q.toLowerCase().split(/\s+/).filter(Boolean)
    items = items.filter((p) => {
      const hay = searchText(p)
      return terms.every((t) => hay.includes(t))
    })
  }
  return items
}

function toAdmin(p: AdminBlogRow): AdminBlogPost {
  return {
    id: p.id,
    slug: p.slug,
    status: p.status,
    title: asRecordRequired<string>(p.title, ''),
    excerpt: asRecordRequired<string>(p.excerpt, ''),
    content: asRecordRequired<string>(p.content, ''),
    coverId: p.coverId,
    cover: toAdminMediaRef(p.cover),
    categorySlug: p.categorySlug,
    category: asRecordRequired<string>(p.category, p.categorySlug),
    tags: p.tags,
    readingTime: p.readingTime,
    authorName: p.authorName,
    isFeatured: p.isFeatured,
    publishedAt: iso(p.publishedAt),
    seoTitle: asRecord<string>(p.seoTitle),
    seoDescription: asRecord<string>(p.seoDescription),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

/** Trim + de-duplicate tags (case-insensitive), keeping the first spelling. */
function cleanTags(tags: string[]): string[] {
  const seen = new Set<string>()
  return tags.filter((t) => {
    const k = t.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function createBlogService(deps: AppDeps) {
  const repo = createBlogRepository(deps.prisma)
  const revalidate = (...slugs: string[]) =>
    deps.revalidator.revalidate([Tags.blog, ...slugs.map((s) => Tags.blogPost(s)), Tags.sitemap])

  function prepare(input: BlogPostInputT, existingPublishedAt: Date | null) {
    const publishedAt = input.publishedAt
      ? new Date(input.publishedAt)
      : input.status === 'published'
        ? (existingPublishedAt ?? new Date())
        : existingPublishedAt
    return {
      ...input,
      tags: cleanTags(input.tags),
      seoTitle: compactTranslatable(input.seoTitle) as BlogPostInputT['seoTitle'],
      seoDescription: compactTranslatable(input.seoDescription) as BlogPostInputT['seoDescription'],
      readingTime: readingTimeOf(input.content.en),
      publishedAt,
    }
  }

  return {
    // ------------------------------------------------------------ public

    /** Small editorial set: filtering, search and category counts happen in memory. */
    async list(q: BlogQueryT) {
      const all = await repo.listPublished()
      const items = filterPosts(all, q)
      const forFacets = filterPosts(all, { ...q, category: undefined })
      const cats = new Map<string, { slug: string; label: string; count: number }>()
      for (const p of forFacets) {
        const entry = cats.get(p.categorySlug) ?? {
          slug: p.categorySlug,
          label: tr<string>(p.category, q.locale, p.categorySlug),
          count: 0,
        }
        entry.count++
        cats.set(p.categorySlug, entry)
      }
      const { skip, take } = toSkipTake(q)
      return {
        items: items.slice(skip, skip + take).map((p) => toBlogCard(p, q.locale)),
        meta: pageMeta(q, items.length),
        categories: [...cats.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
      }
    },

    async detail(slug: string, locale: Locale): Promise<BlogPostDetail> {
      const p: BlogDetailRow | null = await repo.findPublishedBySlug(slug)
      if (!p) throw notFound('Blog post')
      const all = await repo.listPublished()
      const others = all.filter((o) => o.id !== p.id)
      const related = [...others.filter((o) => o.categorySlug === p.categorySlug), ...others]
      const relatedUnique = [...new Map(related.map((o) => [o.id, o])).values()].slice(0, 3)

      const card = toBlogCard(p, locale)
      const content = tr<string>(p.content, locale, '')
      return {
        ...card,
        content,
        headings: extractHeadings(content),
        related: relatedUnique.map((o) => toBlogCard(o, locale)),
        seo: {
          title: trOrNull<string>(p.seoTitle, locale) ?? card.title,
          description: trOrNull<string>(p.seoDescription, locale) ?? card.excerpt.slice(0, 160),
          image: card.cover,
        },
        updatedAt: p.updatedAt.toISOString(),
      }
    },

    // ------------------------------------------------------------ admin

    async adminList(q: z.infer<typeof AdminBlogQuery>) {
      const where: Prisma.BlogPostWhereInput = {
        ...(q.status ? { status: q.status } : {}),
        ...(q.category ? { categorySlug: q.category } : {}),
        ...(q.q
          ? {
              OR: [
                { slug: { contains: q.q.toLowerCase() } },
                { title: { path: ['en'], string_contains: q.q } },
              ],
            }
          : {}),
      }
      const { skip, take } = toSkipTake(q)
      const [rows, total] = await repo.adminList(where, skip, take)
      return {
        items: rows.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: tr<string>(p.title, 'en', p.slug),
          status: p.status,
          categorySlug: p.categorySlug,
          categoryLabel: tr<string>(p.category, 'en', p.categorySlug),
          isFeatured: p.isFeatured,
          cover: toAdminMediaRef(p.cover),
          readingTime: p.readingTime,
          translations: translationFlags(p.title),
          publishedAt: iso(p.publishedAt),
          updatedAt: p.updatedAt.toISOString(),
        })),
        meta: pageMeta(q, total),
      }
    },

    async adminGet(id: string): Promise<AdminBlogPost> {
      const p = await repo.adminFindById(id)
      if (!p) throw notFound('Blog post')
      return toAdmin(p)
    },

    async create(input: BlogPostInputT): Promise<AdminBlogPost> {
      await repo.assertMedia(input.coverId)
      const { id } = await repo.create(prepare(input, null))
      revalidate(input.slug)
      return this.adminGet(id)
    },

    async update(id: string, input: BlogPostInputT): Promise<AdminBlogPost> {
      const existing = await repo.findState(id)
      if (!existing) throw notFound('Blog post')
      await repo.assertMedia(input.coverId)
      await repo.update(id, prepare(input, existing.publishedAt))
      revalidate(existing.slug, input.slug)
      return this.adminGet(id)
    },

    async setStatus(id: string, status: 'draft' | 'published'): Promise<AdminBlogPost> {
      const existing = await repo.findState(id)
      if (!existing) throw notFound('Blog post')
      const publishedAt = status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt
      await repo.setStatus(id, status, publishedAt)
      revalidate(existing.slug)
      return this.adminGet(id)
    },

    async remove(id: string) {
      const existing = await repo.findState(id)
      if (!existing) throw notFound('Blog post')
      await repo.delete(id)
      revalidate(existing.slug)
    },
  }
}
