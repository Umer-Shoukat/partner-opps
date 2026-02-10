# AppOps Hub

Monorepo scaffold for an internal Shopify app portfolio ops system.

## Stack

- Backend: NestJS + Prisma + Postgres
- Jobs: BullMQ + Redis
- Frontend: Next.js (basic admin)

## Run locally

1. Start Postgres + Redis

```bash
cd appops-hub
docker compose up -d
```

2. Install dependencies

```bash
pnpm install
```

3. Configure env
   Copy `.env.example` into:

- `apps/api/.env`
- `apps/worker/.env`
- `apps/web/.env.local`

4. Migrate DB

```bash
pnpm --filter @appops/api prisma:migrate
```

5. Start API + Worker + Web

```bash
pnpm --filter @appops/api dev
pnpm --filter @appops/worker dev
pnpm --filter @appops/web dev
```

Default dev login:

- email: `admin@appops.local`
- password: `admin123`

## Notes

- Ingestion API: `POST /events` (HMAC + nonce replay protection)
- Partner API sync + daily rollups are wired in the worker (currently placeholders until you add Partner org/app ids and app DB connector configs).

# ==============================

# Pushbot / Mailbot / etc

# ==============================

APPOPS_INGESTION_URL=https://appops.yourdomain.com/events

# From AppOps Hub → App → Ingestion Keys

APPOPS_KEY_ID=appops_key_id_here
APPOPS_KEY_SECRET=appops_secret_here

# Safety

APPOPS_REQUEST_TIMEOUT_MS=5000
