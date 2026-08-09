---
name: nexo-context
description: Full NexoCRM project context — architecture, conventions, forbidden antipatterns, gotchas, commands. Load at session start (auto-injected via SessionStart hook) or before any task touching apps/api, apps/web, or packages/*. Prevents re-discovering the codebase from zero and repeating known mistakes.
---

# NexoCRM — Session Context

Multitenant CRM SaaS for Colombian SMBs. Turborepo + pnpm. Backend ~67% of B2B PRD (20 modules), frontend ~10% (auth, onboarding, dashboard, contacts, settings). Money module (DIAN/Wompi/WhatsApp), Automation and AI: 0 code. Retail/POS pivot is FROZEN — never build it. Current phase: Phase 1 (Audit + Hardening), Phase 2 (CRM Frontend) starting.

## ⚠️ Stale docs — do NOT trust

`docs/architecture.md`, `docs/backend-standards.md`, `docs/frontend-standards.md` describe **Prisma, tRPC, NestJS 10, `components/atoms`** — all obsolete. Authoritative sources: `CLAUDE.md`, `docs/frontend-architecture.md` (v2.0), `docs/adr/0005`, `docs/adr/0006`, and the code itself. Real stack: **NestJS 11 + TypeORM raw SQL + REST · Next 16 App Router + React 19 + Tailwind v4 + FSD · PG16+pgvector · Redis 7 + BullMQ**.

## Memory protocol

Before investigating anything non-trivial: `mem_search "<query>"` (Engram, project `nexo`, 76+ observations). After fixing bugs / making decisions: `mem_save`. The gotchas section below is a snapshot — Engram is the live source.

## Architecture (load-bearing rules)

- **Modular monolith** (ADR-0004): modules in `apps/api/src/modules/` NEVER import each other — EventBus domain events only. Grandfathered exceptions: `audit-log`, `auth`, `tenants`.
- **Schema-per-tenant** (ADR-0001): `public` = platform data; `tenant_xxx` = per-tenant. Tenant resolved server-side in `shared/tenant/tenant.middleware.ts` (subdomain → dev header → JWT `tenantId`). ALL tenant data access through `TenantDbService.query/transactional(schemaName, cb)` — never client-supplied schema.
- **Layered module internals** (ADR-0005), enforced pre-commit by `scripts/check-api-architecture.mjs`:
  `controllers/` (HTTP only) → `services/` (orchestration, ZERO SQL, ≤400 lines) → `repositories/` (ALL SQL, returns Row types, never imports DTOs) + `mappers/` (pure functions, no DI) + `dto/ interfaces/ constants/ events/ listeners/`.
- **Frontend FSD** (ADR-0003/0006): `app → views → widgets → features → entities → shared`, downward imports only, consume slices via `index.ts`. Atomic Design only inside `shared/ui`; shadcn vendor code isolated in `shared/ui/shadcn/`.
- Slice segments: `config/` (constants, no React) · `lib/` (pure functions, no hooks) · `model/` (hooks/state) · `query/` (TanStack) · `api/` (server actions/DAL) · `ui/` (components; no data fetching except `ui/containers/`).

## API modules (20)

activities · api-keys · audit-log · auth · bulk-actions · companies · contacts · dashboard · deals · geo · message-templates · notifications · products · saved-filters · settings · tags · tenants · timeline · users · webhooks. (invoices/payments/whatsapp/automation/ai: not built yet.)

## Forbidden — backend

1. Cross-module imports (EventBus only).
2. SQL / `createQueryBuilder` / `qr.query` outside `repositories|queries|constants|entities|migrations`.
3. `${expr}` interpolation in SQL strings — use `$n` bind params.
4. Repository importing DTOs; controller importing repositories; `@Injectable` mappers.
5. Route handler without `@Auth`/`@ApiEndpoint`/`@Public`.
6. `throw new Error()` (NestJS exceptions) · `.then().catch()` · `console.log` (Logger) · `any` without justifying comment.
7. Money as DECIMAL/FLOAT — always integer COP cents in BIGINT (`$100,000 = 10_000_000`, ADR-0002). Assert `Number.isInteger` in money tests.
8. Deleting DIAN invoices (void with credit note); delivering invoice before DIAN validation.
9. Merging a DB-touching module without cross-tenant isolation e2e test (tenant A → tenant B resource = 404).
10. Non-idempotent webhooks; webhooks without signature verification; rate limit by IP (use per-tenant in Redis); unencrypted third-party tokens; logging tokens/NITs/emails/passwords.

## Forbidden — web (11 pre-commit cops, frozen baselines in `apps/web/scripts/baselines/`)

1. FSD direction violations (eslint-plugin-boundaries) · deep imports into slice internals.
2. Data fetching/stores inside `ui/` (react-query, zustand, axios, dal) — `ui/containers/` exempt.
3. Files >200 lines · `page.tsx` >5 lines (re-export only) · `*Props` with >5 props.
4. Hardcoded colors outside `styles/globals.css` + `shared/config/tokens`.
5. Raw `<button> <input> <select> <table> <textarea>` outside `shared/ui/`.
6. **Any comment** that isn't a recognized pragma (`check-no-comments`).
7. Missing test mirror: `features|entities/<slice>/{lib,model}/` needs `*.test.ts(x)` in `apps/web/tests/` (never in src/).
8. i18n desync (`es.ts`/`en.ts` key sets must match); inline user-facing strings.
9. `useEffect` for data fetching · manual fetch to mutate (use Server Actions + `revalidateTag`) · filters/pagination in Zustand instead of URL · Zustand for server data.
10. `any` (use `unknown`+narrow) · array index as key · `||` for nullish (use `??`) · MM/DD/YYYY (Colombia = DD/MM/YYYY, America/Bogota) · raw money strings (use `formatCOP`).
11. Dead deps — don't reintroduce: `@repo/ui`, `sonner`, `@dnd-kit/*`, `socket.io-client`, `@tanstack/react-table`.

## Frontend defaults

Server Components by default; `'use client'` only for hooks/DOM/browser APIs. Mutations = Server Actions (`'use server'` → zod → `apiFetch` → `revalidateTag`). Single HTTP exit: `shared/api/client.ts` `apiFetch<T>`. State: URL > RSC > useState/useActionState > Zustand (last resort). TanStack Query only for kanban DnD / realtime inbox / bulk inline-edit. Backend validates with class-validator; frontend with Zod.

## Known gotchas (from Engram)

- `scripts/api-architecture-baseline.json` keys by exact file path — moving a file un-grandfathers its violations.
- Stale `apps/api/tsconfig.tsbuildinfo` → phantom TS6053 after file moves; delete it.
- Raw SQL goes through `sqlRows<T>(qr, sql, params)` (`src/shared/database/sql.util.ts`) — kills no-unsafe-\* warnings.
- Endpoints use composite `@ApiEndpoint({ summary, roles?, param?, status? })` decorator (`src/shared/decorators/api-endpoint.decorator.ts`).
- Shared test helpers: `src/shared/testing/` (tenant-db.mock, tenant-context.mock, crud-assertions) — reuse, jscpd enforced at 0 clones.
- Contact status/source are data-driven strings validated against `tenant_config.contactTaxonomy` — the enums no longer exist.
- `GroovyPopover` inside Dialog/Sheet: pass `autoFocusContent` or cmdk comboboxes close on type.
- Tenant theming: `ThemeCssService.build` must emit every token `globals.css` declares — partial token sets silently break theming.
- Next 16: middleware renamed → `src/proxy.ts`.
- `npx shadcn add` blind is a landmine (`components.json` `aliases.ui`).

## Commands

```bash
pnpm dev                              # everything (web :3001)
docker compose up -d                  # PG16+pgvector, Redis 7
pnpm lint                             # eslint + both arch cops
pnpm check:arch                       # api cop full scan
pnpm --filter web check:arch          # 11 web cops
pnpm --filter api typecheck · test · test:e2e
pnpm --filter web check-types · test · test:e2e
pnpm --filter api migration:generate|migration:run|migrate:dry|migrate|seed
```

## Testing gates

70/25/5 pyramid. Coverage: global 70% · invoices/payments 85% · auth 80% · shared-utils 95%. Merge-to-main P0 gates: tenant isolation, NIT validation, tax calc, webhook idempotency, green suite. Jest (api) · Vitest+MSW (web) · Playwright e2e · Stryker mutation (web). For HOW to write web tests (patterns, e2e journey, visual, perf, races, mutation): load the `nexo-testing` skill.

## Git

Branches `feature/E0X-slug` / `bugfix/` / `hotfix/` / `chore/`. Conventional Commits, kebab scope, ≤72 chars. Never commit/push unless asked.
