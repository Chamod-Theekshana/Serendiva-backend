import { existsSync } from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdmin } from './factories'
import { buildTestApp, login, multipart, waitFor, type ErrorBody, type Session, type TestContext, type UploadFile } from './helpers'

let ctx: TestContext
let session: Session

const YEAR = new Date().getUTCFullYear()
const GUIDE = 'guide@serendiva.test'
const CONTACT = 'events@acme-corp.example'
const URL = '/api/v1/corporate-proposals'

const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n')
// Minimal ZIP local-file header naming the parts a .docx contains (enough for magic-byte sniffing).
const DOCX = Buffer.concat([
  Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00]),
  Buffer.from('[Content_Types].xml word/document.xml'),
  Buffer.alloc(64),
])

const fields = (over: Record<string, string | string[]> = {}) => ({
  company: 'Acme Corp',
  contactPerson: 'Jane Doe',
  email: CONTACT,
  phone: '+44 20 7946 0000',
  groupSize: '25–40 guests',
  dates: 'March 2027, 5 days',
  eventType: 'Incentive trip',
  logistics: ['Airport transfers', 'Meeting room'],
  message: 'Team retreat with one gala dinner.',
  locale: 'en',
  ...over,
})

async function send(f: Record<string, string | string[]>, files: UploadFile[] = []) {
  const { payload, headers } = await multipart(f, files)
  return ctx.app.inject({ method: 'POST', url: URL, payload, headers })
}

const pdfFile = (content = PDF, filename = 'Event brief.pdf', type = 'application/pdf'): UploadFile => ({
  field: 'attachment',
  filename,
  content,
  type,
})

const proposalByRef = (reference: string) =>
  ctx.app.deps.prisma.corporateProposal.findUnique({ where: { reference }, include: { attachment: true } })

beforeAll(async () => {
  ctx = await buildTestApp()
  await createAdmin(ctx.app.deps.prisma)
  session = await login(ctx.app)
})
afterAll(async () => {
  await ctx.close()
})
beforeEach(() => {
  ctx.email.reset()
})

describe('POST /api/v1/corporate-proposals (multipart)', () => {
  it('saves a proposal with a PDF brief and emails guide + contact', async () => {
    const res = await send(fields(), [pdfFile()])
    expect(res.statusCode).toBe(201)
    const { reference } = res.json<{ reference: string; message: string }>()
    expect(reference).toMatch(new RegExp(`^SRD-C-${YEAR}-\\d{4}$`))

    const row = await proposalByRef(reference)
    expect(row).toMatchObject({ company: 'Acme Corp', email: CONTACT, logistics: ['Airport transfers', 'Meeting room'], status: 'new' })
    expect(row?.attachment).toMatchObject({ mime: 'application/pdf', size: PDF.length, originalName: 'Event brief.pdf' })
    expect(row?.attachment?.key.startsWith('private/proposals/')).toBe(true)
    expect(existsSync(path.join(ctx.uploadDir, row!.attachment!.key))).toBe(true)

    await waitFor(() => ctx.email.messages.length >= 2, { message: 'proposal emails' })
    const [guide] = ctx.email.to(GUIDE)
    expect(guide?.replyTo).toBe(CONTACT)
    expect(guide?.subject).toBe(`Corporate proposal request ${reference} — Acme Corp`)
    expect(guide?.html).toContain(`/api/v1/admin/proposals/${row!.id}/attachment`)
    expect(ctx.email.to(CONTACT)[0]?.subject).toContain(reference)
  })

  it('accepts a DOCX brief and no brief at all', async () => {
    const docx = await send(fields(), [{ field: 'attachment', filename: 'brief.docx', content: DOCX }])
    expect(docx.statusCode).toBe(201)
    const withDocx = await proposalByRef(docx.json<{ reference: string }>().reference)
    expect(withDocx?.attachment?.mime).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    const none = await send(fields())
    expect(none.statusCode).toBe(201)
    expect((await proposalByRef(none.json<{ reference: string }>().reference))?.attachment).toBeNull()
  })

  it('rejects a file that only pretends to be a PDF (magic bytes) with 415', async () => {
    const before = await ctx.app.deps.prisma.corporateProposal.count()
    const fake = Buffer.from('MZ\x90\x00 this is really an executable, not a PDF document at all')
    const res = await send(fields(), [pdfFile(fake, 'invoice.pdf', 'application/pdf')])
    expect(res.statusCode).toBe(415)
    expect(res.json<ErrorBody>().error).toMatchObject({
      code: 'UNSUPPORTED_MEDIA_TYPE',
      details: [{ path: 'attachment', message: 'Only PDF or DOCX files are accepted' }],
    })
    expect(await ctx.app.deps.prisma.corporateProposal.count()).toBe(before)
  })

  it('rejects an attachment over 5 MB with 413', async () => {
    const big = Buffer.concat([PDF, Buffer.alloc(5 * 1024 * 1024)])
    const before = await ctx.app.deps.prisma.corporateProposal.count()
    const res = await send(fields(), [pdfFile(big)])
    expect(res.statusCode).toBe(413)
    expect(res.json<ErrorBody>().error).toMatchObject({ code: 'PAYLOAD_TOO_LARGE', details: [{ path: 'attachment' }] })
    expect(await ctx.app.deps.prisma.corporateProposal.count()).toBe(before)
  })

  it('validates the text fields with the standard error shape', async () => {
    const res = await send({ company: 'A', email: 'nope' })
    expect(res.statusCode).toBe(400)
    const err = res.json<ErrorBody>().error
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.details?.map((d) => d.path)).toEqual(
      expect.arrayContaining(['company', 'contactPerson', 'email', 'phone', 'groupSize', 'dates', 'eventType']),
    )
  })

  it('requires multipart/form-data', async () => {
    const res = await ctx.app.inject({ method: 'POST', url: URL, payload: fields() })
    expect(res.statusCode).toBe(415)
  })

  it('honeypot: pretends success and stores nothing', async () => {
    const before = await ctx.app.deps.prisma.corporateProposal.count()
    const media = await ctx.app.deps.prisma.media.count()
    const res = await send(fields({ website: 'spam' }), [pdfFile()])
    expect(res.statusCode).toBe(201)
    expect(res.json<{ reference: string }>().reference).toMatch(/^SRD-C-\d{4}-\d{4}$/)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(await ctx.app.deps.prisma.corporateProposal.count()).toBe(before)
    expect(await ctx.app.deps.prisma.media.count()).toBe(media)
    expect(ctx.email.messages).toHaveLength(0)
  })
})

