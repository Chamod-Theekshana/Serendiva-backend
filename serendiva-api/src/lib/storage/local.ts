import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { StorageDriver } from './types'

/**
 * Writes files under UPLOAD_DIR. Files are served by @fastify/static at /uploads/<key>
 * (except keys under "private/", which the static route refuses).
 */
export function createLocalStorage(opts: { uploadDir: string; publicBaseUrl: string }): StorageDriver {
  const root = path.resolve(opts.uploadDir)
  const safePath = (key: string) => {
    const full = path.resolve(root, key)
    if (!full.startsWith(root + path.sep)) throw new Error('Invalid storage key')
    return full
  }
  const urlFor = (key: string) => `${opts.publicBaseUrl.replace(/\/$/, '')}/uploads/${key}`
  return {
    name: 'local',
    async put(key, body) {
      const full = safePath(key)
      await fs.mkdir(path.dirname(full), { recursive: true })
      await fs.writeFile(full, body)
      return { key, url: urlFor(key) }
    },
    async get(key) {
      const full = safePath(key)
      try {
        const stat = await fs.stat(full)
        if (!stat.isFile()) return null
        return { body: createReadStream(full), size: stat.size }
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
        throw err
      }
    },
    async delete(key) {
      try {
        await fs.unlink(safePath(key))
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
      }
    },
    urlFor,
  }
}
