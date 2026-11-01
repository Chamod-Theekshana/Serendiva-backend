export interface StoredObject {
  key: string
  url: string
}

/** A stored file read back for streaming (e.g. private proposal attachments). */
export interface StoredFile {
  body: Buffer | NodeJS.ReadableStream
  contentType?: string
  size?: number
}

/** Storage abstraction: local disk for development, S3-compatible (R2/S3) in production. */
export interface StorageDriver {
  readonly name: 'local' | 's3'
  put(key: string, body: Buffer, contentType: string): Promise<StoredObject>
  /** Read a stored object; resolves to null when the key does not exist. */
  get(key: string): Promise<StoredFile | null>
  delete(key: string): Promise<void>
  urlFor(key: string): string
}

/**
 * Keys under this prefix hold non-public files (e.g. corporate proposal attachments). They are never
 * served by the public /uploads route and are only downloadable through authenticated admin endpoints.
 */
export const PRIVATE_PREFIX = 'private/'

export const isPrivateKey = (key: string) => key.replace(/^\/+/, '').toLowerCase().startsWith(PRIVATE_PREFIX)
