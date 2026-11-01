import { z } from 'zod'
import { ImageSchema } from '@/lib/schemas'
import { LocaleSchema } from '@/lib/i18n'
import { PageMetaSchema } from '@/lib/pagination'
import { SlugInput, TMarkdown, TString, TStringOpt } from '@/lib/content-schemas'
import { SeoSchema } from '@/modules/shared/public-dto'
import { AdminMediaRef } from '@/modules/shared/admin-dto'

const boolQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === 'true'))

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const BlogQuery = z.object({
  locale: LocaleSchema,
  category: z.string().max(100).optional().describe('Category slug, e.g. "cultural-insider"'),
  tag: z.string().trim().max(60).optional().describe('Tag (case-insensitive)'),
  q: z.string().trim().max(100).optional().describe('Free-text search (title, excerpt, tags, category)'),
  featured: boolQuery,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

export const BlogCategoryRefSchema = z
  .object({ slug: z.string(), label: z.string() })
  .meta({ id: 'BlogCategoryRef' })

export const BlogCardSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    excerpt: z.string(),
    category: BlogCategoryRefSchema,
    tags: z.array(z.string()),
    readingTime: z.number().int().describe('Minutes'),
    cover: ImageSchema.nullable(),
    publishedAt: z.string(),
    isFeatured: z.boolean(),
    authorName: z.string(),
  })
  .meta({ id: 'BlogCard' })

export type BlogCard = z.infer<typeof BlogCardSchema>

export const BlogListSchema = z
  .object({
    items: z.array(BlogCardSchema),
    meta: PageMetaSchema,
    categories: z
      .array(BlogCategoryRefSchema.extend({ count: z.number().int() }))
      .describe('Category chips with counts for the current search (ignores the category filter)'),
  })
  .meta({ id: 'BlogList' })

export const BlogHeadingSchema = z
  .object({
    id: z.string().describe('Anchor id — github-slugger / rehype-slug compatible'),
    text: z.string(),
    level: z.union([z.literal(2), z.literal(3)]),
  })
  .meta({ id: 'BlogHeading' })

export const BlogPostDetailSchema = BlogCardSchema.extend({
  content: z.string().describe('Markdown'),
  headings: z.array(BlogHeadingSchema).describe('## and ### headings for the table of contents'),
  related: z.array(BlogCardSchema),
  seo: SeoSchema,
  updatedAt: z.string(),
}).meta({ id: 'BlogPostDetail' })

export type BlogPostDetail = z.infer<typeof BlogPostDetailSchema>

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const BlogPostInput = z
  .object({
    slug: SlugInput,
    status: z.enum(['draft', 'published']).default('draft'),
    title: TString(200),
    excerpt: TString(600),
    content: TMarkdown(100_000),
    coverId: z.string().min(1).nullable().default(null),
    categorySlug: SlugInput.describe('Used for filtering, e.g. "cultural-insider"'),
    category: TString(80).describe('Category label, e.g. { en: "Cultural Insider" }'),
    tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
    authorName: z.string().trim().min(1).max(120).default('Dinesh Jayasuriya'),
    isFeatured: z.boolean().default(false),
    publishedAt: z.iso
      .datetime({ offset: true })
      .nullable()
      .optional()
      .describe('Leave empty to set it automatically on first publish'),
    seoTitle: TStringOpt(70),
    seoDescription: TStringOpt(170),
  })
  .meta({ id: 'BlogPostWrite' })

export type BlogPostInputT = z.infer<typeof BlogPostInput>

export const AdminBlogQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
  category: z.string().max(100).optional().describe('Category slug'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export const AdminBlogListItem = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    status: z.enum(['draft', 'published']),
    categorySlug: z.string(),
    categoryLabel: z.string(),
    isFeatured: z.boolean(),
    cover: AdminMediaRef.nullable(),
    readingTime: z.number().int(),
    translations: z.object({ zh: z.boolean(), de: z.boolean() }),
    publishedAt: z.string().nullable(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminBlogListItem' })

export const AdminBlogList = z
  .object({ items: z.array(AdminBlogListItem), meta: PageMetaSchema })
  .meta({ id: 'AdminBlogList' })

const TRecord = z.record(z.string(), z.string())

export const AdminBlogPostSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    status: z.enum(['draft', 'published']),
    title: TRecord,
    excerpt: TRecord,
    content: TRecord,
    coverId: z.string().nullable(),
    cover: AdminMediaRef.nullable(),
    categorySlug: z.string(),
    category: TRecord,
    tags: z.array(z.string()),
    readingTime: z.number().int(),
    authorName: z.string(),
    isFeatured: z.boolean(),
    publishedAt: z.string().nullable(),
    seoTitle: TRecord.nullable(),
    seoDescription: TRecord.nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'AdminBlogPost' })

export type AdminBlogPost = z.infer<typeof AdminBlogPostSchema>
