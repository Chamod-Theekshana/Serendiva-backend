import fp from 'fastify-plugin'
import type { FastifyError } from 'fastify'
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from 'fastify-type-provider-zod'
import { AppError } from '@/lib/errors'
import { Prisma } from '@/generated/prisma/client'

type ErrorBody = { error: { code: string; message: string; details?: unknown } }

const body = (code: string, message: string, details?: unknown): ErrorBody => ({
  error: details === undefined ? { code, message } : { code, message, details },
})

type KnownPrismaError = InstanceType<typeof Prisma.PrismaClientKnownRequestError>

/** Postgres error details as reported through the pg driver adapter (Prisma 7). */
function adapterCause(err: KnownPrismaError): Record<string, unknown> | undefined {
  const adapterError = (err.meta as { driverAdapterError?: { cause?: unknown } } | undefined)?.driverAdapterError
  const cause = adapterError?.cause
  return cause && typeof cause === 'object' ? (cause as Record<string, unknown>) : undefined
}

function driverMessage(err: KnownPrismaError): string {
  const original = adapterCause(err)?.originalMessage
  return typeof original === 'string' ? original : err.message
}

/**
 * Field names of a violated unique constraint. With the driver adapter Prisma only reports the
 * index name, e.g. "Tour_slug_key"; Prisma names those "<Model>_<field>[_<field>]_key".
 */
function uniqueFields(err: KnownPrismaError): string[] {
  const target = err.meta?.target
  if (Array.isArray(target)) return target.map(String)
  const constraint = adapterCause(err)?.constraint as { fields?: unknown; index?: unknown } | undefined
  if (Array.isArray(constraint?.fields)) return constraint.fields.map(String)
  const index = typeof target === 'string' ? target : typeof constraint?.index === 'string' ? constraint.index : ''
  if (!index.endsWith('_key')) return []
  const model = err.meta?.modelName
  let name = index.slice(0, -'_key'.length)
  name = typeof model === 'string' && name.startsWith(`${model}_`) ? name.slice(model.length + 1) : name.replace(/^[^_]+_/, '')
  return name.split('_').filter(Boolean)
}

/**
 * Central error handler: every error leaves the API as { error: { code, message, details? } }.
 */
export default fp(async (app) => {
  app.setErrorHandler((err: FastifyError, request, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send(body(err.code, err.message, err.details))
    }

    if (hasZodFastifySchemaValidationErrors(err)) {
      const details = err.validation.map((v) => ({
        path: (v.instancePath || '').replace(/^\//, '').replace(/\//g, '.'),
        message: v.message ?? 'Invalid value',
      }))
      return reply.status(400).send(body('VALIDATION_ERROR', 'Some fields are invalid', details))
    }

    if (isResponseSerializationError(err)) {
      request.log.error({ issues: err.cause.issues, url: request.url }, 'response did not match schema')
      return reply.status(500).send(body('INTERNAL_ERROR', 'Something went wrong on our side'))
    }

    if (err.statusCode === 429) {
      return reply.status(429).send(body('RATE_LIMITED', 'Too many requests, please wait a moment and try again'))
    }

    if (err.code === 'FST_REQ_FILE_TOO_LARGE' || err.code === 'FST_FILES_LIMIT' || err.statusCode === 413) {
      return reply.status(413).send(body('PAYLOAD_TOO_LARGE', 'The uploaded file or request is too large'))
    }

    if (err.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE' || err.statusCode === 415) {
      return reply.status(415).send(body('UNSUPPORTED_MEDIA_TYPE', 'Unsupported content type'))
    }

    if (err.code === 'FST_ERR_CTP_INVALID_JSON_BODY' || err.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') {
      return reply.status(400).send(body('BAD_REQUEST', 'Malformed JSON body'))
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const fields = uniqueFields(err)
        const what = fields.length ? fields.join(', ') : 'value'
        return reply
          .status(409)
          .send(
            body(
              'CONFLICT',
              `A record with this ${what} already exists`,
              fields.length === 1 ? [{ path: fields[0], message: 'This value is already in use' }] : undefined,
            ),
          )
      }
      if (err.code === 'P2025') return reply.status(404).send(body('NOT_FOUND', 'Resource not found'))
      if (err.code === 'P2003') {
        // The same Postgres error covers "you point at something that does not exist" (insert/update)
        // and "something still points at what you delete" (delete).
        const message = /^insert or update/i.test(driverMessage(err))
          ? 'A selected related record does not exist (it may have been deleted)'
          : 'This record is referenced by other content'
        return reply.status(409).send(body('CONFLICT', message))
      }
    }

    if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      return reply.status(err.statusCode).send(body(err.code ?? 'BAD_REQUEST', err.message))
    }

    request.log.error({ err }, 'unhandled error')
    return reply.status(500).send(body('INTERNAL_ERROR', 'Something went wrong on our side'))
  })

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send(body('NOT_FOUND', `Route ${request.method} ${request.url.split('?')[0]} not found`))
  })
})
