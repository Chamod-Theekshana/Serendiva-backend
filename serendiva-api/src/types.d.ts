import type { PrismaClient } from '@/generated/prisma/client'
import type { Env } from '@/config/env'
import type { EmailService } from '@/lib/email'
import type { StorageDriver } from '@/lib/storage'
import type { Revalidator } from '@/lib/revalidate'
import type { FastifyReply } from 'fastify'

export interface AppDeps {
  prisma: PrismaClient
  env: Env
  email: EmailService
  storage: StorageDriver
  revalidator: Revalidator
}

export interface AdminPrincipal {
  id: string
  email: string
  name: string
}

declare module 'fastify' {
  interface FastifyInstance {
    deps: AppDeps
    /** preHandler that requires a valid admin access token */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    admin?: AdminPrincipal
  }
  interface FastifyContextConfig {
    /** Adds Cache-Control + ETag to successful GET responses */
    httpCache?: { maxAge: number; swr?: number; private?: boolean }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; name: string; typ: 'access' }
    user: { sub: string; email: string; name: string; typ: 'access' }
  }
}
