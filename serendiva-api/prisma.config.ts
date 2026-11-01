import { defineConfig, env } from 'prisma/config'

// Prisma 7 reads its connection settings from this file (not from schema.prisma).
// `.env` is loaded by Node itself (see package.json scripts) or by your shell/CI.
try {
  process.loadEnvFile?.('.env')
} catch {
  // .env is optional (CI/production set real environment variables)
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
