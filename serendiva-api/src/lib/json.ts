import { Prisma } from '@/generated/prisma/client'

/** Value for a required JSON column. */
export const jsonValue = (v: unknown): Prisma.InputJsonValue => v as Prisma.InputJsonValue

/**
 * Value for a nullable JSON column: null/undefined become SQL NULL (Prisma.DbNull) so that
 * clearing a field in the admin actually clears it in the database.
 */
export const optJson = (v: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull =>
  v === null || v === undefined ? Prisma.DbNull : (v as Prisma.InputJsonValue)
