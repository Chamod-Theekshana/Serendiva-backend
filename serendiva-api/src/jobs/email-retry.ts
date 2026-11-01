import type { FastifyBaseLogger, FastifyInstance } from 'fastify'
import type { AppDeps } from '@/types'
import { createInquiriesService } from '@/modules/inquiries/inquiries.service'
import { MAX_EMAIL_ATTEMPTS } from '@/modules/inquiries/lead-emails'
import { errorMessage } from '@/modules/inquiries/lead-helpers'
import { createProposalsService } from '@/modules/proposals/proposals.service'

const FIRST_RUN_DELAY_MS = 30_000
/** Leave fresh leads to the after-response send. */
const MIN_AGE_MS = 2 * 60_000
/** Give up automatically after a week (the admin can still use "resend"). */
const MAX_AGE_MS = 7 * 86_400_000
const BATCH_SIZE = 50
const TOKEN_CLEANUP_EVERY_MS = 86_400_000

export interface EmailRetrySummary {
  inquiries: { processed: number; sent: number; stillFailing: number }
  proposals: { processed: number; sent: number; stillFailing: number }
  expiredTokensDeleted: number | null
}

/**
 * One pass of the in-process retry job: re-sends missing lead emails and, once a day, deletes
 * expired refresh tokens. Exposed separately so it can be run from scripts and tests.
 */
export function createEmailRetryRunner(deps: AppDeps, log: FastifyBaseLogger) {
  const leads = [
    { name: 'inquiries', service: createInquiriesService(deps) },
    { name: 'proposals', service: createProposalsService(deps) },
  ] as const
  let lastTokenCleanup = 0

  return async function runOnce(now = Date.now()): Promise<EmailRetrySummary> {
    const summary: EmailRetrySummary = {
      inquiries: { processed: 0, sent: 0, stillFailing: 0 },
      proposals: { processed: 0, sent: 0, stillFailing: 0 },
      expiredTokensDeleted: null,
    }
    const window = {
      createdAfter: new Date(now - MAX_AGE_MS),
      createdBefore: new Date(now - MIN_AGE_MS),
      maxAttempts: MAX_EMAIL_ATTEMPTS,
      take: BATCH_SIZE,
    }

    for (const { name, service } of leads) {
      let ids: string[] = []
      try {
        ids = await service.emailRetryIds(window)
      } catch (err) {
        log.error({ err: errorMessage(err), leads: name }, 'email retry: could not load pending leads')
        continue
      }
      for (const id of ids) {
        try {
          const status = await service.sendMissingEmails(id, log)
          summary[name].processed++
          if (status === 'sent') summary[name].sent++
          else if (status) summary[name].stillFailing++
        } catch (err) {
          summary[name].stillFailing++
          log.error({ err: errorMessage(err), leads: name, id }, 'email retry: lead could not be processed')
        }
      }
    }

    if (now - lastTokenCleanup >= TOKEN_CLEANUP_EVERY_MS) {
      try {
        const { count } = await deps.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date(now) } } })
        summary.expiredTokensDeleted = count
        lastTokenCleanup = now
      } catch (err) {
        log.error({ err: errorMessage(err) }, 'email retry: expired refresh token cleanup failed')
      }
    }

    if (summary.inquiries.processed || summary.proposals.processed || summary.expiredTokensDeleted) {
      log.info(summary, 'email retry run finished')
    } else {
      log.debug(summary, 'email retry run finished (nothing to do)')
    }
    return summary
  }
}

/**
 * Starts the in-process retry loop: first run ~30 s after start, then every
 * EMAIL_RETRY_INTERVAL_MINUTES. Runs never overlap and never throw. Returns a stop function.
 */
export function startEmailRetryJob(app: FastifyInstance): () => void {
  const log = app.log.child({ job: 'email-retry' })
  const runOnce = createEmailRetryRunner(app.deps, log)
  let running = false
  let stopped = false

  const tick = async () => {
    if (running || stopped) return
    running = true
    try {
      await runOnce()
    } catch (err) {
      log.error({ err: errorMessage(err) }, 'email retry run failed')
    } finally {
      running = false
    }
  }

  const first = setTimeout(() => void tick(), FIRST_RUN_DELAY_MS)
  const interval = setInterval(() => void tick(), app.deps.env.EMAIL_RETRY_INTERVAL_MINUTES * 60_000)
  // Timers must not keep the process alive on shutdown.
  first.unref()
  interval.unref()
  log.info({ everyMinutes: app.deps.env.EMAIL_RETRY_INTERVAL_MINUTES }, 'email retry job scheduled')

  return () => {
    stopped = true
    clearTimeout(first)
    clearInterval(interval)
  }
}
