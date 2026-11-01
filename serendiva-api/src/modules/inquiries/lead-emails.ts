import type { FastifyBaseLogger } from 'fastify'
import type { EmailMessage, EmailService } from '@/lib/email'
import { errorMessage } from './lead-helpers'

/**
 * Email delivery for leads (inquiries and corporate proposals).
 *
 * Every lead triggers two emails: a notification to the guide and a confirmation to the visitor.
 * The lead is always saved first; delivery happens afterwards and its outcome is recorded on the
 * row (guideEmailSentAt, visitorEmailSentAt, emailAttempts, lastEmailError, emailStatus) so the
 * retry job and the admin "resend" action only send what is still missing.
 */

export type LeadEmailStatus = 'pending' | 'sent' | 'partial' | 'failed'

/** The retry job gives up after this many attempts (the admin can still resend manually). */
export const MAX_EMAIL_ATTEMPTS = 5

export interface LeadEmailState {
  guideEmailSentAt: Date | null
  visitorEmailSentAt: Date | null
  emailAttempts: number
}

export interface LeadEmailPatch extends LeadEmailState {
  lastEmailError: string | null
  emailStatus: LeadEmailStatus
}

export function emailStatusOf(guideSentAt: Date | null, visitorSentAt: Date | null): LeadEmailStatus {
  if (guideSentAt && visitorSentAt) return 'sent'
  if (guideSentAt || visitorSentAt) return 'partial'
  return 'failed'
}

/**
 * Send whichever of the two emails has not been delivered yet. Provider errors are captured (never
 * thrown) and returned as the patch to store; returns null when there was nothing left to send.
 */
export async function deliverMissingEmails(
  email: EmailService,
  state: LeadEmailState,
  build: { guide: () => Promise<EmailMessage> | EmailMessage; visitor: () => Promise<EmailMessage> | EmailMessage },
): Promise<LeadEmailPatch | null> {
  if (state.guideEmailSentAt && state.visitorEmailSentAt) return null

  const errors: string[] = []
  let guideEmailSentAt = state.guideEmailSentAt
  let visitorEmailSentAt = state.visitorEmailSentAt

  if (!guideEmailSentAt) {
    try {
      await email.send(await build.guide())
      guideEmailSentAt = new Date()
    } catch (err) {
      errors.push(`guide: ${errorMessage(err)}`)
    }
  }
  if (!visitorEmailSentAt) {
    try {
      await email.send(await build.visitor())
      visitorEmailSentAt = new Date()
    } catch (err) {
      errors.push(`visitor: ${errorMessage(err)}`)
    }
  }

  return {
    guideEmailSentAt,
    visitorEmailSentAt,
    emailAttempts: state.emailAttempts + 1,
    lastEmailError: errors.length ? errors.join(' | ') : null,
    emailStatus: emailStatusOf(guideEmailSentAt, visitorEmailSentAt),
  }
}

// Single process: an in-memory lock stops the after-response send, the retry job and the admin
// "resend" action from emailing the same lead twice at the same time.
const inFlight = new Set<string>()

/** Run `fn` unless another delivery for the same lead is running; resolves to undefined if skipped. */
export async function withLeadLock<T>(key: string, fn: () => Promise<T>): Promise<T | undefined> {
  if (inFlight.has(key)) return undefined
  inFlight.add(key)
  try {
    return await fn()
  } finally {
    inFlight.delete(key)
  }
}

/**
 * Start a task once the current request has been answered (setImmediate runs after the reply is
 * written). Errors are logged with the given context only — never with the form contents.
 */
export function runAfterResponse(log: FastifyBaseLogger, context: Record<string, string>, task: () => Promise<unknown>) {
  setImmediate(() => {
    task().catch((err: unknown) => log.error({ ...context, err: errorMessage(err) }, 'background email delivery failed'))
  })
}
