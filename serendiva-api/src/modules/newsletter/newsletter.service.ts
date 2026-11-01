import { randomBytes } from 'node:crypto'
import type { AppDeps } from '@/types'
import { Prisma, type NewsletterSubscriber } from '@/generated/prisma/client'
import { newsletterConfirmEmail } from '@/lib/email/templates'
import { iso } from '@/lib/dates'
import { AppError, notFound } from '@/lib/errors'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { toCsv } from '@/lib/csv'
import type { RequestContext } from '@/modules/inquiries/inquiries.service'
import { runAfterResponse } from '@/modules/inquiries/lead-emails'
import { siteUrl } from '@/modules/inquiries/lead-helpers'
import { createNewsletterRepository, STATUS_WHERE } from './newsletter.repository'
import type {
  AdminSubscribersExportQueryT,
  AdminSubscribersQueryT,
  AdminSubscriberT,
  NewsletterSubscribeBodyT,
  NewsletterSubscribeResultT,
  SubscriberStatus,
} from './newsletter.schemas'

const PENDING_MESSAGE = 'Almost done — please check your inbox and click the link to confirm your subscription.'
const ALREADY_MESSAGE = 'You are already subscribed — thank you!'

const newToken = () => randomBytes(24).toString('base64url')
const invalidToken = () => new AppError(400, 'INVALID_TOKEN', 'This link is invalid or has expired')

export function subscriberStatus(s: Pick<NewsletterSubscriber, 'confirmedAt' | 'unsubscribedAt'>): SubscriberStatus {
  if (s.unsubscribedAt) return 'unsubscribed'
  return s.confirmedAt ? 'confirmed' : 'pending'
}

function toAdmin(s: NewsletterSubscriber): AdminSubscriberT {
  return {
    id: s.id,
    email: s.email,
    locale: s.locale,
    source: s.source,
    status: subscriberStatus(s),
    confirmedAt: iso(s.confirmedAt),
    unsubscribedAt: iso(s.unsubscribedAt),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }
}

function searchWhere(q: string | undefined): Prisma.NewsletterSubscriberWhereInput {
  const term = q?.trim()
  if (!term) return {}
  return {
    OR: [
      { email: { contains: term, mode: 'insensitive' } },
      { source: { contains: term, mode: 'insensitive' } },
    ],
  }
}

const isUniqueViolation = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'

export function createNewsletterService(deps: AppDeps) {
  const repo = createNewsletterRepository(deps.prisma)
  const { env } = deps

  /** Create the subscriber or restart double opt-in for an unconfirmed / unsubscribed address. */
  async function upsertPending(body: NewsletterSubscribeBodyT) {
    const existing = await repo.findByEmail(body.email)
    if (existing && existing.confirmedAt && !existing.unsubscribedAt) return { subscriber: existing, alreadySubscribed: true }
    const fresh = { confirmToken: newToken(), locale: body.locale, ...(body.source ? { source: body.source } : {}) }
    const subscriber = existing
      ? await repo.update(existing.id, { ...fresh, confirmedAt: null, unsubscribedAt: null })
      : await repo.create({ ...fresh, email: body.email, unsubscribeToken: newToken() })
    return { subscriber, alreadySubscribed: false }
  }

  return {
    async subscribe(body: NewsletterSubscribeBodyT, ctx: RequestContext): Promise<NewsletterSubscribeResultT> {
      if (body.website && body.website.trim() !== '') {
        ctx.log.info('newsletter honeypot triggered; submission discarded')
        return { status: 'pending', message: PENDING_MESSAGE }
      }

      let result: Awaited<ReturnType<typeof upsertPending>>
      try {
        result = await upsertPending(body)
      } catch (err) {
        // Two simultaneous sign-ups for a new address: the second one simply re-runs on the saved row.
        if (!isUniqueViolation(err)) throw err
        result = await upsertPending(body)
      }
      if (result.alreadySubscribed) return { status: 'already_subscribed', message: ALREADY_MESSAGE }

      const s = result.subscriber
      const token = s.confirmToken!
      const email = newsletterConfirmEmail({
        confirmUrl: siteUrl(env.FRONTEND_URL, s.locale, `/newsletter/confirm?token=${encodeURIComponent(token)}`),
        unsubscribeUrl: siteUrl(env.FRONTEND_URL, s.locale, `/newsletter/unsubscribe?token=${encodeURIComponent(s.unsubscribeToken)}`),
      })
      runAfterResponse(ctx.log, { subscriberId: s.id }, async () => {
        await deps.email.send({ ...email, to: s.email })
        ctx.log.info({ subscriberId: s.id }, 'newsletter confirmation email sent')
      })
      return { status: 'pending', message: PENDING_MESSAGE }
    },

    async confirm(token: string): Promise<{ status: 'confirmed' | 'already_confirmed' }> {
      const s = await repo.findByConfirmToken(token)
      if (!s || s.unsubscribedAt) throw invalidToken()
      if (s.confirmedAt) return { status: 'already_confirmed' }
      await repo.update(s.id, { confirmedAt: new Date() })
      return { status: 'confirmed' }
    },

    /** Idempotent. The confirm token is dropped so an old confirmation link cannot re-subscribe. */
    async unsubscribe(token: string): Promise<{ status: 'unsubscribed' }> {
      const s = await repo.findByUnsubscribeToken(token)
      if (!s) throw invalidToken()
      if (!s.unsubscribedAt) await repo.update(s.id, { unsubscribedAt: new Date(), confirmToken: null })
      return { status: 'unsubscribed' }
    },

    // ---------------------------------------------------------------- admin

    async adminList(q: AdminSubscribersQueryT) {
      const search = searchWhere(q.q)
      const where = q.status ? { AND: [search, STATUS_WHERE[q.status]] } : search
      const { skip, take } = toSkipTake(q)
      const [[rows, total], [confirmed, pending, unsubscribed]] = await Promise.all([
        repo.list(where, skip, take),
        repo.counts(search),
      ])
      return {
        items: rows.map(toAdmin),
        meta: pageMeta(q, total),
        counts: { confirmed, pending, unsubscribed, total: confirmed + pending + unsubscribed },
      }
    },

    async exportCsv(q: AdminSubscribersExportQueryT): Promise<string> {
      const search = searchWhere(q.q)
      const rows = await repo.listForExport(q.status === 'all' ? search : { AND: [search, STATUS_WHERE[q.status]] })
      return toCsv(
        ['Email', 'Status', 'Language', 'Source', 'Signed up (UTC)', 'Confirmed (UTC)', 'Unsubscribed (UTC)'],
        rows.map((s) => [s.email, subscriberStatus(s), s.locale, s.source, s.createdAt, s.confirmedAt, s.unsubscribedAt]),
      )
    },

    async remove(id: string) {
      if (!(await repo.exists(id))) throw notFound('Subscriber')
      await repo.delete(id)
    },
  }
}

export type NewsletterService = ReturnType<typeof createNewsletterService>
