import { randomBytes } from 'node:crypto'
import type { FastifyBaseLogger } from 'fastify'
import type { AppDeps } from '@/types'
import type { Prisma } from '@/generated/prisma/client'
import type { EmailMessage } from '@/lib/email'
import { guideProposalEmail, visitorConfirmationEmail } from '@/lib/email/templates'
import { iso } from '@/lib/dates'
import { AppError, notFound, validationError } from '@/lib/errors'
import { DOC_MIME, sniffMime } from '@/lib/image'
import { pageMeta, toSkipTake } from '@/lib/pagination'
import { toCsv } from '@/lib/csv'
import { PRIVATE_PREFIX } from '@/lib/storage'
import { verifyTurnstile } from '@/lib/turnstile'
import type { RequestContext } from '@/modules/inquiries/inquiries.service'
import { deliverMissingEmails, runAfterResponse, withLeadLock, type LeadEmailStatus } from '@/modules/inquiries/lead-emails'
import { countsFrom, createdAtRange, errorMessage, fakeReference, siteUrl, textPreview } from '@/modules/inquiries/lead-helpers'
import { attachmentTooLarge, type RawAttachment, type RawProposalForm } from './proposals.multipart'
import { createProposalsRepository, type ProposalRow } from './proposals.repository'
import {
  MAX_ATTACHMENT_BYTES,
  PROPOSAL_THANK_YOU,
  ProposalFields,
  REQUIRED_PROPOSAL_FIELDS,
  type AdminProposal,
  type AdminProposalListItemT,
  type AdminProposalsQueryT,
  type ProposalFilters,
  type ProposalFieldsT,
  type ProposalResultT,
  type ProposalUpdateBodyT,
} from './proposals.schemas'

const ATTACHMENT_FAILED_NOTE =
  'Automatic note: the file attached to this request could not be stored (upload error). Please ask the client to email it.'

const downloadPath = (id: string) => `/api/v1/admin/proposals/${encodeURIComponent(id)}/attachment`

