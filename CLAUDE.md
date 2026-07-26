# NexoCRM — Agent Guide (CLAUDE.md)

Multitenant CRM SaaS for Colombian SMBs. Turborepo + pnpm monorepo.
Product source of truth: `docs/PRD.md`. Architecture: `docs/architecture.md`.
Execution roadmap: `docs/ROADMAP.md`. Decisions: `docs/adr/`. Runbooks: `docs/sop/`.

## Stack (verified in code)

Node 20 LTS · TypeScript 5 strict · NestJS 11 · Next.js 14 App Router (Turbopack) ·
**TypeORM** (data-source + migrations; older docs say Prisma — obsolete) ·
PostgreSQL 16 + pgvector · Redis 7 + BullMQ · Tailwind · shadcn/ui · Socket.io ·
REST API client (axios + TanStack Query on web; older docs say tRPC — verify).

## Structure

- `apps/api` — NestJS. Modular monolith, bounded contexts. Modules do NOT import each other: communication is **EventBus only**.
- `apps/web` — Next.js. **Feature-Sliced Design** (app / views / widgets / features / entities / shared) + Atomic Design inside `shared/ui`.
- `packages/*` — shared-types, shared-utils, ui, configs.

## Critical rules (break the product if violated)

- **Tenant isolation**: schema-per-tenant. Every query runs against the resolved tenant schema. Every DB-touching module needs an isolation test (tenant A cannot see B's data → 404). See `docs/sop/tenant-migration.md`.
- **Money**: ALWAYS COP cents as integer `BIGINT`. Never `DECIMAL/FLOAT`. `$100,000 = 10_000_000`. See `docs/adr/0002`.
- **Dates**: DB in UTC `TIMESTAMPTZ`; UI in `America/Bogota` (UTC-5, no DST), format `DD/MM/YYYY`.
- **IDs**: UUID v4 (`gen_random_uuid()`). Never sequential in URLs.
- **DIAN invoices**: never deleted — only voided with a credit note. Never deliver an invoice to the customer before DIAN validation.
- **Secrets**: never in code. Validate env with zod at startup. Never log tokens/NITs/emails/passwords.

## Conventions

- Files `kebab-case`; classes/types `PascalCase`; vars/funcs `camelCase`; constants `UPPER_SNAKE_CASE`.
- Prefer `type` over `interface` for DTOs. `any` only with a justifying comment.
- Always `async/await`, never `.then().catch()`.
- Errors: NestJS exceptions (`NotFoundException`, etc.), never `throw new Error()`.
- Backend validates with class-validator (DTOs). Frontend validates with Zod.
- Next.js: Server Component by default; `'use client'` only for state/events/browser APIs. Client data via TanStack Query, never manual fetch.
- Per-layer detail: `docs/backend-standards.md`, `docs/frontend-standards.md`.

## Code

- **Zero comments** unless they explain a non-obvious _why_. Delete obvious comments when touching a file.
- No dead code. Use the `simplify` skill for cleanup.

## Testing (CI gates)

Pyramid: 70% unit / 25% integration / 5% e2e. Detail and commands: `docs/sop/testing.md`.

- Merge to `main` blocked by: tenant isolation, NIT validation, tax calculation, webhook idempotency, green suite.
- Minimum coverage: global 70%, invoices/payments 85%, auth 80%, utils/validators 95%.
- Run: `pnpm test` (all) · `pnpm --filter api test` (Jest) · `pnpm --filter web test` (Vitest) · `pnpm test:e2e`.

## Git

- Branches: `feature/E0X-slug`, `bugfix/…`, `hotfix/…`, `chore/…`.
- Conventional Commits: `feat(contacts): …`, `fix(auth): …`, `test(deals): …`.
- Do not commit or push unless the user asks. If on `main`, branch first.

## Colombia

- NIT: validate check digit (DIAN modulo 11). DB stores unformatted digits + separate DV.
- Documents: CC (8-10 digits), NIT (9+DV), CE/PP alphanumeric, TI minors.
- Geo: municipalities/departments in `packages/shared-utils/colombia-geo.ts`.
- Taxes: VAT 19/5/0% per line; renta/IVA/ICA withholdings; ICA per municipality.
