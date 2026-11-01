import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { toCsv } from '@/lib/csv'
import { createAdmin } from './factories'
import { buildTestApp, login, multipart, waitFor, type Session, type TestContext } from './helpers'

/** Minimal RFC 4180 reader used to round-trip the exports. */
function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\r' && text[i + 1] === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      i++
    } else cell += ch
  }
  if (cell || row.length) rows.push([...row, cell])
  return rows
}

describe('toCsv', () => {
  it('quotes, escapes and neutralises spreadsheet formulas', () => {
    const csv = toCsv(
      ['Name', 'Note', 'When', 'Count', 'Empty'],
      [
        ['Plain', 'a, b', new Date('2026-10-05T08:00:00.000Z'), 3, null],
        ['=SUM(A1:A9)', 'He said "hi"\nthen left', undefined, -5, ''],
        ['+cmd', '@import', '-1', '\tTabbed', 'ok'],
      ],
    )
    expect(csv.startsWith('\uFEFF')).toBe(true) // BOM for Excel
    expect(csv.endsWith('\r\n')).toBe(true)
    expect(csv).toContain('"a, b"')
    expect(csv).toContain(`"He said ""hi""\nthen left"`)
    expect(parseCsv(csv)).toEqual([
      ['Name', 'Note', 'When', 'Count', 'Empty'],
      ['Plain', 'a, b', '2026-10-05T08:00:00.000Z', '3', ''],
      ["'=SUM(A1:A9)", 'He said "hi"\nthen left', '', "'-5", ''],
      ["'+cmd", "'@import", "'-1", "'\tTabbed", 'ok'],
    ])
  })
})

describe('admin CSV exports', () => {
  let ctx: TestContext
  let session: Session

  beforeAll(async () => {
    ctx = await buildTestApp()
    await createAdmin(ctx.app.deps.prisma)
    session = await login(ctx.app)
  })
  afterAll(async () => {
    await ctx.close()
  })

  it('inquiries export escapes user input and is a private attachment', async () => {
    const evilName = '=HYPERLINK("http://evil.example","click me")'
    const message = 'Line one, with a comma\nLine "two" — 中文 · Zürich'
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/inquiries',
      payload: { name: evilName, email: 'csv@example.com', country: 'Österreich', message, interests: ['Tea', 'Surf'] },
    })
    expect(res.statusCode).toBe(201)
    const { reference } = res.json<{ reference: string }>()
    await waitFor(async () => (await ctx.app.deps.prisma.inquiry.findUnique({ where: { reference } }))?.emailStatus === 'sent')
    await ctx.app.deps.prisma.inquiry.update({ where: { reference }, data: { internalNotes: '@admin: call back' } })

    const csv = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/inquiries/export.csv', cookies: session.cookies })
    expect(csv.statusCode).toBe(200)
    expect(csv.headers['content-type']).toBe('text/csv; charset=utf-8')
    expect(csv.headers['content-disposition']).toMatch(/^attachment; filename="inquiries-\d{4}-\d{2}-\d{2}\.csv"$/)
    expect(csv.headers['cache-control']).toBe('no-store')

    const [header, ...rows] = parseCsv(csv.body)
    const col = (name: string) => header!.indexOf(name)
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(row[col('Reference')]).toBe(reference)
    expect(row[col('Name')]).toBe(`'${evilName}`)
    expect(row[col('Message')]).toBe(message)
    expect(row[col('Country')]).toBe('Österreich')
    expect(row[col('Interests')]).toBe('Tea; Surf')
    expect(row[col('Internal notes')]).toBe("'@admin: call back")
    expect(row[col('Email status')]).toBe('sent')
  })

  it('export filters match the list filters', async () => {
    const none = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/inquiries/export.csv?status=closed', cookies: session.cookies })
    expect(parseCsv(none.body)).toHaveLength(1) // header only
  })

  it('proposals export', async () => {
    const { payload, headers } = await multipart({
      company: '"Quoted" Company, Ltd',
      contactPerson: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+94 77 123 4567',
      groupSize: '20',
      dates: 'May 2027',
      eventType: 'Offsite',
    })
    expect((await ctx.app.inject({ method: 'POST', url: '/api/v1/corporate-proposals', payload, headers })).statusCode).toBe(201)
    const csv = await ctx.app.inject({ method: 'GET', url: '/api/v1/admin/proposals/export.csv', cookies: session.cookies })
    expect(csv.statusCode).toBe(200)
    const [header, row] = parseCsv(csv.body)
    expect(row?.[header!.indexOf('Company')]).toBe('"Quoted" Company, Ltd')
  })
})
