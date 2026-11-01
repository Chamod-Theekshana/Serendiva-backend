import type { FastifyBaseLogger } from 'fastify'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import type { EmailMessage } from '@/lib/email'
import { guideInquiryEmail, visitorConfirmationEmail } from '@/lib/email/templates'
import { tr } from '@/lib/i18n'
import { iso, isoDate, parseDate } from '@/lib/dates'
import { notFound } from '@/lib/errors'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { toCsv } from '@/lib/csv'
import { verifyTurnstile } from '@/lib/turnstile'
import { createInquiriesRepository, type InquiryRow } from './inquiries.repository'
import {
  INQUIRY_THANK_YOU,
  type AdminInquiriesQueryT,
  type AdminInquiry,
  type AdminInquiryListItemT,
  type InquiryBodyT,
  type InquiryFilters,
  type InquiryResultT,
  type InquiryUpdateBodyT,
} from './inquiries.schemas'
import { deliverMissingEmails, runAfterResponse, withLeadLock, type LeadEmailStatus } from './lead-emails'
import { countsFrom, createdAtRange, fakeReference, siteUrl, textPreview } from './lead-helpers'

export interface RequestContext {
  ip: string
  log: FastifyBaseLogger
}

const tourRef = (t: InquiryRow['tour']) => (t ? { id: t.id, slug: t.slug, title: tr<string>(t.title, 'en', t.slug) } : null)
const destinationRef = (d: InquiryRow['destination']) =>
  d ? { id: d.id, slug: d.slug, name: tr<string>(d.name, 'en', d.slug) } : null

