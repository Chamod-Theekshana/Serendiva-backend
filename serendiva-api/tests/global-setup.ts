import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import pg from 'pg'
import { TEST_DATABASE_URL, assertTestDatabase } from './test-db'

/**
 * Runs once before the whole suite (in the main Vitest process).
 *
 * Resets the test database by dropping and recreating the `public` schema, then applies every
 * prisma/migrations/<timestamp>_<name>/migration.sql in order with plain `pg`. We deliberately do
 * not shell out to the Prisma CLI: its native schema engine cannot be downloaded in every
 * environment, while this works anywhere a Postgres connection is available (laptop, CI, sandbox).
 */
export async function setup(): Promise<void> {
  assertTestDatabase(TEST_DATABASE_URL)

  const migrationsDir = path.resolve(import.meta.dirname, '..', 'prisma', 'migrations')
  const entries = await readdir(migrationsDir, { withFileTypes: true })
  // Prisma names migration folders "<UTC timestamp>_<name>", so lexical order is chronological order.
  const folders = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  const client = new pg.Client({ connectionString: TEST_DATABASE_URL })
  await client.connect()
  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE')
    await client.query('CREATE SCHEMA public')
    for (const folder of folders) {
      const file = path.join(migrationsDir, folder, 'migration.sql')
      const sql = await readFile(file, 'utf8').catch(() => null)
      if (sql === null) continue
      try {
        // Migrations contain several statements; the simple query protocol runs them as one batch.
        await client.query(sql)
      } catch (err) {
        throw new Error(`Applying ${folder}/migration.sql to the test database failed: ${(err as Error).message}`)
      }
    }
  } finally {
    await client.end()
  }
}
