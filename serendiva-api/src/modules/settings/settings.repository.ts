import type { PrismaClient } from '@/generated/prisma/client'
import { jsonValue } from '@/lib/json'
import { assertMediaExist, findAdminMediaRefs, findMediaMap } from '@/modules/shared/media-lookup'
import type { SettingKey } from './settings.schemas'

export function createSettingsRepository(prisma: PrismaClient) {
  return {
    all: () => prisma.siteSetting.findMany({ select: { key: true, value: true } }),

    upsert: (key: SettingKey, value: unknown) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: jsonValue(value) },
        update: { value: jsonValue(value) },
      }),

    reviewStats: () => prisma.review.aggregate({ where: { status: 'approved' }, _avg: { rating: true }, _count: true }),

    mediaMap: (ids: Iterable<string>) => findMediaMap(prisma, ids),
    adminMediaRefs: (ids: Iterable<string>) => findAdminMediaRefs(prisma, ids),
    assertMedia: (refs: { path: string; id: string | null | undefined }[]) => assertMediaExist(prisma, refs),
  }
}