describe('private attachments', () => {
  it('are never served by the public /uploads route, only by the admin download', async () => {
    const res = await send(fields(), [pdfFile()])
    const row = await proposalByRef(res.json<{ reference: string }>().reference)
    const key = row!.attachment!.key

    // A public image-style URL for the same file must not work, however it is spelled.
    const variants = [
      `/uploads/${key}`,
      `/uploads/${key.replace('private/', 'PRIVATE/')}`,
      `/uploads//${key}`,
      `/uploads/media/../${key}`,
      `/uploads/media/%2e%2e/${key}`,
      `/uploads/%70rivate/${key.slice('private/'.length)}`,
    ]
    for (const url of variants) {
      const pub = await ctx.app.inject({ method: 'GET', url })
      expect(pub.statusCode, url).toBeGreaterThanOrEqual(400)
      expect(pub.body, url).not.toContain('%PDF')
    }

    const anonymous = await ctx.app.inject({ method: 'GET', url: `/api/v1/admin/proposals/${row!.id}/attachment` })
    expect(anonymous.statusCode).toBe(401)

    const download = await ctx.app.inject({
      method: 'GET',
      url: `/api/v1/admin/proposals/${row!.id}/attachment`,
      cookies: session.cookies,
    })
    expect(download.statusCode).toBe(200)
    expect(download.headers['content-type']).toBe('application/pdf')
    expect(download.headers['content-disposition']).toBe('attachment; filename="Event brief.pdf"')
    expect(download.headers['cache-control']).toBe('private, no-store')
    expect(download.rawPayload.equals(PDF)).toBe(true)
  })

  it('deleting the proposal removes the stored file', async () => {
    const res = await send(fields(), [pdfFile()])
    const row = await proposalByRef(res.json<{ reference: string }>().reference)
    const file = path.join(ctx.uploadDir, row!.attachment!.key)
    expect(existsSync(file)).toBe(true)

    const del = await ctx.app.inject({ method: 'DELETE', url: `/api/v1/admin/proposals/${row!.id}`, cookies: session.cookies })
    expect(del.statusCode).toBe(204)
    expect(existsSync(file)).toBe(false)
    expect(await ctx.app.deps.prisma.media.findUnique({ where: { id: row!.attachment!.id } })).toBeNull()
  })

  it('admin detail exposes a download path, never the storage URL', async () => {
    const res = await send(fields(), [pdfFile()])
    const row = await proposalByRef(res.json<{ reference: string }>().reference)
    const detail = await ctx.app.inject({ method: 'GET', url: `/api/v1/admin/proposals/${row!.id}`, cookies: session.cookies })
    expect(detail.statusCode).toBe(200)
    expect(detail.json()).toMatchObject({
      attachment: { originalName: 'Event brief.pdf', mime: 'application/pdf', downloadPath: `/api/v1/admin/proposals/${row!.id}/attachment` },
    })
    expect(detail.body).not.toContain(row!.attachment!.key)
  })
})
