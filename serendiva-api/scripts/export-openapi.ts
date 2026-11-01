/**
 * Writes the OpenAPI document (the same one served at GET /openapi.json) to a file, without starting
 * the server or touching the database — the Next.js app generates its typed client from it.
 *
 * PowerShell:
 *   npm run openapi:export                      -> ./openapi.json
 *   npm run openapi:export -- ..\web\openapi.json
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from '@/config/env'
import { buildApp } from '@/app'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, 'openapi.json')

const env = loadEnv()
// Prisma connects lazily, so building the app does not need a reachable database.
const app = await buildApp({ env, logger: false })
try {
  await app.ready()
  const spec = app.swagger()
  await writeFile(target, `${JSON.stringify(spec, null, 2)}\n`, 'utf8')
  const paths = Object.keys(spec.paths ?? {}).length
  const schemas = 'components' in spec ? Object.keys(spec.components?.schemas ?? {}).length : 0
  console.info(`OpenAPI spec written to ${target} (${paths} paths, ${schemas} schemas)`)
} finally {
  await app.close()
}
