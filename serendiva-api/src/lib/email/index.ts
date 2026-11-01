import type { FastifyBaseLogger } from 'fastify'
import type { Env } from '@/config/env'
import { createConsoleProvider, createResendProvider } from './providers'
import type { EmailMessage, EmailProvider } from './types'

export interface EmailService {
  readonly provider: string
  send(message: EmailMessage): Promise<{ id?: string }>
}

export function createEmailService(env: Env, log: FastifyBaseLogger, provider?: EmailProvider): EmailService {
  const p =
    provider ??
    (env.EMAIL_DRIVER === 'resend' && env.RESEND_API_KEY
      ? createResendProvider(env.RESEND_API_KEY)
      : createConsoleProvider(log))
  return {
    provider: p.name,
    send: (message) => p.send({ ...message, from: env.MAIL_FROM }),
  }
}

export type { EmailMessage, EmailProvider } from './types'
