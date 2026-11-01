import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  splitting: false,
  // Keep node_modules external; the generated Prisma client (src/generated) is bundled in.
  skipNodeModulesBundle: true,
})
