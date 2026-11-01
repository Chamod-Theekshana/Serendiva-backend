import type { z } from 'zod'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import { tr } from '@/lib/i18n'
import { notFound, validationError } from '@/lib/errors'
import { Tags } from '@/lib/revalidate'
import { toFaqItem } from '@/modules/shared/public-dto'
import { asRecordRequired, translationFlags } from '@/modules/shared/admin-dto'
import { createFaqsRepository, type AdminFaqRow } from './faqs.repository'
import type { AdminFaq, AdminFaqsQuery, FaqInputT, FaqsQuery } from './faqs.schemas'

type Links = { tour: { slug: string } | null; destination: { slug: string } | null } | null | undefined

function toAdmin(f: AdminFaqRow): AdminFaq {
  return {
    id: f.id,
    scope: f.scope,
    question: asRecordRequired<string>(f.question, ''),
    answer: asRecordRequired<string>(f.answer, ''),
    order: f.order,
    status: f.status,
    tourId: f.tourId,
    tour: f.tour ? { id: f.tour.id, slug: f.tour.slug, title: tr<string>(f.tour.title, 'en', f.tour.slug) } : null,
    destinationId: f.destinationId,
    destination: f.destination
      ? { id: f.destination.id, slug: f.destination.slug, name: tr<string>(f.destination.name, 'en', f.destination.slug) }
      : null,
    translations: translationFlags(f.question),
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }
}

export function createFaqsService(deps: AppDeps) {
  const repo = createFaqsRepository(deps.prisma)

  /** Tour and destination pages embed their FAQs, so their tags are refreshed as well. */
  function revalidate(...links: Links[]) {
    const tags: string[] = [Tags.faqs]
    for (const l of links) {
      if (l?.tour) tags.push(Tags.tour(l.tour.slug))
      if (l?.destination) tags.push(Tags.destination(l.destination.slug))
    }
    deps.revalidator.revalidate(tags)
  }

  async function validate(input: FaqInputT) {
    if (input.tourId && !(await repo.tourExists(input.tourId))) {
      throw validationError([{ path: 'tourId', message: 'Unknown tour' }])
    }
    if (input.destinationId && !(await repo.destinationExists(input.destinationId))) {
      throw validationError([{ path: 'destinationId', message: 'Unknown destination' }])
    }
  }

  return {
    async list(q: z.infer<typeof FaqsQuery>) {
      const where: Prisma.FaqWhereInput = {
        ...(q.scope ? { scope: q.scope } : {}),
        ...(q.tour ? { tour: { slug: q.tour, status: 'published' } } : {}),
        ...(q.destination ? { destination: { slug: q.destination, status: 'published' } } : {}),
      }
      const rows = await repo.listPublished(where)
      return rows.map((f) => toFaqItem(f, q.locale))
    },

    async adminList(q: z.infer<typeof AdminFaqsQuery>): Promise<AdminFaq[]> {
      const where: Prisma.FaqWhereInput = {
        ...(q.scope ? { scope: q.scope } : {}),
        ...(q.tourId ? { tourId: q.tourId } : {}),
        ...(q.destinationId ? { destinationId: q.destinationId } : {}),
        ...(q.q ? { question: { path: ['en'], string_contains: q.q } } : {}),
      }
      return (await repo.adminList(where)).map(toAdmin)
    },

    async adminGet(id: string): Promise<AdminFaq> {
      const f = await repo.adminFindById(id)
      if (!f) throw notFound('FAQ')
      return toAdmin(f)
    },

    async create(input: FaqInputT): Promise<AdminFaq> {
      await validate(input)
      const f = await repo.create(input)
      revalidate(f)
      return toAdmin(f)
    },

    async update(id: string, input: FaqInputT): Promise<AdminFaq> {
      const before = await repo.findLinks(id)
      if (!before) throw notFound('FAQ')
      await validate(input)
      const f = await repo.update(id, input)
      revalidate(before, f)
      return toAdmin(f)
    },

    async setStatus(id: string, status: 'draft' | 'published'): Promise<AdminFaq> {
      if (!(await repo.findLinks(id))) throw notFound('FAQ')
      const f = await repo.setStatus(id, status)
      revalidate(f)
      return toAdmin(f)
    },

    async reorder(items: { id: string; order: number }[]) {
      await repo.reorder(items)
      revalidate(...(await repo.linksOf(items.map((i) => i.id))))
    },

    async remove(id: string) {
      const before = await repo.findLinks(id)
      if (!before) throw notFound('FAQ')
      await repo.delete(id)
      revalidate(before)
    },
  }
}
