import type { Prisma } from '@/generated/prisma/client'

/**
 * Atomically allocate the next reference code for the current year, e.g. SRD-2026-0001.
 * Must be called inside a transaction together with the insert that uses it.
 */
export async function nextReference(tx: Prisma.TransactionClient, kind: 'inquiry' | 'proposal'): Promise<string> {
  const year = new Date().getUTCFullYear()
  const key = `${kind}:${year}`
  const counter = await tx.referenceCounter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  })
  const prefix = kind === 'inquiry' ? 'SRD' : 'SRD-C'
  return `${prefix}-${year}-${String(counter.value).padStart(4, '0')}`
}
