import { DeleteObjectCommand, GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { isPrivateKey, type StorageDriver } from './types'

/** Works with AWS S3 and S3-compatible services such as Cloudflare R2. */
export function createS3Storage(opts: {
  endpoint?: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  publicUrl: string
}): StorageDriver {
  const client = new S3Client({
    region: opts.region,
    endpoint: opts.endpoint || undefined,
    forcePathStyle: Boolean(opts.endpoint),
    credentials: { accessKeyId: opts.accessKeyId, secretAccessKey: opts.secretAccessKey },
  })
  const urlFor = (key: string) => `${opts.publicUrl.replace(/\/$/, '')}/${key}`
  return {
    name: 's3',
    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: opts.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          // Private files must never be kept by shared caches / CDNs.
          CacheControl: isPrivateKey(key) ? 'private, no-store' : 'public, max-age=31536000, immutable',
        }),
      )
      return { key, url: urlFor(key) }
    },
    async get(key) {
      try {
        const res = await client.send(new GetObjectCommand({ Bucket: opts.bucket, Key: key }))
        if (!res.Body) return null
        return {
          body: res.Body as NodeJS.ReadableStream,
          contentType: res.ContentType,
          size: res.ContentLength,
        }
      } catch (err) {
        if (err instanceof NoSuchKey || (err as { name?: string }).name === 'NoSuchKey') return null
        throw err
      }
    },
    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket: opts.bucket, Key: key }))
    },
    urlFor,
  }
}
