# syntax=docker/dockerfile:1
#
# Serendiva API — production image (multi-stage)
#
#   deps       all dependencies (incl. dev) + generated Prisma client
#   build      prisma generate + tsup bundle -> dist/server.js
#   prod-deps  dependencies pruned to production (keeps the Prisma CLI for `migrate deploy`)
#   runtime    node:22-slim, non-root, dist + prod node_modules + prisma/migrations
#
# PowerShell:
#   docker build -t serendiva-api .
#   docker run --rm -p 4000:4000 --env-file .env -e DATABASE_URL=postgresql://... serendiva-api
#
# On start the container applies pending migrations (prisma migrate deploy) and then starts the API.
# Set RUN_MIGRATIONS=false to skip that step (e.g. when migrations run in a separate release job).

ARG NODE_VERSION=22

# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS base
# OpenSSL is needed by Prisma's schema engine (prisma migrate deploy); CA certificates for outbound
# HTTPS (Resend, S3/R2, Turnstile, the revalidation webhook).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma
# prisma.config.ts insists on DATABASE_URL whenever the Prisma CLI loads (the `postinstall`
# prisma generate). Nothing connects during the build; this placeholder never reaches the runtime image.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm ci

# ---------------------------------------------------------------------------
FROM deps AS build
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate \
  && npm run build

# ---------------------------------------------------------------------------
FROM deps AS prod-deps
# Drops dev-only packages (tsx, vitest, eslint, tsup, ...). `prisma` stays: it is a peer dependency
# of @prisma/client, and its schema engine (downloaded during npm ci) runs `migrate deploy`.
RUN npm prune --omit=dev && npm cache clean --force

# ---------------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000 \
    UPLOAD_DIR=/app/uploads

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
# dist/server.js contains the bundled application and the generated Prisma client
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json prisma.config.ts ./
COPY --chown=node:node prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=node:node prisma/migrations ./prisma/migrations
COPY --chown=node:node scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh

# Strip Windows line endings (a CRLF checkout would break the shell script); create the writable
# folders for local-disk uploads and the console email driver.
RUN sed -i 's/\r$//' scripts/docker-entrypoint.sh \
  && mkdir -p uploads tmp \
  && chown node:node uploads tmp

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["sh", "scripts/docker-entrypoint.sh"]
