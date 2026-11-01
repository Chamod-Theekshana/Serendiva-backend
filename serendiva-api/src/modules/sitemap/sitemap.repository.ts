import type { PrismaClient } from '@/generated/prisma/client'

const select = { slug: true, updatedAt: true } as const

export function createSitemapRepository(prisma: PrismaClient) {
  return {
    publishedSlugs: () =>
      Promise.all([
        prisma.tour.findMany({ where: { status: 'published' }, select, orderBy: { slug: 'asc' } }),
        prisma.destination.findMany({ where: { status: 'published' }, select, orderBy: { slug: 'asc' } }),
        prisma.blogPost.findMany({ where: { status: 'published' }, select, orderBy: { slug: 'asc' } }),
      ]),
  }
}
