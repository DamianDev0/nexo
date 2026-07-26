# SOP — Local Dev Setup

**When:** new machine or a broken environment to rebuild.

## Requirements

- Node 20 LTS, pnpm 8, Docker.

## Steps

1. Install dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```
2. Bring up infra (Postgres 16 + pgvector, Redis 7):
   ```bash
   docker compose up -d
   ```
   Postgres: `localhost:5432` (user `nexocrm` / pass `nexocrm_dev` / db `nexocrm`). Redis: `localhost:6379`.
3. Environment variables: copy each app's `.env.example` and fill it. They are validated with zod at startup — if something is missing, the process fails to boot (intentional).
4. Migrations + seed:
   ```bash
   pnpm --filter api migration:run
   pnpm --filter api seed
   ```
5. Start:
   ```bash
   pnpm dev            # everything (turbo)
   # or per app:
   pnpm --filter api dev    # NestJS watch
   pnpm --filter web dev    # Next.js turbopack, port 3001
   ```

## Verification

- API responds on its port; Swagger available (`@nestjs/swagger`).
- Web at `http://localhost:3001`.
- `pnpm --filter api test` green.

## Common issues

- **Boot fails on env**: check which var the zod message reports as missing.
- **DB connection**: confirm via `docker compose ps` that Postgres is `healthy`.
