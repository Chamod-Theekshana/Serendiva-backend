import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import pg from 'pg'

/** Only TEST_DATABASE_URL is taken from .env — the tests never use the rest of your local config. */
function fromDotEnv(): string | undefined {
  try {
    return parseEnv(readFileSync(path.resolve(import.meta.dirname, '..', '.env'), 'utf8')).TEST_DATABASE_URL
  } catch {
    return undefined
  }
}

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || fromDotEnv() || 'postgresql://postgres:postgres@localhost:5432/serendiva_test'

/**
 * The suite drops the whole `public` schema, so refuse to touch a database whose name does not say
 * it is a test database (protects the development database from a mistyped TEST_DATABASE_URL).
 */
export function assertTestDatabase(url: string): void {
  let name = ''
  try {
    name = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
  } catch {
    throw new Error(`TEST_DATABASE_URL is not a valid connection string: ${url}`)
  }
  if (!/test/i.test(name)) {
    throw new Error(
      `Refusing to run the test suite against database "${name}". ` +
        'TEST_DATABASE_URL must point to a dedicated database whose name contains "test" (it is wiped).',
    )
  }
}

/** Empty every application table (keeps the schema). Used before each test file. */
export async function truncateAllTables(url = TEST_DATABASE_URL): Promise<void> {
  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    const { rows } = await client.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
    )
    if (rows.length === 0) return
    const list = rows.map((r) => `"public"."${r.tablename.replace(/"/g, '""')}"`).join(', ')
    await client.query(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`)
  } finally {
    await client.end()
  }
}
