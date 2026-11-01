# Serendiva API

REST API for **Serendiva**, the website of a single licensed private tour guide in Sri Lanka. It serves the
public content of the Next.js website (tours, destinations, reviews, blog, ...), receives travel inquiries,
corporate proposal requests and newsletter sign-ups, and powers the admin panel the guide uses to manage
everything. There are **no payments, prices or bookings**: a visitor sends an inquiry, the guide is emailed,
sees it in the admin panel and replies personally.

Fastify 5 · TypeScript (strict) · Zod 4 (validation + OpenAPI) · Prisma 7 + PostgreSQL 16 · argon2 + JWT cookies ·
Resend · S3 / Cloudflare R2 · sharp · Vitest

> **Placeholders.** Everything marked **[PLACEHOLDER]** must be replaced before going live: example domains
> (`serendiva.com`, `api.serendiva.com`, `media.serendiva.com`), email addresses, the guide's name in the seed
> data, and all sample content created by `npm run db:seed` (tours, reviews, blog posts, photos from the design
> mock-up). Default secrets in `.env.example` are for local development only.

## Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Local setup (Windows PowerShell)](#local-setup-windows-powershell)
4. [npm scripts](#npm-scripts)
5. [Environment variables](#environment-variables)
6. [Authentication](#authentication)
7. [CORS and cookies: deployment topologies](#cors-and-cookies-deployment-topologies)
8. [API overview](#api-overview)
9. [Inquiry flow and email](#inquiry-flow-and-email)
10. [File storage](#file-storage)
11. [Rate limits and spam protection](#rate-limits-and-spam-protection)
12. [Languages](#languages)
13. [Adding a module](#adding-a-module)
14. [Testing](#testing)
15. [Docker](#docker)
16. [Deployment, production checklist and backups](#deployment-production-checklist-and-backups)
17. [Troubleshooting](#troubleshooting)

---

## Architecture

```
 Browser ──► Next.js website (serendiva-web) ──┬─► GET /api/v1/...            server components, cached by tag
                                               ├─► /api/v1/admin/... rewrite   admin panel (same-origin cookies)
 Browser ──────────────── forms (CORS) ───────►│
                                               ▼
                                     Serendiva API (this repo, Fastify)
                                     │  routes → services → repositories
                                     ├─► PostgreSQL (Prisma 7, pg driver adapter)
                                     ├─► Resend (email)          ├─► S3 / R2 or local disk (media)
                                     └─► POST {FRONTEND_URL}/api/revalidate (cache tags) after admin changes
```

- **One process, no queues.** The email retry job runs in-process; rate limits are kept in memory. Run a
  single instance (that is plenty for a one-person business site).
- **Layered modules.** `<name>.routes.ts` (HTTP only) → `<name>.service.ts` (business logic, mapping,
  revalidation) → `<name>.repository.ts` (Prisma queries only).
- **Zod everywhere.** Every route declares Zod schemas for params, query, body and every response status. They
  validate requests, serialize responses (no extra keys leak) and generate the OpenAPI document that the
  website's typed client is generated from.
- **Translatable content** is stored as JSON per locale (`{ "en": "...", "zh": "...", "de": "..." }`). Public
  endpoints take `?locale=` and fall back to English field by field.

### Folder structure

```
serendiva-api/
├─ src/
│  ├─ server.ts                  entry point: env → app → listen, email retry job, graceful shutdown
│  ├─ app.ts                     buildApp(): plugins, static /uploads, module registration (used by tests too)
│  ├─ config/env.ts              Zod-validated environment variables (fail fast with a readable list)
│  ├─ plugins/                   error-handler, security (helmet, CORS, rate limit), auth (cookies + JWT guard),
│  │                             http-cache (Cache-Control + ETag), swagger (/docs, /openapi.json)
│  ├─ lib/                       email (Resend/console + templates), storage (local/S3), image (sharp),
│  │                             i18n, pagination, errors, csv, reference codes, revalidate, turnstile, ...
│  ├─ jobs/email-retry.ts        in-process retry of failed lead emails + expired token cleanup
│  ├─ modules/
│  │  ├─ auth, tours, categories, destinations (+ regions), reviews, faqs, blog, gallery, availability,
│  │  │  inquiries, proposals, newsletter, media, settings, stats, sitemap, health
│  │  ├─ shared/                 DTO helpers shared by modules
│  │  └─ index.ts                which plugins are mounted under /api/v1 and /api/v1/admin
│  └─ generated/prisma/          generated Prisma client (git-ignored, `npx prisma generate`)
├─ prisma/
│  ├─ schema.prisma              data model (JSON column shapes documented in /// comments)
│  ├─ migrations/                SQL migrations (applied with `prisma migrate deploy`)
│  ├─ seed.ts, seed-data/        admin user + sample content [PLACEHOLDER content]
├─ scripts/                      export-openapi.ts, import-seed-images.ts, docker-entrypoint.sh
├─ tests/                        Vitest suite (real PostgreSQL test database)
├─ docker/initdb/                creates the test database in the docker-compose PostgreSQL
├─ docs/DEPLOYMENT.md            Render / Railway / Fly.io + Neon, production checklist, backups
├─ Dockerfile, docker-compose.yml, .github/workflows/ci.yml
└─ openapi.json                  exported OpenAPI document (input for the website's typed client)
```

---

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 22 LTS | `node -v` → `v22.x` ([nodejs.org](https://nodejs.org) or `winget install OpenJS.NodeJS.LTS`) |
| npm | 10+ | ships with Node 22 |
| Docker Desktop | recent (Compose 2.24+) | runs PostgreSQL 16 locally. Alternatively install PostgreSQL 16 natively |
| Git | any | |
| PostgreSQL client tools | 16+ (optional) | only for `pg_dump` / `pg_restore` backups; Docker can run them too |

---

## Local setup (Windows PowerShell)

Every command below works in Windows PowerShell 5.1 and PowerShell 7 (commands are separated with `;`,
never `&&`).

```powershell
# 1. Get the code
git clone <your-repo-url> serendiva-api     # [PLACEHOLDER] repository URL
Set-Location serendiva-api

# 2. Configuration (the defaults work for local development)
Copy-Item .env.example .env

# 3. Start PostgreSQL 16 in Docker (also creates the serendiva_test database for `npm test`)
docker compose up -d db

# 4. Install dependencies (also generates the Prisma client)
npm install

# 5. Create the tables
npx prisma migrate deploy

# 6. Admin user (ADMIN_SEED_* in .env) + sample content
npm run db:seed

# 7. Start the API with auto-reload on http://localhost:4000 (docs: http://localhost:4000/docs)
npm run dev
```

In a **second** PowerShell window (keep the API running in the first one):

```powershell
# 8. Download the sample photos and convert them into WebP variants in uploads/ (needs internet)
npm run media:import-seed
```

> `npm install` must run after `.env` exists: Prisma reads `DATABASE_URL` from it when it generates the client.

### Try it

```powershell
# Health and public content
Invoke-RestMethod http://localhost:4000/health/ready
Invoke-RestMethod "http://localhost:4000/api/v1/tours?locale=en&pageSize=3" | ConvertTo-Json -Depth 5

# Send an inquiry (the emails are written to tmp\emails\*.html with EMAIL_DRIVER=console)
$inquiry = @{ name = 'Test Visitor'; email = 'visitor@example.com'; tourSlug = 'cultural-odyssey'; message = 'Hello from PowerShell' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/v1/inquiries -ContentType 'application/json; charset=utf-8' -Body $inquiry

# Sign in as the admin (cookies are kept in $admin) and list inquiries
$login = @{ email = 'admin@serendiva.lk'; password = 'ChangeMe-Serendiva-2026' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/v1/admin/auth/login -ContentType 'application/json' -Body $login -SessionVariable admin
Invoke-RestMethod -Uri 'http://localhost:4000/api/v1/admin/inquiries?pageSize=5' -WebSession $admin | ConvertTo-Json -Depth 4

# Corporate proposal with a PDF brief (multipart) — curl.exe, not the PowerShell curl alias
curl.exe -X POST http://localhost:4000/api/v1/corporate-proposals -F company=Acme -F contactPerson="Jane Doe" `
  -F email=jane@example.com -F phone="+44 20 7946 0000" -F groupSize=25 -F dates="March 2027" `
  -F eventType=Incentive -F "attachment=@brief.pdf;type=application/pdf"
```

### Without Docker

Install PostgreSQL 16 for Windows, create a role and the two databases, then point `.env` at them:

```powershell
psql -U postgres -c "CREATE ROLE serendiva LOGIN PASSWORD 'serendiva';"
psql -U postgres -c "CREATE DATABASE serendiva OWNER serendiva;"
psql -U postgres -c "CREATE DATABASE serendiva_test OWNER serendiva;"
```

### Connect the website

In `serendiva-web/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000`, `REVALIDATE_SECRET` = the same value
as the API's `REVALIDATE_SECRET`. The API allows `FRONTEND_URL` (default `http://localhost:3000`) and every origin
in `CORS_ORIGINS`.

---

## npm scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the API with `tsx watch` (reloads on change), reads `.env`; pretty logs |
| `npm run build` | Bundle `src/server.ts` (incl. the generated Prisma client) into `dist/server.js` with tsup |
| `npm start` | Run the build: `node dist/server.js` (reads `.env` if present) |
| `npm run lint` | ESLint (TypeScript rules, no `any`) |
| `npm run format` | Prettier (writes files) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest suite against the test database (see [Testing](#testing)) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run prisma:generate` | Regenerate the Prisma client into `src/generated/prisma` |
| `npm run db:migrate` | `prisma migrate dev` — create a new migration after editing `schema.prisma` (development only) |
| `npm run db:deploy` | `prisma migrate deploy` — apply pending migrations (CI / production) |
| `npm run db:seed` | Create the admin from `ADMIN_SEED_*` and reset + insert the sample content. `-- --skip-content`: admin only (safe for production). `-- --force`: allow the content reset when `NODE_ENV=production` |
| `npm run db:reset` | Drop the development database, re-apply all migrations and seed (**destroys data**) |
| `npm run db:studio` | Prisma Studio (database browser) |
| `npm run media:import-seed` | Download the seed photos into the configured storage and create WebP variants. `-- --dry-run` lists them |
| `npm run openapi:export` | Write `openapi.json` (no server/database needed). `-- ..\serendiva-web\openapi.json` writes elsewhere |

---

## Environment variables

Validated at start-up by `src/config/env.ts`; if anything is missing or malformed the process prints every
problem and exits. Booleans accept `true`/`false`/`1`/`0`.

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development` (pretty logs), `test`, `production` (JSON logs, Secure cookies with `COOKIE_SECURE=auto`) |
| `PORT` / `HOST` | `4000` / `0.0.0.0` | Listen address |
| `LOG_LEVEL` | `info` | `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` |
| `API_PUBLIC_URL` | `http://localhost:4000` | Public URL of this API: base of local-disk upload URLs and the OpenAPI `servers` entry |
| `TRUST_PROXY` | `false` | Client IP detection behind a proxy: `false`, a hop count (`1`), or proxy IPs/CIDRs. See [Rate limits](#rate-limits-and-spam-protection) |
| `DATABASE_URL` | **required** | PostgreSQL connection string |
| `CORS_ORIGINS` | *(empty)* | Comma-separated browser origins allowed to call the API (`FRONTEND_URL` is always allowed) |
| `FRONTEND_URL` | `http://localhost:3000` | The website: revalidation webhook target, links in emails, CORS |
| `REVALIDATE_SECRET` | **required** (16+) | Shared secret sent as `x-revalidate-secret` to `FRONTEND_URL/api/revalidate` |
| `JWT_ACCESS_SECRET` | **required** (32+) | Signs access tokens |
| `JWT_REFRESH_SECRET` | **required** (32+) | HMAC key for the stored refresh-token hashes (use a different value) |
| `ACCESS_TOKEN_TTL_MINUTES` | `15` | Access token / `sd_access` cookie lifetime |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh token lifetime (rotated on every refresh) |
| `COOKIE_DOMAIN` | *(empty = host-only)* | e.g. `.serendiva.com` when website and API share a parent domain and both need the cookies |
| `COOKIE_SECURE` | `auto` | `auto` = Secure in production only; `true` / `false` |
| `COOKIE_SAMESITE` | `lax` | `lax`, `strict` or `none` (`none` requires Secure) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` / `ADMIN_SEED_NAME` | — | First admin, created by `npm run db:seed` (password 10+ chars) **[PLACEHOLDER]** |
| `EMAIL_DRIVER` | `console` | `console` (writes `tmp/emails/*.html`, development) or `resend` |
| `RESEND_API_KEY` | — | Required when `EMAIL_DRIVER=resend` |
| `MAIL_FROM` | `Serendiva <hello@serendiva.lk>` | Sender; must be on a domain verified in Resend **[PLACEHOLDER]** |
| `GUIDE_NOTIFY_EMAIL` | `guide@serendiva.lk` | Receives inquiry and proposal notifications **[PLACEHOLDER]** |
| `STORAGE_DRIVER` | `local` | `local` (folder `UPLOAD_DIR`, served at `/uploads`) or `s3` (AWS S3 / Cloudflare R2) |
| `UPLOAD_DIR` | `uploads` | Folder for the local driver |
| `S3_ENDPOINT` | — | R2: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`; AWS: leave empty |
| `S3_REGION` | `auto` | R2: `auto`; AWS: e.g. `ap-southeast-1` |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | — | Required when `STORAGE_DRIVER=s3` |
| `S3_PUBLIC_URL` | — | Public base URL of the bucket (custom domain / CDN), required with `s3` |
| `FORM_RATE_LIMIT` | `5` | Form submissions per IP per minute (inquiry, proposal, newsletter, review) |
| `TURNSTILE_SECRET` | *(empty = off)* | Cloudflare Turnstile secret; when set, forms must send `turnstileToken` |
| `EMAIL_RETRY_INTERVAL_MINUTES` | `10` | How often failed lead emails are retried |
| `EMAIL_RETRY_DISABLED` | `false` | Turn the retry job off |
| `REVALIDATE_DISABLED` | `false` | Skip revalidation webhooks (no frontend running) |
| `TEST_DATABASE_URL` | see [Testing](#testing) | Read by the test suite only (from the environment or `.env`) |
| `RUN_MIGRATIONS` | `true` | Docker image only: run `prisma migrate deploy` before starting |

---

## Authentication

There is exactly one kind of user: the admin. There is no public registration; the first admin is created by
`npm run db:seed` from `ADMIN_SEED_*`.

**Sign in** — `POST /api/v1/admin/auth/login` with `{ email, password }`. The password is verified with argon2.
On success the API sets three cookies (all `httpOnly`, `SameSite`/`Secure`/`Domain` from the `COOKIE_*` settings):

| Cookie | Content | Path | Lifetime |
| --- | --- | --- | --- |
| `sd_access` | JWT access token (`sub`, `email`, `name`) | `/` | `ACCESS_TOKEN_TTL_MINUTES` (15 min) |
| `sd_refresh` | random 384-bit refresh token; only its HMAC is stored | `/api/v1/admin/auth` | `REFRESH_TOKEN_TTL_DAYS` (30 days) |
| `sd_session` | `1` — lets the Next.js middleware see "probably signed in" without the JWT secret | `/` | 30 days |

Every `/api/v1/admin/*` route (except login, refresh and logout) requires a valid access token from the
`sd_access` cookie (or an `Authorization: Bearer <jwt>` header for tools). Without one the API answers
`401 UNAUTHORIZED`.

**Refresh rotation** — `POST /auth/refresh` exchanges the refresh cookie for a new access token **and a new
refresh token**; the old one is revoked and linked to its successor. All tokens of one sign-in share a *family*.
If a revoked refresh token is ever presented again (it was stolen, or replayed), the API revokes the whole family
and the user must sign in again. The website's admin client refreshes once per 401 (single-flight) and retries.

**Logout** revokes the refresh-token family and clears the cookies. Access tokens are stateless JWTs, so one
that was copied before logout stays valid until it expires (at most 15 minutes).

**Brute-force protection** — after 5 consecutive wrong passwords the account is locked for 15 minutes
(`429 ACCOUNT_LOCKED`); each further failure after a lock doubles the lock (30 min, 1 h, ... up to ~16 h). A
successful sign-in resets the counter. Independently, login is rate limited to 10 requests per 15 minutes per IP.
Unknown email and wrong password give the same `401` message (no account enumeration).

**Change password** — `POST /auth/change-password` (`currentPassword`, `newPassword`: 12+ characters with a
letter and a digit) revokes all other sessions; the current device stays signed in.

`GET /auth/me` returns the signed-in admin. `PUT /auth/profile` updates that account's display name and sign-in
email. Expired refresh tokens are deleted daily by the background job.

---

## CORS and cookies: deployment topologies

CORS: browsers may call the API only from `FRONTEND_URL` and the origins in `CORS_ORIGINS` (exact match:
scheme + host + port, no trailing slash), with credentials allowed. Requests without an `Origin` header
(server-to-server calls from Next.js, curl) are not affected by CORS.

How the admin's cookies reach the API depends on where the website and the API live:

### A. Recommended: same-origin through the Next.js rewrite (works with any API domain)

The website (`serendiva-web/next.config.ts`) proxies `/api/v1/:path*` to the API. The admin panel only calls
relative URLs like `/api/v1/admin/tours`, so for the browser the cookies are **first-party cookies of the
website** — no CORS, no third-party-cookie restrictions (Safari ITP, Chrome).

```
Browser ── https://www.serendiva.com/api/v1/admin/... ──► Next.js rewrite ──► https://api.serendiva.com/api/v1/admin/...
```

API settings: `COOKIE_DOMAIN=` (empty, host-only), `COOKIE_SAMESITE=lax`, `COOKIE_SECURE=auto` (Secure in production).
Website: `API_URL=https://api.serendiva.com` (server → API). The API may even run on `*.onrender.com` /
`*.fly.dev`. The links in the guide's emails (e.g. "Download brief") also use `FRONTEND_URL/api/v1/admin/...`,
so they rely on this rewrite.

Public forms (inquiry, proposal, newsletter, review) post directly from the browser to `NEXT_PUBLIC_API_URL`
without cookies, so they only need CORS: `FRONTEND_URL` / `CORS_ORIGINS` must contain the website origin.

### B. Same parent domain, browser calls the API directly

`https://www.serendiva.com` and `https://api.serendiva.com` are *same-site*, so `SameSite=Lax` cookies are sent
with credentialed `fetch` calls. Settings: `CORS_ORIGINS=https://www.serendiva.com`, `COOKIE_SAMESITE=lax`,
`COOKIE_SECURE=true`. Set `COOKIE_DOMAIN=.serendiva.com` only if the website itself must see the cookies (the
Next.js middleware checks `sd_session`); otherwise leave it empty. The browser must use `credentials: 'include'`.

### C. Different sites (e.g. `serendiva.com` + `serendiva-api.onrender.com`) without the rewrite

Cookies are then third-party: they need `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true` (HTTPS only), the website
origin in `CORS_ORIGINS`, and they are still **blocked by Safari and by Chrome's third-party-cookie
restrictions**. Do not use this; use option A.

---

## API overview

- Swagger UI: **`/docs`** · OpenAPI 3 JSON: **`/openapi.json`** (also exported to `openapi.json` with
  `npm run openapi:export`).
- Typed client for the website: in `serendiva-web` run `npm run api:types -- ..\serendiva-api\openapi.json`
  (openapi-typescript → `src/lib/api/schema.d.ts`, used with openapi-fetch). Re-run it after API changes.
- Public endpoints: `/api/v1/...`, read-only except form submissions, no authentication.
- Admin endpoints: `/api/v1/admin/...`, session cookie required.

### Public endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Liveness (no database access) |
| `GET /health/ready` | Readiness (checks the database; 503 when down) |
| `GET /api/v1/tours` | Published tours: `category`, `duration` (`1-3`,`4-7`,`8-11`,`12+`), `minDays`/`maxDays`, `q`, `featured`, `travellerType`, `sort`, `page`, `pageSize`; category facets |
| `GET /api/v1/tours/{slug}` | Tour detail: days, gallery, destinations, FAQs, approved reviews, related tours |
| `GET /api/v1/categories`, `/regions` | Tour categories; regions with month-by-month climate |
| `GET /api/v1/destinations`, `/destinations/{slug}` | Destinations (region filter, search) and detail |
| `GET /api/v1/reviews`, `/reviews/summary` | Approved reviews only (filters, pagination); average and counts |
| `POST /api/v1/reviews` | Guest review, stored as `pending` until approved |
| `GET /api/v1/faqs` | FAQs by `scope`, `tour` or `destination` |
| `GET /api/v1/blog`, `/blog/{slug}` | Blog list (category, tag, search) and post |
| `GET /api/v1/gallery`, `/availability` | Gallery items; the guide's busy/available ranges |
| `GET /api/v1/settings/public` | Contact details, guide profile, counters, hero slides, SEO defaults (defaults on an empty database) |
| `POST /api/v1/inquiries` | Travel inquiry (JSON) → `201 { reference, message }` |
| `POST /api/v1/corporate-proposals` | Corporate request (multipart, optional PDF/DOCX ≤ 5 MB) |
| `POST /api/v1/newsletter/subscribe`, `GET /newsletter/confirm?token=`, `GET /newsletter/unsubscribe?token=` | Double opt-in newsletter |
| `GET /api/v1/sitemap-data` | Published slugs with `updatedAt` for the Next.js sitemap |

Content endpoints accept `?locale=en|zh|de` (default `en`, English fallback per field).

### Admin endpoints (`/api/v1/admin`)

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/change-password`, `GET /auth/me`, `PUT /auth/profile` |
| Content | Full CRUD for `tours` (nested days + gallery), `categories`, `regions`, `destinations`, `reviews`, `faqs`, `blog`, `gallery` (+ `POST /gallery/bulk`), `availability`; `PATCH /<things>/{id}/status` (publish/unpublish, review approve/reject), `PATCH /reviews/{id}/feature`, `PATCH /<things>/order` (drag & drop) |
| Leads | `inquiries`, `proposals`: list (status, date range, search, pagination, status counts), detail, `PATCH` (status, internal notes), `DELETE`, `GET /export.csv`, `POST /{id}/resend-emails`; `GET /proposals/{id}/attachment`; `newsletter`: list, CSV export, delete |
| Media | `GET /media`, `GET /media/{id}` (with usage), `POST /media` (multipart, 1–20 files), `PATCH /media/{id}` (alt text), `DELETE /media/{id}` (`409 MEDIA_IN_USE` while referenced) |
| Settings | `GET /settings`, `PUT /settings/{contact,social,guide,counters,trustBadges,heroSlides,seo,corporateClients,instagramFeed,pageImages}` |
| Stats | `GET /stats` (inquiries this week/month, by status with conversion rate, by month, country, tour and source page; latest inquiries; pending reviews, new proposals, newsletter counts) |

### Errors

Every non-2xx response has the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Some fields are invalid",
             "details": [{ "path": "days.0.title.en", "message": "Too small: expected string to have >=1 characters" }] } }
```

| Status | `code` | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Body/query/params invalid; `details` lists `{ path, message }` per field (dot paths) |
| 400 | `BAD_REQUEST`, `INVALID_TOKEN` | Malformed JSON, anti-spam check failed, unknown newsletter token |
| 401 | `UNAUTHORIZED` | Missing/expired session, wrong credentials |
| 404 | `NOT_FOUND` | Unknown route or record (drafts are 404 publicly) |
| 409 | `CONFLICT`, `MEDIA_IN_USE` | Duplicate slug (`details: [{ path: "slug" }]`), unknown or still-referenced related record |
| 413 | `PAYLOAD_TOO_LARGE` | JSON body > 1 MB, attachment > 5 MB, upload > 10 MB per file |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Wrong content type, attachment that is not really a PDF/DOCX |
| 429 | `RATE_LIMITED`, `ACCOUNT_LOCKED` | Rate limit hit (`retry-after` header), login lockout |
| 500 | `INTERNAL_ERROR` | Unexpected error (details only in the server log, with the request id) |

Every response carries `x-request-id` (send your own to correlate logs).

### Caching

- Public content GETs: `Cache-Control: public, max-age=60, stale-while-revalidate=300` and a weak `ETag`;
  `If-None-Match` → `304 Not Modified`. Errors and admin responses are not cached.
- Uploaded media under `/uploads/...` (local driver): `max-age=365d, immutable` (file names are unique).
- Proposal attachments and CSV exports: `private, no-store` / `no-store`.

### Revalidation webhook

After every admin create/update/delete/publish/reorder of public content the API calls the website:

```
POST {FRONTEND_URL}/api/revalidate
x-revalidate-secret: {REVALIDATE_SECRET}
content-type: application/json

{ "tags": ["tours", "tour:cultural-odyssey", "sitemap"] }
```

The call is fire-and-forget (5 s timeout); failures are logged as warnings and never fail the admin request.
Tags (keep in sync with `serendiva-web/src/lib/api/tags.ts`): `tours`, `tour:<slug>`, `categories`,
`destinations`, `destination:<slug>`, `regions`, `reviews`, `faqs`, `blog`, `blog:<slug>`, `gallery`,
`availability`, `settings`, `sitemap`. A slug change revalidates both the old and the new tag.

---

## Inquiry flow and email

`POST /api/v1/inquiries`:

1. Zod validation; honeypot `website` must be empty (otherwise a fake success is returned and nothing happens);
   Turnstile when enabled; rate limit per IP.
2. The inquiry is **saved first**, with a reference allocated atomically in the same transaction:
   `SRD-2026-0001`, `SRD-2026-0002`, ... (corporate proposals: `SRD-C-2026-0001`).
3. The API responds `201 { reference, message }` immediately; the emails are sent right after the response:
   the guide gets all details with **reply-to = visitor**, a WhatsApp link (when a number was given) and the
   tour link; the visitor gets a short confirmation with the reference and "I will reply within 24 hours".
4. The outcome is stored on the row: `emailStatus` = `sent` | `partial` (one of two sent) | `failed`,
   `lastEmailError`, `emailAttempts`. **An inquiry is never lost because of email.**
5. The retry job (first run ~30 s after start, then every `EMAIL_RETRY_INTERVAL_MINUTES`) re-sends only the
   missing email(s) for leads that are 2 minutes to 7 days old, up to 5 attempts. The admin can always press
   "resend" (`POST /admin/inquiries/{id}/resend-emails`).

Templates (HTML + text): new inquiry (guide), confirmation (visitor), corporate proposal (guide), newsletter
confirmation — in `src/lib/email/templates/`.

### Drivers

- **console** (default, development): logs one line per email and writes the HTML to `tmp/emails/<id>.html`
  — open it in a browser. Never use it in production (the API logs a warning if you do).
- **Resend** (production):
  1. Create an account at [resend.com](https://resend.com), add your domain (e.g. `serendiva.com`
     **[PLACEHOLDER]**) and create the DNS records it shows (SPF/`MX` on a `send.` subdomain, DKIM, and
     a DMARC record such as `v=DMARC1; p=none;`). Wait until the domain is *Verified*.
  2. Create an API key with "Sending access".
  3. Set `EMAIL_DRIVER=resend`, `RESEND_API_KEY=re_...`, `MAIL_FROM="Serendiva <hello@serendiva.com>"` (must be
     on the verified domain) and `GUIDE_NOTIFY_EMAIL` (the guide's inbox).
  4. Send a test inquiry and check the guide's inbox (and the spam folder) and the visitor's confirmation.

### Plugging in SMTP (or any other provider)

Email goes through the `EmailProvider` interface (`src/lib/email/types.ts`):

```ts
export interface EmailProvider {
  readonly name: string
  send(message: EmailMessage & { from: string }): Promise<{ id?: string }>
}
```

To use SMTP, add `nodemailer` (`npm install nodemailer; npm install -D @types/nodemailer`), implement a provider
in `src/lib/email/providers.ts`, add `smtp` to `EMAIL_DRIVER` plus an `SMTP_URL` variable in
`src/config/env.ts`, and select it in `createEmailService` (`src/lib/email/index.ts`):

```ts
import nodemailer from 'nodemailer'

export function createSmtpProvider(url: string): EmailProvider {
  const transport = nodemailer.createTransport(url) // smtp://user:pass@smtp.example.com:587
  return {
    name: 'smtp',
    async send(msg) {
      const info = await transport.sendMail({
        from: msg.from, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text, replyTo: msg.replyTo,
      })
      return { id: info.messageId }
    },
  }
}
```

A provider must **throw** when sending fails — that is what marks the lead as `failed` and triggers the retry.

---

## File storage

Uploads go through the `StorageDriver` interface (`src/lib/storage/types.ts`: `put`, `get`, `delete`, `urlFor`).

- **local** (development, Docker Compose): files are written under `UPLOAD_DIR` and served by the API at
  `{API_PUBLIC_URL}/uploads/<key>` with long-lived caching.
- **s3** (production): AWS S3 or Cloudflare R2. Public URLs are `{S3_PUBLIC_URL}/<key>`.

Images (`POST /admin/media`: JPEG, PNG, WebP, AVIF, GIF; ≤ 10 MB each, up to 20 per request) are detected by
their magic bytes, auto-rotated, stripped of EXIF/GPS data and stored as WebP: the original plus `thumb`
(400 px), `medium` (1024 px) and `large` (1920 px) variants (never upscaled) and a tiny base64 blur placeholder.
PDF/DOCX documents are stored as-is. Keys look like `media/<folder>/<yyyy>/<mm>/<id>-<name>.webp`.
A file that is still used anywhere (covers, galleries, settings, review photos, markdown in blog posts, ...)
cannot be deleted (`409 MEDIA_IN_USE` with the list of places).

### Cloudflare R2 setup

1. Cloudflare dashboard → R2 → *Create bucket* (e.g. `serendiva-media` **[PLACEHOLDER]**).
2. Bucket → Settings → *Public access* → connect a custom domain, e.g. `media.serendiva.com` **[PLACEHOLDER]**.
   Keep the `r2.dev` subdomain disabled in production.
3. R2 → *Manage API tokens* → create a token with *Object Read & Write* for this bucket.
4. Set `STORAGE_DRIVER=s3`, `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `S3_REGION=auto`,
   `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL=https://media.serendiva.com`.
5. Website: add the media host to `IMAGE_REMOTE_HOSTS` in `serendiva-web` so `next/image` may load it.

AWS S3: leave `S3_ENDPOINT` empty, set `S3_REGION` (e.g. `ap-southeast-1`) and use the bucket URL or a
CloudFront domain as `S3_PUBLIC_URL`.

### Private files (proposal attachments) — important

Corporate proposal briefs are stored under the **`private/`** prefix (with an unguessable random suffix) and
are only downloadable through the authenticated `GET /api/v1/admin/proposals/{id}/attachment`. The local driver's
`/uploads` route refuses every `private/` path. **With S3/R2 the files are in the same bucket**, so make sure
`private/*` is not publicly readable:

- **R2**: public access applies to the whole bucket. On the custom domain add a WAF custom rule
  *Block* when `starts_with(http.request.uri.path, "/private/")`, and keep `r2.dev` disabled.
- **AWS S3**: keep *Block Public Access* on for ACLs and grant public read only for `media/*` with a bucket policy
  (`"Resource": "arn:aws:s3:::<bucket>/media/*"`), or serve `media/` through CloudFront only.

---

## Rate limits and spam protection

| Limit | Value | Scope |
| --- | --- | --- |
| All routes | 300 requests / minute | per IP |
| Form posts (inquiry, proposal, newsletter, review) | `FORM_RATE_LIMIT` (5) / minute | per IP and route |
| `POST /admin/auth/login` | 10 / 15 minutes | per IP |
| `POST /admin/auth/refresh` | 60 / 15 minutes | per IP |
| `POST /admin/auth/change-password` | 5 / 15 minutes | per IP |
| Account lockout | 5 wrong passwords → 15 min, doubling | per account |
| Body size | JSON 1 MB, proposal attachment 5 MB, media 10 MB per file | per request |

Limits are kept in memory (one instance; they reset on restart). Exceeding one returns `429 RATE_LIMITED` with a
`retry-after` header.

**Client IP behind a proxy (`TRUST_PROXY`).** On Render, Railway and Fly the API sits behind the platform's
proxy, so the socket address is the proxy's. Set `TRUST_PROXY` to the **number of proxies** in front of the API
(usually `1`); the API then uses the address that the outermost trusted proxy appended to `X-Forwarded-For`,
which a client cannot forge. Check it once after deploying: open `/health` from your phone and look at
`remoteAddress` in the API's request log — it must be your phone's public IP; if it is a private/proxy address,
increase the number by one and check again (use the smallest value that shows your IP). `TRUST_PROXY=true` trusts
every `X-Forwarded-For` entry and lets anyone pick their IP and bypass the per-IP limits — avoid it. Leave it
`false` when nothing sits in front of the API (local development, Docker Compose).

**Honeypot.** Every public form has a hidden `website` field. Real visitors never fill it; when it is filled the
API returns a normal-looking success (with a fake reference) and stores and sends nothing.

**Cloudflare Turnstile** (optional): create a Turnstile widget in the Cloudflare dashboard for the website's
domain; put the *site key* into the website (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) and the *secret key* into the API
(`TURNSTILE_SECRET`). The website sends the widget's token as `turnstileToken`; the API verifies it (with the
visitor's IP) before saving. Missing or rejected tokens → `400`. Leave `TURNSTILE_SECRET` empty to disable it.

**Input sanitisation.** Plain-text form fields are stripped of HTML tags and control characters; every value is
HTML-escaped in emails; CSV exports neutralise spreadsheet formulas (`=`, `+`, `-`, `@`, tab).

---

## Languages

The data model and API already support **English (`en`, required), Chinese (`zh`) and German (`de`)**:

- Every translatable field is stored as `{ "en": "...", "zh": "...", "de": "..." }`. The admin editor sends
  the languages it has; empty translations are dropped (`""` for an optional language is rejected).
- Public endpoints take `?locale=zh` / `?locale=de` and fall back to English per field (missing or empty).
- Admin lists show `translations: { zh, de }` flags so missing translations are easy to find.

**To launch Chinese or German:** translate the content in the admin panel (each field has the language tabs),
then enable the locale in the website (`NEXT_PUBLIC_ENABLED_LOCALES=en,zh` in `serendiva-web`). Nothing changes
in the API. Inquiries remember the visitor's `locale`, and links in emails use the `/zh` or `/de` prefix.
Email texts themselves are English (`src/lib/email/templates/`).

**To add another language** (e.g. French `fr`):

1. `src/lib/i18n.ts`: add it to `LOCALES` and to the objects built by `translatable()` / `translatableOptional()`.
2. Update the places that list the languages explicitly: `translationFlags` (`src/modules/shared/admin-dto.ts`)
   and the `translations` schemas of the admin list items, the media alt-text body (`media.schemas.ts`),
   `siteUrl` (`src/modules/inquiries/lead-helpers.ts`) and `LOCALE_SEGMENTS` (`src/modules/stats/stats.service.ts`).
   `grep -rn "'zh'\|zh:" src` lists them.
3. `npm run typecheck; npm test; npm run openapi:export`, then regenerate the website's API types.

---

## Adding a module

Follow `src/modules/tours/*` (the reference implementation):

1. **Data**: add the model to `prisma/schema.prisma`, then `npm run db:migrate -- --name add_<thing>` (creates
   `prisma/migrations/<timestamp>_add_<thing>/migration.sql` and regenerates the client). Commit the migration.
2. **Files** in `src/modules/<name>/`:
   - `<name>.schemas.ts` — Zod request/response schemas with `.meta({ id: 'Name' })` (unique ids; prefix admin
     ones with `Admin`; never end an id with `Input` — name bodies `...Body`/`...Write`).
   - `<name>.repository.ts` — Prisma queries only.
   - `<name>.service.ts` — `create<Name>Service(app.deps)`: business logic, DTO mapping, `revalidator.revalidate(...)`.
   - `<name>.routes.ts` — export `<name>PublicRoutes` and/or `<name>AdminRoutes`. Admin plugins start with
     `app.addHook('onRequest', app.authenticate)`; every route has `tags`, `summary`, `security` (admin) and
     response schemas for every status (`...errorResponses` / `...adminErrorResponses`); public GETs use
     `config: publicCache` and accept `locale`.
3. Register the plugins in `src/modules/index.ts`.
4. New cache tags: `src/lib/revalidate.ts` (`Tags`) and the website's `src/lib/api/tags.ts`.
5. Tests: `tests/<name>.test.ts` with `buildTestApp()`, `login()` and the factories. The permissions test
   automatically checks that the new admin routes return 401 without a session.
6. `npm run lint; npm run typecheck; npm test; npm run openapi:export`, then `npm run api:types` in the website.

---

## Testing

The suite uses **Vitest** and Fastify's `app.inject()` against a **real PostgreSQL test database**.

```powershell
docker compose up -d db     # first start of the volume creates serendiva_test
npm test                    # or: npm run test:watch
npx vitest run tests/auth.test.ts      # a single file
```

The database comes from `TEST_DATABASE_URL` (environment variable, else `.env`, else
`postgresql://postgres:postgres@localhost:5432/serendiva_test`). **It is wiped on every run**, so its name must
contain `test` (the suite refuses to run otherwise). If your Docker volume is older than `docker/initdb`, create it
once: `docker compose exec db createdb -U serendiva serendiva_test`.

How it works:

- `tests/global-setup.ts` (once per run): drops and recreates the `public` schema and applies every
  `prisma/migrations/*/migration.sql` in order with `pg` — no Prisma CLI needed.
- `tests/setup-env.ts` (before each file): truncates all tables, so every file starts empty and files are
  independent. Files run one after another (`fileParallelism: false`).
- `tests/helpers.ts`: `buildTestApp(overrides)` builds the real app with a test environment (silent logs,
  captured email with failure injection, revalidation spy, local storage in a temp folder, generous form rate
  limit), `login()`, `multipart()`, `waitFor()`. `tests/factories.ts`: admin, media, category, tour, region,
  destination, review, and a valid `tourWrite()` body.

| File | Covers |
| --- | --- |
| `auth.test.ts` | login (cookies, hashing), failures without enumeration, lockout after 5 failures, login rate limit, `me` (cookie + Bearer), refresh rotation, reuse detection revokes the family, logout, change password, cross-site cookie settings |
| `inquiries.test.ts` | save + `SRD-YYYY-NNNN` sequence, both emails (recipients, reply-to, WhatsApp/tour links), blank optional fields, HTML stripping, honeypot, validation error shape, email failure → `failed`/`partial` → retry job fixes it, max attempts + admin resend, admin list/filter/update/delete |
| `proposals.test.ts` | multipart with PDF/DOCX, fake PDF → 415, > 5 MB → 413, validation, honeypot, private file never served by `/uploads` (path tricks), admin download, delete removes the file |
| `newsletter.test.ts` | double opt-in (email links, confirm, already confirmed/subscribed, unsubscribe, re-subscribe), invalid tokens, admin list/CSV/delete |
| `content.test.ts` | tours list filters, facets, search, pagination, sort, locale fallback (zh → en), detail, 404s, ETag/304, destinations, regions, approved-only reviews and summary, guest reviews pending, categories, sitemap |
| `public-empty-db.test.ts` | every public GET on an empty database (200 with defaults / 404 for details) |
| `permissions.test.ts` | every registered admin route (read from Fastify's router, incl. undocumented ones) returns 401 without a session or with a forged token; OpenAPI security |
| `validation.test.ts` | TourWrite rules (duplicate day numbers, `zh: ""`, required `en`, nested paths), duplicate slug 409, unknown references 409, settings, reorder, review form, 413/415 |
| `revalidation.test.ts` | tags sent after tour/review/destination/settings changes (old + new slug), none on failures or visitor forms; webhook client (URL, secret, dedupe, never throws) |
| `media.test.ts` | image upload → WebP + variants + blur, static serving, per-file rejections, alt text + revalidation, in-use delete 409 → delete after unlinking removes files |
| `seed.test.ts` | runs the real seed, every admin list/detail GET is 200, every record survives an admin GET → PUT round trip unchanged, every public page renders in all locales, seed is idempotent |
| `csv-export.test.ts` | CSV escaping (quotes, commas, newlines, formula injection, BOM) and the inquiry/proposal exports |
| `spam-protection.test.ts` | form rate limit 429, `TRUST_PROXY` (forged `X-Forwarded-For`), Turnstile (missing, rejected, accepted, outage) |
| `env.test.ts`, `health.test.ts` | environment parsing and fail-fast; health, 404 shape, request id, security headers, CORS allowlist, OpenAPI |

**CI** (`.github/workflows/ci.yml`): on every push to `main` and every pull request — PostgreSQL 16 service,
Node 22, `npm ci`, `prisma generate`, lint, typecheck, tests, a check that `prisma/migrations` matches
`schema.prisma`, build, and a smoke test of `node dist/server.js`.

---

## Docker

`Dockerfile` (multi-stage): **deps** (`npm ci`, Prisma client) → **build** (`prisma generate` + tsup) →
**prod-deps** (`npm prune --omit=dev`; keeps the Prisma CLI, which is needed for migrations) → **runtime**
(`node:22-slim`, non-root `node` user, `dist/` + production `node_modules` + `prisma/migrations`, `HEALTHCHECK`
on `/health`). On start, `scripts/docker-entrypoint.sh` runs `prisma migrate deploy` and then
`node dist/server.js` (set `RUN_MIGRATIONS=false` to skip the migration step).

```powershell
docker build -t serendiva-api .
docker run --rm -p 4000:4000 --env-file .env -e NODE_ENV=production `
  -e DATABASE_URL="postgresql://serendiva:serendiva@host.docker.internal:5432/serendiva" serendiva-api
```

`docker-compose.yml` runs PostgreSQL 16 (named volume `pgdata`, health check) and the API container (waits until
the database is healthy, reads your `.env`, uploads in the `uploads` volume):

```powershell
docker compose up -d db              # database only, for `npm run dev`
docker compose up -d --build         # database + API on http://localhost:4000 (stop `npm run dev` first)
docker compose logs -f api
docker compose down                  # keep data;  docker compose down -v  deletes the volumes
```

The production image contains neither `tsx` nor the TypeScript sources, so run `npm run db:seed` and
`npm run media:import-seed` from your machine against the target database (see
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#5-create-the-admin-user-and-optionally-content)).

---

## Deployment, production checklist and backups

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**:

- [Neon Postgres](docs/DEPLOYMENT.md#2-neon-postgres) and the step-by-step guides for
  [Render](docs/DEPLOYMENT.md#4a-render), [Railway](docs/DEPLOYMENT.md#4b-railway) and
  [Fly.io](docs/DEPLOYMENT.md#4c-flyio)
- [Production checklist](docs/DEPLOYMENT.md#8-production-checklist) (secrets, CORS, cookies, `TRUST_PROXY`,
  backups, logging, email domain verification, S3 private prefix)
- [Database backups](docs/DEPLOYMENT.md#9-database-backups) (`pg_dump` / `pg_restore` in PowerShell, Neon
  branching and point-in-time restore)

Quick reference — back up and restore (PostgreSQL client tools 16+, or the Docker variant in the guide):

```powershell
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
New-Item -ItemType Directory -Force backups | Out-Null
pg_dump --format=custom --no-owner --no-acl --dbname "$env:DATABASE_URL" --file "backups\serendiva-$stamp.dump"
pg_restore --clean --if-exists --no-owner --no-acl --dbname "$env:RESTORE_DATABASE_URL" "backups\serendiva-$stamp.dump"
```

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm install` fails with *Cannot resolve environment variable: DATABASE_URL* | Prisma's config needs `DATABASE_URL` to generate the client: `Copy-Item .env.example .env` first (or `$env:DATABASE_URL="postgresql://..."`) and run `npm install` again |
| *Invalid environment configuration* on start | The message lists every missing/invalid variable; fix `.env` |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL is not running: `docker compose up -d db`; `docker compose ps` must show it *healthy* |
| Port 5432 already in use | A native PostgreSQL service is running. Stop it (`Stop-Service postgresql*`) or change the compose mapping to `"5433:5432"` and use port 5433 in `DATABASE_URL` |
| `prisma migrate deploy` → `P3005` (*database schema is not empty*) | The database was created without Prisma Migrate. If its tables match the first migration, mark it as applied: `npx prisma migrate resolve --applied 20261005000000_init` |
| Prisma cannot download its engines (company proxy) | Set `$env:HTTPS_PROXY`, or see the Prisma docs on `PRISMA_ENGINES_MIRROR` |
| Browser: CORS error | The page's origin must be exactly `FRONTEND_URL` or listed in `CORS_ORIGINS` (scheme, host and port; no trailing slash) |
| Admin: signed in, but every request is 401 | Cookies are not stored or sent: use the Next.js rewrite (topology A); on plain `http://` keep `COOKIE_SECURE=auto`/`false`; `SameSite=None` needs HTTPS. Check the response's `Set-Cookie` in the browser's network tab |
| `429 RATE_LIMITED` while testing forms | `FORM_RATE_LIMIT` is per IP per minute; raise it in your local `.env` |
| `429 ACCOUNT_LOCKED` | Wait for the lock to expire, or reset it (SQL piped to `psql`, which keeps the quotes intact in every PowerShell version): `'UPDATE "AdminUser" SET "failedLoginCount" = 0, "lockedUntil" = NULL;' \| docker compose exec -T db psql -U serendiva -d serendiva` |
| Forgot the admin password | There is no reset email. Delete the admin (`'DELETE FROM "AdminUser";' \| docker compose exec -T db psql -U serendiva -d serendiva`, or the same SQL in the Neon SQL editor), set `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`, then `npm run db:seed -- --skip-content` |
| No emails arrive | With `EMAIL_DRIVER=console` they are in `tmp\emails\`. With Resend: domain verified? `MAIL_FROM` on that domain? Check the inquiry's `emailStatus`/`lastEmailError` in the admin panel and use *Resend emails* |
| Images missing on the website | Run `npm run media:import-seed` (seed photos point at remote design URLs until then); check `API_PUBLIC_URL` / `S3_PUBLIC_URL` and the website's `IMAGE_REMOTE_HOSTS` |
| Website does not update after an admin change | API log *revalidation request was rejected/failed*: `REVALIDATE_SECRET` must be identical in both apps and `FRONTEND_URL` reachable from the API |
| Log line *SECURITY WARNING: The SSL modes 'prefer', 'require' ...* | Harmless notice from `pg` about `sslmode=require` (it already verifies the certificate) |
| Tests: *Refusing to run the test suite against database ...* | `TEST_DATABASE_URL` must name a database containing `test` — it is wiped |
| Container exits with `sh: ... $'\r'` | The entrypoint has Windows line endings; the Dockerfile strips them and `.gitattributes` keeps `*.sh` as LF — rebuild the image |
