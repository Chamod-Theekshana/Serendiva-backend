import { beforeAll } from 'vitest'
import { TEST_DATABASE_URL, assertTestDatabase, truncateAllTables } from './test-db'

/**
 * Runs inside the test worker before every test file (vitest `setupFiles`).
 * Each file starts from empty tables, so files never depend on each other's data or order.
 */
assertTestDatabase(TEST_DATABASE_URL)

beforeAll(async () => {
  await truncateAllTables()
})