function toListItem(r: ProposalRow): AdminProposalListItemT {
  return {
    id: r.id,
    reference: r.reference,
    company: r.company,
    contactPerson: r.contactPerson,
    email: r.email,
    phone: r.phone,
    groupSize: r.groupSize,
    dates: r.dates,
    eventType: r.eventType,
    logistics: r.logistics,
    messagePreview: textPreview(r.message),
    hasAttachment: r.attachment !== null,
    sourcePage: r.sourcePage,
    locale: r.locale,
    status: r.status,
    emailStatus: r.emailStatus,
    hasNotes: Boolean(r.internalNotes?.trim()),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

function toAdmin(r: ProposalRow): AdminProposal {
  return {
    id: r.id,
    reference: r.reference,
    company: r.company,
    contactPerson: r.contactPerson,
    email: r.email,
    phone: r.phone,
    groupSize: r.groupSize,
    dates: r.dates,
    eventType: r.eventType,
    logistics: r.logistics,
    message: r.message,
    attachment: r.attachment
      ? {
          id: r.attachment.id,
          originalName: r.attachment.originalName ?? `${r.reference}`,
          mime: r.attachment.mime,
          size: r.attachment.size,
          downloadPath: downloadPath(r.id),
        }
      : null,
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

function buildWhere(f: ProposalFilters, opts: { ignoreStatus?: boolean } = {}): Prisma.CorporateProposalWhereInput {
  const q = f.q?.trim()
  const insensitive = 'insensitive' as const
  const createdAt = createdAtRange(f.from, f.to)
  return {
    ...(f.status && !opts.ignoreStatus ? { status: f.status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(q
      ? {
          OR: [
            { company: { contains: q, mode: insensitive } },
            { contactPerson: { contains: q, mode: insensitive } },
            { email: { contains: q, mode: insensitive } },
            { reference: { contains: q, mode: insensitive } },
          ],
        }
      : {}),
  }
}

/** Validate the multipart text fields with the same error shape as JSON bodies. */
function parseFields(form: RawProposalForm): ProposalFieldsT {
  const input: Record<string, unknown> = {}
  for (const [name, values] of Object.entries(form.fields)) {
    if (name === 'logistics' || name === 'logistics[]') continue
    if (name in ProposalFields.shape) input[name] = values[values.length - 1]
  }
  for (const name of REQUIRED_PROPOSAL_FIELDS) input[name] ??= ''
  // Accepts the field repeated once per item and/or comma-separated values.
  input.logistics = [...(form.fields.logistics ?? []), ...(form.fields['logistics[]'] ?? [])]
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean)

  const issues = form.truncated.map((path) => ({ path, message: 'This field is too long' }))
  const parsed = ProposalFields.safeParse(input)
  if (!parsed.success) {
    issues.push(...parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  if (issues.length || !parsed.success) throw validationError(issues)
  return parsed.data
}

/** Only PDF and DOCX are accepted, judged by the file's magic bytes (never the client's MIME type). */
function checkAttachment(file: RawAttachment): { mime: string; ext: 'pdf' | 'docx' } {
  if (file.buffer.length > MAX_ATTACHMENT_BYTES) throw attachmentTooLarge()
  const mime = sniffMime(file.buffer)
  if (!mime || !DOC_MIME.includes(mime)) {
    throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'The attachment must be a PDF or Word (.docx) document', [
      { path: 'attachment', message: 'Only PDF or DOCX files are accepted' },
    ])
  }
  return { mime, ext: mime === 'application/pdf' ? 'pdf' : 'docx' }
}

function cleanFilename(name: string, ext: string): string {
  const base = name.split(/[\\/]/).pop() ?? ''
  // eslint-disable-next-line no-control-regex
  const cleaned = base.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 200)
  return cleaned || `brief.${ext}`
}

export function createProposalsService(deps: AppDeps) {
  const repo = createProposalsRepository(deps.prisma)
  const { env, storage } = deps

  function guideMessage(r: ProposalRow): EmailMessage {
    const rendered = guideProposalEmail({
      reference: r.reference,
      company: r.company,
      contactPerson: r.contactPerson,
      email: r.email,
      phone: r.phone,
      groupSize: r.groupSize,
      dates: r.dates,
      eventType: r.eventType,
      logistics: r.logistics,
      message: r.message,
      attachmentUrl: r.attachment ? `${env.FRONTEND_URL.replace(/\/$/, '')}${downloadPath(r.id)}` : null,
      attachmentName: r.attachment?.originalName ?? null,
      adminUrl: siteUrl(env.FRONTEND_URL, 'en', `/admin/proposals?id=${encodeURIComponent(r.id)}`),
    })
    return { ...rendered, to: env.GUIDE_NOTIFY_EMAIL, replyTo: r.email }
  }

  async function visitorMessage(r: ProposalRow): Promise<EmailMessage> {
    const rendered = visitorConfirmationEmail({
      reference: r.reference,
      name: r.contactPerson,
      whatsappNumber: await repo.contactWhatsapp(),
      siteUrl: env.FRONTEND_URL,
      kind: 'proposal',
    })
    return { ...rendered, to: r.email }
  }

  /**
   * The proposal itself is already saved; if the file cannot be stored the request is kept anyway
   * and a note asks the guide to request the file by email.
   */
  async function storeAttachment(
    p: { id: string; reference: string; createdAt: Date },
    file: RawAttachment,
    type: { mime: string; ext: string },
    log: FastifyBaseLogger,
  ) {
    const key = `${PRIVATE_PREFIX}proposals/${p.createdAt.getUTCFullYear()}/${p.reference}-${randomBytes(9).toString('base64url')}.${type.ext}`
    try {
      const stored = await storage.put(key, file.buffer, type.mime)
      try {
        await repo.attachFile(p.id, {
          key,
          url: stored.url,
          mime: type.mime,
          size: file.buffer.length,
          originalName: cleanFilename(file.filename, type.ext),
        })
      } catch (err) {
        await storage.delete(key).catch(() => undefined)
        throw err
      }
    } catch (err) {
      log.error({ proposalId: p.id, reference: p.reference, err: errorMessage(err) }, 'proposal attachment could not be stored')
      await repo.update(p.id, { internalNotes: ATTACHMENT_FAILED_NOTE }).catch(() => undefined)
    }
  }

  const service = {
    async submit(form: RawProposalForm, ctx: RequestContext): Promise<ProposalResultT> {
      const fields = parseFields(form)
      if (fields.website && fields.website.trim() !== '') {
        ctx.log.info('proposal honeypot triggered; submission discarded')
        return { reference: fakeReference('proposal'), message: PROPOSAL_THANK_YOU }
      }
      await verifyTurnstile(env.TURNSTILE_SECRET, fields.turnstileToken, ctx.ip)
      const fileType = form.attachment ? checkAttachment(form.attachment) : null

      const created = await repo.create({
        company: fields.company,
        contactPerson: fields.contactPerson,
        email: fields.email,
        phone: fields.phone,
        groupSize: fields.groupSize,
        dates: fields.dates,
        eventType: fields.eventType,
        logistics: fields.logistics,
        message: fields.message ?? null,
        sourcePage: fields.sourcePage ?? null,
        locale: fields.locale,
      })
      ctx.log.info({ proposalId: created.id, reference: created.reference }, 'corporate proposal saved')

      if (form.attachment && fileType) await storeAttachment(created, form.attachment, fileType, ctx.log)

      runAfterResponse(ctx.log, { proposalId: created.id, reference: created.reference }, () =>
        service.sendMissingEmails(created.id, ctx.log),
      )
      return { reference: created.reference, message: PROPOSAL_THANK_YOU }
    },

    /** See InquiriesService.sendMissingEmails — same contract for proposals. */
    async sendMissingEmails(id: string, log: FastifyBaseLogger): Promise<LeadEmailStatus | null> {
      const result = await withLeadLock(`proposal:${id}`, async () => {
        const row = await repo.findById(id)
        if (!row) return null
        const patch = await deliverMissingEmails(deps.email, row, {
          guide: () => guideMessage(row),
          visitor: () => visitorMessage(row),
        })
        if (!patch) return row.emailStatus
        await repo.updateEmailState(id, patch)
        const logData = { proposalId: id, reference: row.reference, emailStatus: patch.emailStatus, attempt: patch.emailAttempts }
        if (patch.emailStatus === 'sent') log.info(logData, 'proposal emails sent')
        else log.warn({ ...logData, error: patch.lastEmailError }, 'proposal emails not fully delivered')
        return patch.emailStatus
      })
      return result ?? null
    },

    emailRetryIds: (opts: { createdAfter: Date; createdBefore: Date; maxAttempts: number; take: number }) =>
      repo.findEmailRetryIds(opts).then((rows) => rows.map((r) => r.id)),

    // ---------------------------------------------------------------- admin

    async adminList(q: AdminProposalsQueryT) {
      const { skip, take } = toSkipTake(q)
      const [[rows, total], groups] = await Promise.all([
        repo.list(buildWhere(q), skip, take),
        repo.countByStatus(buildWhere(q, { ignoreStatus: true })),
      ])
      return { items: rows.map(toListItem), meta: pageMeta(q, total), counts: countsFrom(groups) }
    },

    async adminGet(id: string): Promise<AdminProposal> {
      const row = await repo.findById(id)
      if (!row) throw notFound('Proposal')
      return toAdmin(row)
    },

    async update(id: string, body: ProposalUpdateBodyT): Promise<AdminProposal> {
      if (!(await repo.exists(id))) throw notFound('Proposal')
      const data: { status?: ProposalUpdateBodyT['status']; internalNotes?: string | null } = {}
      if (body.status) data.status = body.status
      if (body.internalNotes !== undefined) data.internalNotes = body.internalNotes?.trim() || null
      return toAdmin(await repo.update(id, data))
    },

    /** Deletes the proposal, its Media row and the stored file. */
    async remove(id: string, log: FastifyBaseLogger) {
      if (!(await repo.exists(id))) throw notFound('Proposal')
      const key = await repo.delete(id)
      if (key) {
        await storage
          .delete(key)
          .catch((err: unknown) => log.warn({ proposalId: id, err: errorMessage(err) }, 'attachment file could not be deleted'))
      }
    },

    async resendEmails(id: string, log: FastifyBaseLogger): Promise<AdminProposal> {
      if (!(await repo.exists(id))) throw notFound('Proposal')
      await service.sendMissingEmails(id, log)
      return service.adminGet(id)
    },

    /** The stored brief for the authenticated download endpoint. */
    async attachment(id: string) {
      const row = await repo.findById(id)
      if (!row) throw notFound('Proposal')
      if (!row.attachment) throw notFound('Attachment')
      const file = await storage.get(row.attachment.key)
      if (!file) throw notFound('Attachment')
      const ext = row.attachment.mime === 'application/pdf' ? 'pdf' : 'docx'
      return {
        body: file.body,
        contentType: row.attachment.mime,
        size: file.size ?? row.attachment.size,
        filename: row.attachment.originalName ?? `${row.reference}.${ext}`,
      }
    },

    async exportCsv(filters: ProposalFilters): Promise<string> {
      const rows = await repo.listForExport(buildWhere(filters))
      return toCsv(
        [
          'Reference', 'Received (UTC)', 'Status', 'Company', 'Contact person', 'Email', 'Phone', 'Group size',
          'Dates', 'Event type', 'Logistics', 'Brief', 'Attachment', 'Source page', 'Language', 'Email status',
          'Internal notes',
        ],
        rows.map((r) => [
          r.reference,
          r.createdAt,
          r.status,
          r.company,
          r.contactPerson,
          r.email,
          r.phone,
          r.groupSize,
          r.dates,
          r.eventType,
          r.logistics.join('; '),
          r.message,
          r.attachment?.originalName ?? (r.attachment ? 'yes' : null),
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

export type ProposalsService = ReturnType<typeof createProposalsService>
