import type { Prisma, PrismaClient } from '@/generated/prisma/client'
import { optJson } from '@/lib/json'

export const adminMediaRowSelect = {
  id: true,
  key: true,
  url: true,
  mime: true,
  size: true,
  width: true,
  height: true,
  variants: true,
  blurDataUrl: true,
  altText: true,
  originalName: true,
  createdAt: true,
} satisfies Prisma.MediaSelect

export type AdminMediaRow = Prisma.MediaGetPayload<{ select: typeof adminMediaRowSelect }>

export interface MediaCreateData {
  id: string
  key: string
  url: string
  mime: string
  size: number
  width: number | null
  height: number | null
  variants: unknown
  blurDataUrl: string | null
  altText: unknown
  originalName: string | null
  uploadedById: string | null
}

export function createMediaRepository(prisma: PrismaClient) {
  return {
    list: (where: Prisma.MediaWhereInput, skip: number, take: number) =>
      prisma.$transaction([
        prisma.media.findMany({
          where,
          select: adminMediaRowSelect,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip,
          take,
        }),
        prisma.media.count({ where }),
      ]),

    findById: (id: string) => prisma.media.findUnique({ where: { id }, select: adminMediaRowSelect }),

    create: (data: MediaCreateData) =>
      prisma.media.create({
        data: {
          ...data,
          variants: optJson(data.variants),
          altText: optJson(data.altText),
        },
        select: adminMediaRowSelect,
      }),

    updateAltText: (id: string, altText: unknown) =>
      prisma.media.update({ where: { id }, data: { altText: optJson(altText) }, select: adminMediaRowSelect }),

    delete: (id: string) => prisma.media.delete({ where: { id }, select: { id: true } }),
  }
}

export type MediaRepository = ReturnType<typeof createMediaRepository>
