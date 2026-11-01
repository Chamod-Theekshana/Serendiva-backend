import type { Prisma, PrismaClient } from '@/generated/prisma/client'

export interface AvailabilityData {
  startDate: Date
  endDate: Date
  type: 'busy' | 'available'
  note: string | null
}

const ORDER = [{ startDate: 'asc' }, { endDate: 'asc' }] satisfies Prisma.AvailabilityRangeOrderByWithRelationInput[]

/** Ranges overlapping [from, to] (both inclusive); open ends are unbounded. */
function overlapping(from?: Date, to?: Date): Prisma.AvailabilityRangeWhereInput {
  return {
    ...(to ? { startDate: { lte: to } } : {}),
    ...(from ? { endDate: { gte: from } } : {}),
  }
}

export function createAvailabilityRepository(prisma: PrismaClient) {
  return {
    listPublic: (from: Date, to: Date) =>
      prisma.availabilityRange.findMany({
        where: overlapping(from, to),
        select: { id: true, startDate: true, endDate: true, type: true },
        orderBy: ORDER,
      }),
    adminList: (from?: Date, to?: Date) =>
      prisma.availabilityRange.findMany({ where: overlapping(from, to), orderBy: ORDER }),
    findById: (id: string) => prisma.availabilityRange.findUnique({ where: { id } }),
    create: (data: AvailabilityData) => prisma.availabilityRange.create({ data }),
    update: (id: string, data: AvailabilityData) => prisma.availabilityRange.update({ where: { id }, data }),
    delete: (id: string) => prisma.availabilityRange.delete({ where: { id }, select: { id: true } }),
  }
}
