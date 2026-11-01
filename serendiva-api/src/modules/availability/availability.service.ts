import type { z } from 'zod'
import type { AppDeps } from '@/types'
import { notFound } from '@/lib/errors'
import { parseDate } from '@/lib/dates'
import { Tags } from '@/lib/revalidate'
import { createAvailabilityRepository } from './availability.repository'
import type { AdminAvailabilityQuery, AdminAvailabilityRange, AvailabilityInputT, AvailabilityQuery } from './availability.schemas'

/** @db.Date columns come back as UTC midnight; format as YYYY-MM-DD. */
const day = (d: Date) => d.toISOString().slice(0, 10)

function toAdmin(r: {
  id: string
  startDate: Date
  endDate: Date
  type: 'busy' | 'available'
  note: string | null
  createdAt: Date
  updatedAt: Date
}): AdminAvailabilityRange {
  return {
    id: r.id,
    startDate: day(r.startDate),
    endDate: day(r.endDate),
    type: r.type,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

function toData(input: AvailabilityInputT) {
  return {
    startDate: parseDate(input.startDate),
    endDate: parseDate(input.endDate),
    type: input.type,
    note: input.note || null,
  }
}

export function createAvailabilityService(deps: AppDeps) {
  const repo = createAvailabilityRepository(deps.prisma)
  const revalidate = () => deps.revalidator.revalidate([Tags.availability])

  return {
    async calendar(q: z.infer<typeof AvailabilityQuery>) {
      const from = q.from ?? day(new Date())
      let to = q.to
      if (!to) {
        const d = parseDate(from)
        d.setUTCMonth(d.getUTCMonth() + 12)
        to = day(d)
      }
      const rows = await repo.listPublic(parseDate(from), parseDate(to))
      return {
        from,
        to,
        ranges: rows.map((r) => ({ id: r.id, startDate: day(r.startDate), endDate: day(r.endDate), type: r.type })),
      }
    },

    async adminList(q: z.infer<typeof AdminAvailabilityQuery>): Promise<AdminAvailabilityRange[]> {
      const rows = await repo.adminList(q.from ? parseDate(q.from) : undefined, q.to ? parseDate(q.to) : undefined)
      return rows.map(toAdmin)
    },

    async adminGet(id: string): Promise<AdminAvailabilityRange> {
      const r = await repo.findById(id)
      if (!r) throw notFound('Availability range')
      return toAdmin(r)
    },

    async create(input: AvailabilityInputT): Promise<AdminAvailabilityRange> {
      const r = await repo.create(toData(input))
      revalidate()
      return toAdmin(r)
    },

    async update(id: string, input: AvailabilityInputT): Promise<AdminAvailabilityRange> {
      if (!(await repo.findById(id))) throw notFound('Availability range')
      const r = await repo.update(id, toData(input))
      revalidate()
      return toAdmin(r)
    },

    async remove(id: string) {
      if (!(await repo.findById(id))) throw notFound('Availability range')
      await repo.delete(id)
      revalidate()
    },
  }
}
