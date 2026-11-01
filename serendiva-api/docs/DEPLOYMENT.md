# Deploying the Serendiva API

Step-by-step guide for running the API in production on **Render**, **Railway** or **Fly.io** with a
**Neon** PostgreSQL database, plus the production checklist, backups and day-2 operations. All commands are
for Windows PowerShell. Back to the [README](../README.md).

> **[PLACEHOLDER]** values: `serendiva.com`, `www.serendiva.com`, `api.serendiva.com`, `media.serendiva.com`,
> email addresses, app/bucket names. Replace them with the real ones.

## Contents

1. [Target setup](#1-target-setup)
2. [Neon Postgres](#2-neon-postgres)
3. [Production environment variables](#3-production-environment-variables)
4. Host the API: [4a. Render](#4a-render) · [4b. Railway](#4b-railway) · [4c. Fly.io](#4c-flyio)
5. [Create the admin user (and optionally content)](#5-create-the-admin-user-and-optionally-content)
6. [Connect the website](#6-connect-the-website)
7. [Verify the deployment](#7-verify-the-deployment)
8. [Production checklist](#8-production-checklist)
9. [Database backups](#9-database-backups)
10. [Updates, migrations and rollback](#10-updates-migrations-and-rollback)
11. [Logging and monitoring](#11-logging-and-monitoring)

---

## 1. Target setup

```
www.serendiva.com  ── Next.js website (any host, e.g. Vercel)  ── /api/v1/* rewrite ──┐
                                                                                       ▼
api.serendiva.com  ── Serendiva API container (Render / Railway / Fly.io, 1 instance) ── Neon PostgreSQL
                                     │                                                 (same region)
                                     ├── Resend (email)      └── Cloudflare R2 (media.serendiva.com)
```

- **One API instance.** Rate limits and the email-retry job's de-duplication live in memory. One small
  instance (512 MB RAM) is plenty; do not scale horizontally.
- **Region.** Put the API and the database in the same region. For visitors from everywhere and a guide in
  Sri Lanka, **Singapore** is a good choice on all three platforms and on Neon (`aws-ap-southeast-1`).
- **Storage.** Use `STORAGE_DRIVER=s3` (Cloudflare R2 or AWS S3) in production. Platform disks/volumes are
  tied to one machine, complicate deploys and are mounted as `root` (the container runs as the non-root `node`
  user). See [File storage](../README.md#file-storage) for R2 setup and the **private prefix** rule.
- **Migrations** run automatically when the container starts (`prisma migrate deploy` in
  `scripts/docker-entrypoint.sh`).

Accounts you need: GitHub (repository), Neon, one of Render / Railway / Fly.io, Resend, Cloudflare (R2, DNS,
optionally Turnstile).

### Generate secrets

Run once per secret and store the values in your password manager:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

You need three different values: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REVALIDATE_SECRET` (the last one
is also set in the website).

---

## 2. Neon Postgres

1. Sign up at [neon.tech](https://neon.tech) → **Create project**: name `serendiva`, Postgres **16** (same
   major version as local development; 17 also works), region **AWS Asia Pacific (Singapore)** (or the region
   of your API host).
2. Project dashboard → **Connect**: branch `main`, database `neondb` (or create a database `serendiva`), role
   `neondb_owner`. **Switch off "Connection pooling"** and copy the connection string:

   ```
   postgresql://neondb_owner:<password>@ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

   Use this **direct** (non-pooled, no `-pooler` in the host) string as `DATABASE_URL`: `prisma migrate deploy`
   needs a direct connection, and one API instance only opens a handful of connections. Keep
   `sslmode=require`; `channel_binding=require` may stay or be removed.
3. **Autosuspend:** on the free plan the compute sleeps after a few minutes without queries; the first query
   afterwards takes about a second. Point the platform's health check at **`/health`** (does not touch the
   database) so Neon can sleep; `/health/ready` checks the database and would keep it awake.
4. Optional: create a `staging` branch (Branches → New branch) to try migrations or the sample content on a
   copy of production data. Each branch has its own connection string.

The tables are created by the API container on its first start. To run the migrations yourself:

```powershell
$env:DATABASE_URL = "postgresql://neondb_owner:<password>@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate deploy
```

---

## 3. Production environment variables

Set these on the platform (dashboard or CLI). Never commit them. Variables not listed keep their defaults
(see the [README](../README.md#environment-variables)).

```dotenv
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
API_PUBLIC_URL=https://api.serendiva.com
# number of proxies in front of the API — verify after the first deploy (section 7)
TRUST_PROXY=1

DATABASE_URL=postgresql://neondb_owner:<password>@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

FRONTEND_URL=https://www.serendiva.com
CORS_ORIGINS=https://www.serendiva.com,https://serendiva.com
REVALIDATE_SECRET=<random, same value in the website>

JWT_ACCESS_SECRET=<random>
JWT_REFRESH_SECRET=<another random>
# topology A (Next.js rewrite): host-only, Lax, Secure in production
COOKIE_DOMAIN=
COOKIE_SAMESITE=lax
COOKIE_SECURE=auto

EMAIL_DRIVER=resend
RESEND_API_KEY=re_xxxxxxxx
MAIL_FROM=Serendiva <hello@serendiva.com>
GUIDE_NOTIFY_EMAIL=guide@serendiva.com

STORAGE_DRIVER=s3
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=serendiva-media
S3_ACCESS_KEY_ID=<r2 access key id>
S3_SECRET_ACCESS_KEY=<r2 secret>
S3_PUBLIC_URL=https://media.serendiva.com

FORM_RATE_LIMIT=5
# optional: Cloudflare Turnstile secret (site key goes into the website)
TURNSTILE_SECRET=
```

`ADMIN_SEED_*` are not needed on the server — the admin is created from your PC (section 5).

---

## 4a. Render

1. Push the repository to GitHub.
2. [dashboard.render.com](https://dashboard.render.com) → **New → Web Service** → connect the repository.
3. Settings:
   - **Language/Runtime:** Docker (Render builds the `Dockerfile`).
   - **Region:** Singapore. **Branch:** `main`.
   - **Instance type:** Starter or larger. (Free instances sleep after 15 minutes without traffic: the first
     visitor waits up to a minute, and the email retry job does not run while asleep.)
   - **Health Check Path:** `/health`.
4. **Environment** → add the variables from section 3 (or an Environment Group). Render sets `PORT` itself; the
   API listens on whatever `PORT` says.
5. **Create Web Service.** The deploy log shows `[entrypoint] prisma migrate deploy`, the applied migrations and
   `Serendiva API ready`.
6. **Settings → Custom Domains** → add `api.serendiva.com` and create the CNAME record it shows (Cloudflare DNS:
   *DNS only* / grey cloud while Render issues the certificate). Then `API_PUBLIC_URL=https://api.serendiva.com`.
7. Auto-deploy on push is on by default. Render starts the new version, waits for the health check, then
   switches traffic.

Optional: on paid plans you can move the migrations to **Pre-Deploy Command** `npx prisma migrate deploy` and set
`RUN_MIGRATIONS=false`.

`TRUST_PROXY`: Render places more than one proxy in front of the service (users have reported 3) — verify as
described in section 7 and use the smallest value that shows your real IP.

## 4b. Railway

1. [railway.com](https://railway.com) → **New Project → Deploy from GitHub repo** → pick the repository.
   Railway detects the `Dockerfile` and builds it.
2. Service → **Variables** → *Raw Editor* → paste the variables from section 3 (keep `PORT=4000`).
3. Service → **Settings**:
   - **Region:** Southeast Asia (Singapore).
   - **Networking → Public Networking:** *Generate Domain* (target port **4000**) for a test URL, then
     *Custom Domain* `api.serendiva.com` with the CNAME record Railway shows.
   - **Deploy → Healthcheck Path:** `/health`. **Replicas:** 1. Restart policy: *On failure*.
4. Every push to `main` triggers a new deployment; Railway switches over after the health check passes.

## 4c. Fly.io

1. Install the CLI and sign in:

   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   fly auth login
   ```

2. In the project folder: `fly launch --no-deploy` (accept the detected Dockerfile, choose an app name and the
   region `sin`, decline the offered Postgres/Redis). Replace the generated `fly.toml` with:

   ```toml
   app = "serendiva-api"            # [PLACEHOLDER] your app name
   primary_region = "sin"

   [build]
     dockerfile = "Dockerfile"

   [env]
     NODE_ENV = "production"
     PORT = "4000"
     TRUST_PROXY = "1"

   [http_service]
     internal_port = 4000
     force_https = true
     auto_stop_machines = "off"     # keep the email retry job running
     auto_start_machines = true
     min_machines_running = 1

     [[http_service.checks]]
       grace_period = "60s"
       interval = "30s"
       method = "GET"
       path = "/health"
       timeout = "5s"

   [[vm]]
     size = "shared-cpu-1x"
     memory = "512mb"               # 1gb if many large photos are uploaded at once
   ```

3. Secrets (everything from section 3 that is not in `[env]`), in one command:

   ```powershell
   fly secrets set DATABASE_URL="postgresql://..." JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..." `
     REVALIDATE_SECRET="..." FRONTEND_URL="https://www.serendiva.com" CORS_ORIGINS="https://www.serendiva.com" `
     API_PUBLIC_URL="https://api.serendiva.com" EMAIL_DRIVER="resend" RESEND_API_KEY="re_..." `
     MAIL_FROM="Serendiva <hello@serendiva.com>" GUIDE_NOTIFY_EMAIL="guide@serendiva.com" STORAGE_DRIVER="s3" `
     S3_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com" S3_BUCKET="serendiva-media" `
     S3_ACCESS_KEY_ID="..." S3_SECRET_ACCESS_KEY="..." S3_PUBLIC_URL="https://media.serendiva.com"
   ```

4. Deploy and make sure exactly one machine runs (Fly creates two by default):

   ```powershell
   fly deploy
   fly scale count 1
   fly status
   fly logs
   ```

5. Custom domain: `fly certs add api.serendiva.com`, then create the DNS records it prints (CNAME to
   `serendiva-api.fly.dev`, or the A/AAAA records) and wait for `fly certs show api.serendiva.com` to be issued.

---

## 5. Create the admin user (and optionally content)

The image contains neither the seed script's TypeScript runtime nor the sources, so run the seed **from your
PC** against the production database. `$env:` variables apply to this PowerShell window only and override the
values in your `.env`.

```powershell
Set-Location serendiva-api
$env:DATABASE_URL = "postgresql://neondb_owner:<password>@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
$env:NODE_ENV = "production"
$env:ADMIN_SEED_EMAIL = "guide@serendiva.com"        # [PLACEHOLDER]
$env:ADMIN_SEED_PASSWORD = "<a long, unique password>"
$env:ADMIN_SEED_NAME = "Dinesh Jayasuriya"           # [PLACEHOLDER]

npx prisma migrate deploy                 # no-op if the container already applied them
npm run db:seed -- --skip-content         # creates the admin only; never touches content
```

Sign in at `https://www.serendiva.com/admin` and change the password right away (Change password).

**Sample content** (for a staging branch, or a first launch while the real texts and photos are prepared —
it is **[PLACEHOLDER]** content from the design mock-up):

```powershell
npm run db:seed -- --force                # replaces tours, destinations, reviews, FAQs, blog, gallery, availability, settings
# copy the sample photos into R2 (uses the production storage settings for this window)
$env:STORAGE_DRIVER = "s3"; $env:S3_ENDPOINT = "https://<ACCOUNT_ID>.r2.cloudflarestorage.com"; $env:S3_BUCKET = "serendiva-media"
$env:S3_ACCESS_KEY_ID = "..."; $env:S3_SECRET_ACCESS_KEY = "..."; $env:S3_PUBLIC_URL = "https://media.serendiva.com"
npm run media:import-seed
```

The seed never deletes inquiries, proposals, newsletter subscribers or admin users. Close the PowerShell window
afterwards so the production credentials do not linger.

---

## 6. Connect the website

In the website's hosting (`serendiva-web`):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.serendiva.com` |
| `NEXT_PUBLIC_API_URL` | `https://api.serendiva.com` (browser → API: public forms; allowed by the API's CORS) |
| `API_URL` | `https://api.serendiva.com` (server → API and the `/api/v1/*` rewrite used by the admin panel) |
| `REVALIDATE_SECRET` | the same value as the API's `REVALIDATE_SECRET` |
| `IMAGE_REMOTE_HOSTS` | `media.serendiva.com` (so `next/image` may load R2 images) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key, if `TURNSTILE_SECRET` is set in the API |

The admin panel talks to the API through the website's own `/api/v1/*` rewrite, so its cookies are first-party
(topology A in the [README](../README.md#cors-and-cookies-deployment-topologies)).

---

## 7. Verify the deployment

```powershell
$api = "https://api.serendiva.com"
Invoke-RestMethod "$api/health"
Invoke-RestMethod "$api/health/ready"                                   # database: up
(Invoke-RestMethod "$api/api/v1/settings/public").contact
curl.exe -sI "$api/api/v1/tours" | Select-String "cache-control|etag|x-request-id|strict-transport"
# CORS preflight as the website would send it -> access-control-allow-origin: https://www.serendiva.com
curl.exe -s -o NUL -D - -X OPTIONS "$api/api/v1/inquiries" -H "Origin: https://www.serendiva.com" -H "Access-Control-Request-Method: POST" | Select-String "access-control"
```

Then, in a browser:

1. Sign in at `https://www.serendiva.com/admin`; change the password.
2. Send an inquiry through the website: the guide receives the notification (reply-to = visitor), the visitor
   the confirmation, and the inquiry shows `emailStatus: sent` in the admin panel.
3. Change a tour in the admin panel: the public page shows the change within seconds (revalidation). If not,
   check the API log for *revalidation request was rejected* (secret mismatch).
4. **`TRUST_PROXY`:** open `https://api.serendiva.com/health` on your phone (mobile data) and find the request
   in the API log: `req.remoteAddress` must be the phone's public IP (compare with "what is my IP"). If it is a
   private (10.x, 172.16–31.x, 192.168.x) or proxy address, increase `TRUST_PROXY` by one, redeploy, repeat.
5. Upload a photo in the media library and check that it loads from `https://media.serendiva.com/media/...`,
   and that `https://media.serendiva.com/private/anything` is blocked.

---

## 8. Production checklist

**Secrets and configuration**
- [ ] `NODE_ENV=production` (set by the Dockerfile).
- [ ] `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REVALIDATE_SECRET`: long, random, different from each other
      and from `.env.example`; stored only in the platform's secret store and your password manager.
- [ ] The seeded admin password was changed after the first sign-in; `ADMIN_SEED_*` are not set on the server.
- [ ] `API_PUBLIC_URL`, `FRONTEND_URL` use `https://` and the final domains.

**CORS and cookies**
- [ ] `CORS_ORIGINS` lists exactly the website origin(s) (`https://www.serendiva.com`, `https://serendiva.com`),
      no wildcards, no `http://localhost`.
- [ ] Topology A (Next.js rewrite): `COOKIE_DOMAIN` empty, `COOKIE_SAMESITE=lax`, `COOKIE_SECURE=auto`.
- [ ] Sign-in works in Safari and Chrome; cookies show `HttpOnly`, `Secure`, `SameSite=Lax`.

**Network**
- [ ] `TRUST_PROXY` set to the verified hop count (section 7) — never `true`.
- [ ] HTTPS only (platform TLS), custom domain certificate issued.
- [ ] Exactly one API instance; health check path `/health`.

**Database**
- [ ] Neon direct connection string with `sslmode=require`; API and database in the same region.
- [ ] Migrations applied (`prisma migrate deploy` in the deploy log).
- [ ] Neon history retention / point-in-time restore window known; a first manual `pg_dump` taken and a restore
      tested (section 9); a backup schedule in place.

**Email**
- [ ] Sending domain **verified** in Resend (SPF, DKIM, DMARC records), `MAIL_FROM` on that domain,
      `EMAIL_DRIVER=resend` (never `console` in production — the API logs a warning).
- [ ] `GUIDE_NOTIFY_EMAIL` is the guide's real inbox; a test inquiry arrived (not in spam).
- [ ] Email retry job enabled (`EMAIL_RETRY_DISABLED=false`).

**Storage**
- [ ] `STORAGE_DRIVER=s3`, R2/S3 credentials scoped to the one bucket.
- [ ] **`private/` prefix is not publicly readable** (R2: WAF rule on the custom domain + `r2.dev` disabled;
      S3: public read only for `media/*`). Proposal attachments live there.
- [ ] Website `IMAGE_REMOTE_HOSTS` includes the media domain.

**Spam and abuse**
- [ ] `FORM_RATE_LIMIT` sensible (default 5/min); Turnstile configured if spam appears.

**Logging and monitoring**
- [ ] `LOG_LEVEL=info`; logs are JSON on stdout with request ids; cookies/authorization are redacted and form
      bodies are never logged.
- [ ] An uptime monitor on `https://api.serendiva.com/health` alerts you (and the guide) when it is down.
- [ ] Someone watches for `inquiry emails not fully delivered` warnings (or checks `emailStatus` in the admin).

**Website**
- [ ] `REVALIDATE_SECRET` identical in both apps; an admin change shows up on the site.
- [ ] `NEXT_PUBLIC_API_URL` / `API_URL` point at the production API.
- [ ] All **[PLACEHOLDER]** content replaced (texts, photos, contact details, licence numbers, guide name).

---

## 9. Database backups

Neon already keeps a change history for **point-in-time restore**; regular `pg_dump` files are your independent
copy (another provider, another account, offline). Dumps contain visitors' personal data (inquiries,
newsletter emails): store them encrypted and delete old ones.

### pg_dump / pg_restore (PowerShell)

Install the PostgreSQL client tools (`winget install PostgreSQL.PostgreSQL.16`, or use Docker below). The
`pg_dump` major version must be **the same or newer** than the server's (check Neon's project settings).

```powershell
# Back up (custom format: compressed, restorable table by table)
$env:BACKUP_URL = "postgresql://neondb_owner:<password>@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
New-Item -ItemType Directory -Force backups | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
pg_dump --format=custom --no-owner --no-acl --dbname "$env:BACKUP_URL" --file "backups\serendiva-$stamp.dump"

# Inspect a dump
pg_restore --list "backups\serendiva-$stamp.dump" | Select-Object -First 20

# Restore into an EMPTY database (a new Neon branch, a local database, ...)
$env:RESTORE_URL = "postgresql://..."   # NOT the production database unless you mean it
pg_restore --clean --if-exists --no-owner --no-acl --dbname "$env:RESTORE_URL" "backups\serendiva-$stamp.dump"
```

Without local client tools, run them in Docker (use the image tag that matches the server's major version):

```powershell
docker run --rm -v "${PWD}\backups:/backups" postgres:16-alpine `
  pg_dump --format=custom --no-owner --no-acl --dbname "$env:BACKUP_URL" --file "/backups/serendiva-$stamp.dump"
docker run --rm -v "${PWD}\backups:/backups" postgres:16-alpine `
  pg_restore --clean --if-exists --no-owner --no-acl --dbname "$env:RESTORE_URL" "/backups/serendiva-$stamp.dump"
```

Local docker-compose database:

```powershell
docker compose exec db pg_dump -U serendiva --format=custom --file /tmp/serendiva.dump serendiva
docker compose cp db:/tmp/serendiva.dump ".\backups\serendiva-local-$stamp.dump"
# restore
docker compose cp ".\backups\serendiva-local-$stamp.dump" db:/tmp/restore.dump
docker compose exec db pg_restore -U serendiva --clean --if-exists --no-owner --dbname serendiva /tmp/restore.dump
```

Always write dumps with `--file`: in Windows PowerShell 5.1, redirecting binary output with `>` re-encodes it and
corrupts the dump.

**Schedule:** a Windows Task Scheduler task that runs a `.ps1` with the `pg_dump` lines daily (and copies the
file to cloud storage) is enough for this site. Keep e.g. 14 daily and 12 monthly dumps. **Test a restore**
into a scratch database at least once per quarter, then point a local API at it and open the admin panel.

### Neon branching and point-in-time restore

- **Look at old data without touching production:** Neon console → **Branches → New branch** → *Past data*
  (pick a timestamp within your plan's history window) → connect to that branch with its own connection
  string, or `pg_dump` it.
- **Roll production back:** Neon console → `main` branch → **Restore** → choose the time. Neon saves the current
  state as a backup branch first, so the restore itself can be undone. Afterwards restart the API.
- **Before risky changes** (large migrations, a `db:seed -- --force`), create a branch from `main` as a
  snapshot.
- The history window depends on the Neon plan — check *Settings → Storage* (history retention) and choose it
  together with your `pg_dump` schedule.

### Uploaded files

With R2/S3 the database only stores keys/URLs; back up the bucket too, e.g. with
[rclone](https://rclone.org) (`rclone sync r2:serendiva-media .\backups\media`). With the local driver, back up
the `uploads` folder/volume.

---

## 10. Updates, migrations and rollback

- **Deploy:** push to `main` → CI (lint, typecheck, tests, migration check, build) → the platform builds the image
  and starts it; the container applies new migrations, then serves traffic once `/health` answers.
- **Schema changes:** edit `prisma/schema.prisma`, run `npm run db:migrate -- --name <change>` locally, commit
  the new folder in `prisma/migrations/`. The old version keeps serving while the new one starts, so prefer
  additive changes (add a column → deploy → use it → remove old columns in a later release).
- **Rollback:** redeploy the previous version (Render: *Rollback*; Railway: *Redeploy* an earlier deployment;
  Fly: `fly releases` then `fly deploy --image <previous image>`). Migrations are forward-only; if a migration
  must be undone, restore the database (Neon restore / branch) to before the deploy.
- After API changes that touch schemas, run `npm run openapi:export` and regenerate the website's types.

## 11. Logging and monitoring

- Logs are pino JSON lines on stdout: `level`, `time`, `reqId`, `req` (`method`, `url`, `remoteAddress`),
  `res.statusCode`, `responseTime`, and errors with stack traces. Every response has an `x-request-id` header;
  search the logs for it when the guide reports a problem.
- Cookies and the `Authorization` header are redacted; form contents are never logged (only ids/references).
- Where: Render *Logs* (and log streams to an external service), Railway *Logs/Observability*, `fly logs`.
- Useful warnings to alert on: `inquiry emails not fully delivered`, `revalidation request failed`,
  `proposal attachment could not be stored`, and any `level` ≥ 50 (error).
- Add a free uptime monitor (e.g. Better Stack or UptimeRobot) on `/health`, and optionally on
  `/health/ready` every 10–15 minutes (more often keeps Neon awake).
