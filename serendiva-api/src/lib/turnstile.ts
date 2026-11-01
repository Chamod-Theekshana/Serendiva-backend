import { badRequest } from './errors'

/**
 * Optional Cloudflare Turnstile verification. When TURNSTILE_SECRET is not configured this is a no-op.
 */
export async function verifyTurnstile(secret: string | undefined, token: string | undefined, ip?: string) {
  if (!secret) return
  if (!token) throw badRequest('Please complete the anti-spam check')
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const data = (await res.json()) as { success?: boolean }
    if (!data.success) throw badRequest('Anti-spam check failed, please try again')
  } catch (err) {
    if (err instanceof Error && err.name === 'AppError') throw err
    throw badRequest('Anti-spam check could not be verified, please try again')
  }
}
