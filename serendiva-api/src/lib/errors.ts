/**
 * Application error with an HTTP status and a stable machine-readable code.
 * The central error handler turns it into: { error: { code, message, details? } }
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, 'BAD_REQUEST', message, details)
export const unauthorized = (message = 'Authentication required') => new AppError(401, 'UNAUTHORIZED', message)
export const forbidden = (message = 'Forbidden') => new AppError(403, 'FORBIDDEN', message)
export const notFound = (what = 'Resource') => new AppError(404, 'NOT_FOUND', `${what} not found`)
export const conflict = (message: string, details?: unknown) => new AppError(409, 'CONFLICT', message, details)
export const payloadTooLarge = (message: string) => new AppError(413, 'PAYLOAD_TOO_LARGE', message)
export const unsupportedMedia = (message: string) => new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', message)
export const tooManyRequests = (message = 'Too many requests, please try again later') =>
  new AppError(429, 'RATE_LIMITED', message)

/** Field-level validation error in the same shape the request validator produces. */
export const validationError = (fields: { path: string; message: string }[]) =>
  new AppError(400, 'VALIDATION_ERROR', 'Some fields are invalid', fields)
