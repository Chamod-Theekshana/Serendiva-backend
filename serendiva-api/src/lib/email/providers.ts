import fs from 'node:fs/promises'
import path from 'node:path'
import { Resend } from 'resend'
import type { FastifyBaseLogger } from 'fastify'
import type { EmailProvider } from './types'

export function createResendProvider(apiKey: string): EmailProvider {
  const resend = new Resend(apiKey)
  return {
    name: 'resend',
    async send(msg) {
      const { data, error } = await resend.emails.send({
        from: msg.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        replyTo: msg.replyTo,
      })
      if (error) throw new Error(`Resend error: ${error.message}`)
      return { id: data?.id }
    },
  }
}

/**
 * Development provider: logs a one-line summary and writes the HTML to tmp/emails so you can open it
 * in a browser. Never use in production.
 */
export function createConsoleProvider(log: FastifyBaseLogger, outDir = 'tmp/emails'): EmailProvider {
  return {
    name: 'console',
    async send(msg) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      try {
        await fs.mkdir(outDir, { recursive: true })
        await fs.writeFile(path.join(outDir, `${id}.html`), msg.html, 'utf8')
      } catch {
        // writing the preview is best-effort
      }
      log.info({ to: msg.to, subject: msg.subject, preview: `${outDir}/${id}.html` }, '[email:console] message captured')
      return { id }
    },
  }
}
