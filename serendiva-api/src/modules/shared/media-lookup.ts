import type { PrismaClient } from '@/generated/prisma/client'
import { mediaSelect, type MediaLike } from '@/lib/media-dto'
import { validationError } from '@/lib/errors'
import { adminMediaSelect, toAdminMediaRef, type AdminMediaRefT } from './admin-dto'

/**
 * Media lookups shared by content modules whose JSON blocks / settings reference Media ids
 * (these references are not foreign keys, so they are resolved and validated here).
 */

/** Media rows (public image fields) by id, in one query. */
export async function findMediaMap(prisma: PrismaClient, ids: Iterable<string>): Promise<Map<string, MediaLike>> {
  const unique = [...new Set(ids)].filter(Boolean)
  if (!unique.length) return new Map()
  const rows = await prisma.media.findMany({ where: { id: { in: unique } }, select: mediaSelect })
  return new Map(rows.map((m) => [m.id, m]))
}

/** Admin thumbnails keyed by media id, in one query (unknown ids are left out). */
export async function findAdminMediaRefs(
  prisma: PrismaClient,
  ids: Iterable<string>,
): Promise<Record<string, AdminMediaRefT>> {
  const unique = [...new Set(ids)].filter(Boolean)
  if (!unique.length) return {}
  const rows = await prisma.media.findMany({ where: { id: { in: unique } }, select: adminMediaSelect })
  const out: Record<string, AdminMediaRefT> = {}
  for (const m of rows) out[m.id] = toAdminMediaRef(m)!
  return out
}

/**
 * Throw a 400 VALIDATION_ERROR listing every referenced media id that does not exist.
 * `refs` pairs a body path (for the editor to highlight) with the id; empty ids are ignored.
 */
export async function assertMediaExist(
  prisma: PrismaClient,
  refs: { path: string; id: string | null | undefined }[],
): Promise<void> {
  const wanted = refs.filter((r): r is { path: string; id: string } => typeof r.id === 'string' && r.id !== '')
  if (!wanted.length) return
  const ids = [...new Set(wanted.map((r) => r.id))]
  const found = await prisma.media.findMany({ where: { id: { in: ids } }, select: { id: true } })
  const known = new Set(found.map((m) => m.id))
  const missing = wanted.filter((r) => !known.has(r.id))
  if (missing.length) throw validationError(missing.map((r) => ({ path: r.path, message: 'Unknown media id' })))
}
