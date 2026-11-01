import type { Env } from '@/config/env'
import { createLocalStorage } from './local'
import { createS3Storage } from './s3'
import type { StorageDriver } from './types'

export function createStorage(env: Env): StorageDriver {
  if (env.STORAGE_DRIVER === 's3') {
    return createS3Storage({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET!,
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      publicUrl: env.S3_PUBLIC_URL!,
    })
  }
  return createLocalStorage({ uploadDir: env.UPLOAD_DIR, publicBaseUrl: env.API_PUBLIC_URL })
}

export { PRIVATE_PREFIX, isPrivateKey } from './types'
export type { StorageDriver, StoredFile, StoredObject } from './types'
