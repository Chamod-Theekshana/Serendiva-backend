import { randomUUID } from 'node:crypto'
import path from 'node:path'
import Fastify, { type FastifyServerOptions } from 'fastify'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import type { Env } from '@/config/env'
import type { AppDeps } from '@/types'
import { createPrisma } from '@/lib/prisma'
import { createEmailService, type EmailProvider } from '@/lib/email'
import { createStorage, type StorageDriver } from '@/lib/storage'
import { createRevalidator, type Revalidator } from '@/lib/revalidate'
import type { PrismaClient } from '@/generated/prisma/client'
import errorHandler from '@/plugins/error-handler'
import security from '@/plugins/security'
import swaggerPlugin from '@/plugins/swagger'
import authPlugin from '@/plugins/auth'
import httpCache from '@/plugins/http-cache'
import healthRoutes from '@/modules/health/health.routes'
import { publicModules, adminModules } from '@/modules'

export interface BuildAppOptions {
  env: Env
  prisma?: PrismaClient
  emailProvider?: EmailProvider
  storage?: StorageDriver
  revalidator?: Revalidator
  logger?: FastifyServerOptions['logger']
}

/**
 * TRUST_PROXY=<n> trusts exactly n proxy hops: request.ip becomes the address the outermost trusted
 * proxy saw, which a client cannot forge. (Fastify ignores plain numbers, so this is a trust function.)
 * Only correct when the API is reachable exclusively through those proxies, as on Render/Railway/Fly.
 */
function trustProxyOption(value: Env['TRUST_PROXY']): FastifyServerOptions['trustProxy'] {
  if (typeof value !== 'number') return value
  return (_address: string, hop: number) => hop < value
}

export async function buildApp(opts: BuildAppOptions) {
  const { env } = opts

  const app = Fastify({
    logger: opts.logger ?? {
      level: env.LOG_LEVEL,
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        censor: '[redacted]',
      },
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
    trustProxy: trustProxyOption(env.TRUST_PROXY),
    bodyLimit: 1_048_576,
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  const prisma = opts.prisma ?? createPrisma(env.DATABASE_URL)
  const deps: AppDeps = {
    env,
    prisma,
    email: createEmailService(env, app.log, opts.emailProvider),
    storage: opts.storage ?? createStorage(env),
    revalidator:
      opts.revalidator ??
      createRevalidator({
        frontendUrl: env.FRONTEND_URL,
        secret: env.REVALIDATE_SECRET,
        disabled: env.REVALIDATE_DISABLED,
        log: app.log,
      }),
  }
  app.decorate('deps', deps)

  app.addHook('onSend', async (req, reply) => {
    reply.header('x-request-id', req.id)
  })
  app.addHook('onClose', async () => {
    if (!opts.prisma) await prisma.$disconnect()
  })

  await app.register(errorHandler)
  await app.register(security)
  await app.register(httpCache)
  await app.register(authPlugin)
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024, files: 20, fields: 40, fieldSize: 100_000 },
  })
  if (deps.storage.name === 'local') {
    await app.register(fastifyStatic, {
      root: path.resolve(env.UPLOAD_DIR),
      prefix: '/uploads/',
      decorateReply: false,
      immutable: true,
      maxAge: '365d',
      // Files under "private/" (proposal attachments) are only downloadable via authenticated admin routes.
      allowedPath: (pathName) => !/^\/*private(\/|$)/i.test(pathName.replace(/\\/g, '/')),
    })
  }
  await app.register(swaggerPlugin)

  await app.register(healthRoutes)

  await app.register(
    async (api) => {
      for (const mod of publicModules) await api.register(mod.plugin, { prefix: mod.prefix })
    },
    { prefix: '/api/v1' },
  )

  await app.register(
    async (admin) => {
      for (const mod of adminModules) await admin.register(mod.plugin, { prefix: mod.prefix })
    },
    { prefix: '/api/v1/admin' },
  )

  return app
}

export type App = Awaited<ReturnType<typeof buildApp>>