export function toAdminInquiryListItem(r: InquiryRow): AdminInquiryListItemT {
  return {
    id: r.id,
    reference: r.reference,
    name: r.name,
    email: r.email,
    whatsapp: r.whatsapp,
    country: r.country,
    partyType: r.partyType,
    adults: r.adults,
    children: r.children,
    travelStart: isoDate(r.travelStart),
    travelEnd: isoDate(r.travelEnd),
    travelWindow: r.travelWindow,
    tour: tourRef(r.tour),
    destination: destinationRef(r.destination),
    messagePreview: textPreview(r.message),
    sourcePage: r.sourcePage,
    locale: r.locale,
    status: r.status,
    emailStatus: r.emailStatus,
    hasNotes: Boolean(r.internalNotes?.trim()),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

function toAdminInquiry(r: InquiryRow): AdminInquiry {
  return {
    id: r.id,
    reference: r.reference,
    name: r.name,
    email: r.email,
    whatsapp: r.whatsapp,
    country: r.country,
    partyType: r.partyType,
    adults: r.adults,
    children: r.children,
    travelStart: isoDate(r.travelStart),
    travelEnd: isoDate(r.travelEnd),
    travelWindow: r.travelWindow,
    flexibleDates: r.flexibleDates,
    flexibility: r.flexibility,
    durationPreference: r.durationPreference,
    pace: r.pace,
    stayStyle: r.stayStyle,
    interests: r.interests,
    tourId: r.tourId,
    tour: tourRef(r.tour),
    destinationId: r.destinationId,
    destination: destinationRef(r.destination),
    message: r.message,
    sourcePage: r.sourcePage,
    locale: r.locale,
    status: r.status,
    internalNotes: r.internalNotes,
    emailStatus: r.emailStatus,
    guideEmailSentAt: iso(r.guideEmailSentAt),
    visitorEmailSentAt: iso(r.visitorEmailSentAt),
    emailAttempts: r.emailAttempts,
    lastEmailError: r.lastEmailError,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

function buildWhere(f: InquiryFilters, opts: { ignoreStatus?: boolean } = {}): Prisma.InquiryWhereInput {
  const q = f.q?.trim()
  const insensitive = 'insensitive' as const
  const createdAt = createdAtRange(f.from, f.to)
  return {
    ...(f.status && !opts.ignoreStatus ? { status: f.status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(f.tour ? { tourId: f.tour } : {}),
    ...(f.country?.trim() ? { country: { equals: f.country.trim(), mode: insensitive } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: insensitive } },
            { email: { contains: q, mode: insensitive } },
            { reference: { contains: q, mode: insensitive } },
            { message: { contains: q, mode: insensitive } },
          ],
        }
      : {}),
  }
}

export function createInquiriesService(deps: AppDeps) {
  const repo = createInquiriesRepository(deps.prisma)
  const { env } = deps

  function guideMessage(r: InquiryRow): EmailMessage {
    const rendered = guideInquiryEmail({
      reference: r.reference,
      name: r.name,
      email: r.email,
      whatsapp: r.whatsapp,
      country: r.country,
      partyType: r.partyType,
      adults: r.adults,
      children: r.children,
      travelWindow: r.travelWindow,
      travelStart: isoDate(r.travelStart),
      travelEnd: isoDate(r.travelEnd),
      flexibleDates: r.flexibleDates,
      flexibility: r.flexibility,
      durationPreference: r.durationPreference,
      pace: r.pace,
      stayStyle: r.stayStyle,
      interests: r.interests,
      tourTitle: r.tour ? tr<string>(r.tour.title, 'en', r.tour.slug) : null,
      tourUrl: r.tour ? siteUrl(env.FRONTEND_URL, r.locale, `/tours/${r.tour.slug}`) : null,
      destinationName: r.destination ? tr<string>(r.destination.name, 'en', r.destination.slug) : null,
      message: r.message,
      sourcePage: r.sourcePage,
      locale: r.locale,
      adminUrl: siteUrl(env.FRONTEND_URL, 'en', `/admin/inquiries?id=${encodeURIComponent(r.id)}`),
    })
    return { ...rendered, to: env.GUIDE_NOTIFY_EMAIL, replyTo: r.email }
  }

  async function visitorMessage(r: InquiryRow): Promise<EmailMessage> {
    const rendered = visitorConfirmationEmail({
      reference: r.reference,
      name: r.name,
      whatsappNumber: await repo.contactWhatsapp(),
      siteUrl: env.FRONTEND_URL,
      kind: 'inquiry',
    })
    return { ...rendered, to: r.email }
  }

  const service = {
    /**
     * Public form. The inquiry is saved before anything else can fail; emails are sent after the
     * response and their outcome is stored for the retry job.
     */
    async submit(body: InquiryBodyT, ctx: RequestContext): Promise<InquiryResultT> {
      if (body.website && body.website.trim() !== '') {
        ctx.log.info('inquiry honeypot triggered; submission discarded')
        return { reference: fakeReference('inquiry'), message: INQUIRY_THANK_YOU }
      }
      await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, ctx.ip)

      const [tour, destination] = await Promise.all([
        body.tourSlug ? repo.findTourIdBySlug(body.tourSlug) : null,
        body.destinationSlug ? repo.findDestinationIdBySlug(body.destinationSlug) : null,
      ])

      const created = await repo.create({
        name: body.name,
        email: body.email,
        whatsapp: body.whatsapp ?? null,
        country: body.country ?? null,
        partyType: body.partyType ?? null,
        adults: body.adults,
        children: body.children,
        travelStart: body.travelStart ? parseDate(body.travelStart) : null,
        travelEnd: body.travelEnd ? parseDate(body.travelEnd) : null,
        travelWindow: body.travelWindow ?? null,
        flexibleDates: body.flexibleDates ?? false,
        flexibility: body.flexibility ?? null,
        durationPreference: body.durationPreference ?? null,
        pace: body.pace ?? null,
        stayStyle: body.stayStyle ?? null,
        interests: body.interests,
        tourId: tour?.id ?? null,
        destinationId: destination?.id ?? null,
        message: body.message ?? null,
        sourcePage: body.sourcePage ?? null,
        locale: body.locale,
      })
      ctx.log.info({ inquiryId: created.id, reference: created.reference }, 'inquiry saved')

      runAfterResponse(ctx.log, { inquiryId: created.id, reference: created.reference }, () =>
        service.sendMissingEmails(created.id, ctx.log),
      )
      return { reference: created.reference, message: INQUIRY_THANK_YOU }
    },

    /**
     * Send the guide notification and/or visitor confirmation that have not been delivered yet and
     * record the outcome. Used after submission, by the retry job and by the admin "resend" action.
     * Returns the resulting email status (null if the inquiry no longer exists).
     */
    async sendMissingEmails(id: string, log: FastifyBaseLogger): Promise<LeadEmailStatus | null> {
      const result = await withLeadLock(`inquiry:${id}`, async () => {
        const row = await repo.findById(id)
        if (!row) return null
        const patch = await deliverMissingEmails(deps.email, row, {
          guide: () => guideMessage(row),
          visitor: () => visitorMessage(row),
        })
        if (!patch) return row.emailStatus
        await repo.updateEmailState(id, patch)
        const logData = { inquiryId: id, reference: row.reference, emailStatus: patch.emailStatus, attempt: patch.emailAttempts }
        if (patch.emailStatus === 'sent') log.info(logData, 'inquiry emails sent')
        else log.warn({ ...logData, error: patch.lastEmailError }, 'inquiry emails not fully delivered')
        return patch.emailStatus
      })
      return result ?? null
    },

    /** Ids for the retry job (see src/jobs/email-retry.ts). */
    emailRetryIds: (opts: { createdAfter: Date; createdBefore: Date; maxAttempts: number; take: number }) =>
      repo.findEmailRetryIds(opts).then((rows) => rows.map((r) => r.id)),

    // ---------------------------------------------------------------- admin

    async adminList(q: AdminInquiriesQueryT) {
      const { skip, take } = toSkipTake(q)
      const [[rows, total], groups] = await Promise.all([
        repo.list(buildWhere(q), skip, take),
        repo.countByStatus(buildWhere(q, { ignoreStatus: true })),
      ])
      return { items: rows.map(toAdminInquiryListItem), meta: pageMeta(q, total), counts: countsFrom(groups) }
    },

    async adminGet(id: string): Promise<AdminInquiry> {
      const row = await repo.findById(id)
      if (!row) throw notFound('Inquiry')
      return toAdminInquiry(row)
    },

    async update(id: string, body: InquiryUpdateBodyT): Promise<AdminInquiry> {
      if (!(await repo.exists(id))) throw notFound('Inquiry')
      const data: { status?: InquiryUpdateBodyT['status']; internalNotes?: string | null } = {}
      if (body.status) data.status = body.status
      if (body.internalNotes !== undefined) data.internalNotes = body.internalNotes?.trim() || null
      return toAdminInquiry(await repo.update(id, data))
    },

    async remove(id: string) {
      if (!(await repo.exists(id))) throw notFound('Inquiry')
      await repo.delete(id)
    },

    async resendEmails(id: string, log: FastifyBaseLogger): Promise<AdminInquiry> {
      if (!(await repo.exists(id))) throw notFound('Inquiry')
      await service.sendMissingEmails(id, log)
      return service.adminGet(id)
    },

    async exportCsv(filters: InquiryFilters): Promise<string> {
      const rows = await repo.listForExport(buildWhere(filters))
      return toCsv(
        [
          'Reference', 'Received (UTC)', 'Status', 'Name', 'Email', 'WhatsApp', 'Country', 'Travelling as',
          'Adults', 'Children', 'Travel start', 'Travel end', 'Travel window', 'Flexible dates', 'Flexibility',
          'Duration', 'Pace', 'Stay style', 'Interests', 'Tour', 'Destination', 'Message', 'Source page',
          'Language', 'Email status', 'Internal notes',
        ],
        rows.map((r) => [
          r.reference,
          r.createdAt,
          r.status,
          r.name,
          r.email,
          r.whatsapp,
          r.country,
          r.partyType,
          r.adults,
          r.children,
          isoDate(r.travelStart),
          isoDate(r.travelEnd),
          r.travelWindow,
          r.flexibleDates ? 'yes' : 'no',
          r.flexibility,
          r.durationPreference,
          r.pace,
          r.stayStyle,
          r.interests.join('; '),
          r.tour ? tr<string>(r.tour.title, 'en', r.tour.slug) : null,
          r.destination ? tr<string>(r.destination.name, 'en', r.destination.slug) : null,
          r.message,
          r.sourcePage,
          r.locale,
          r.emailStatus,
          r.internalNotes,
        ]),
      )
    },
  }
  return service
}

export type InquiriesService = ReturnType<typeof createInquiriesService>
