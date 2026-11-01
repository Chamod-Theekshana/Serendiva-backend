export interface EmailMessage {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}

/** Swap-able transport. Add an SMTP provider (e.g. nodemailer) by implementing this interface. */
export interface EmailProvider {
  readonly name: string
  send(message: EmailMessage & { from: string }): Promise<{ id?: string }>
}
