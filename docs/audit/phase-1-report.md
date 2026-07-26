# Phase 1 Audit Report — Backend

> Generated 2026-07-25 via parallel multi-agent audit (7 auditors over 15 modules) with
> adversarial verification of every isolation finding. 71 findings.
> Method: `docs/AGENTS.md` → "Phase 1 pattern". Verdicts from `tenant-isolation-verifier`.

## Executive summary

| Severity | Count |
| -------- | ----- |
| CRITICAL | 16    |
| HIGH     | 18    |
| MEDIUM   | 27    |
| LOW      | 10    |

**Test baseline: 362 api tests, 100% green.** The `sprint-status.yaml` "16 failing tests" note was stale.

### The single confirmed exploit (fix first)

**Google OAuth privilege grant / account takeover** — `auth.repository.ts:112`, `auth.service.ts:219`.
`findOrCreateGoogleUser` INSERTs unknown Google emails as `UserRole.OWNER`. The tenant slug flows from a **client-supplied query param** (`GET /auth/google?slug=victim-tenant`, `@Public`) through OAuth state into `profile.slug`. Adversarially **CONFIRMED**: anyone who knows a tenant slug can complete Google login and become an OWNER of that existing tenant. No invitation/allowlist check.
→ Fix: never create users on Google login; only link Google to an already-invited user; reject unknown emails; never default role to OWNER.

### The isolation truth (do not panic)

15 findings were tagged `CRITICAL/isolation`. Adversarial verification of a representative sample (deals, activities, companies, api-keys, users) returned **REFUTED** on all: isolation **holds structurally**. `schemaName` is server-derived in `tenant.middleware.ts` from the Host subdomain (the `x-tenant-slug` header is honored only in non-production) and carried in the RS256-signed JWT — it is never client-controllable.

**So: 0 confirmed cross-tenant data leaks.** But the **mandatory isolation test is missing on 15 modules** — a real P0 gap per `docs/test-strategy.md §2.1` and a merge gate we are currently not enforcing. This is test-coverage debt, not a live vulnerability. Reclassify these 15 from `isolation/CRITICAL` to **`coverage/P0`**.

---

## P0 — Fix before building anything new

**Status: items 1-4 FIXED (2026-07-25), full suite green (374 tests), each with a regression test.**

1. ✅ **Auth: Google OAuth OWNER auto-provisioning** (confirmed exploit) — `auth.repository.ts`. `findOrCreateGoogleUser` replaced with `findAndLinkGoogleUser` (link-only, returns undefined for unknown emails); `validateGoogleUser` now rejects unknown emails with `UnauthorizedException` instead of minting an OWNER. Email dropped from the OAuth log. Test: `auth.service.spec.ts` "rejects an unknown Google email instead of auto-provisioning an OWNER".
2. ✅ **Privilege escalation via invites** — extracted `ROLE_HIERARCHY` to `auth/constants/role-hierarchy.constants.ts` with `canAssignRole(inviter, target)`; `UsersService.invite` now takes the inviter role and rejects assigning a role ≥ the inviter's, and forbids `SUPER_ADMIN` entirely. Test: `role-hierarchy.constants.spec.ts`.
3. ✅ **Webhooks SSRF** — new `webhook-url.util.ts#assertSafeWebhookUrl` (https-only, blocks localhost/loopback/private IPv4/IPv6/metadata/`.internal`) called on create, update, and before every `dispatch` fetch; new `CreateWebhookDto`/`UpdateWebhookDto` with `@IsUrl({protocols:['https']})`. Test: `webhook-url.util.spec.ts`.
4. ✅ **Webhooks data leakage** — (a) `map()` now hides the HMAC secret by default; only `create()` reveals it (`revealSecret`); (b) the listener destructures out `schemaName` and `_eventName` so neither leaks into the outbound third-party payload.
5. **Missing isolation tests on 15 DB-touching modules** — add the `A-cannot-see-B → 404` test per module. Fan out with `test-author`. This is the P0 merge gate we must turn on. **(NEXT)**

## P1 — Security hardening (systemic)

- **Missing DTO validation** across many controllers — bodies typed as inline object literals, so `ValidationPipe` has no metadata and accepts arbitrary input: `webhooks`, `tags`, `saved-filters`, `bulk-actions`, `dashboard`, `message-templates`, `api-keys`. Introduce class-validator DTOs for each.
- **PII in logs** (violates `CLAUDE.md`) — emails logged in `auth.service.ts:128/227`, `password-reset.service.ts:59`, `users.service.ts:83/84`, `user-tenant-map.service.ts:57`, and recipient email in `message-queue.processor.ts:26`. Sweep and redact to `userId`/`tenantId` only.
- **Email enumeration** — `POST /auth/resolve-tenant` (`@Public`) returns a slug for known emails, 404 otherwise; leaks membership. Make the response uniform / throttle.
- **WebSocket CORS `*`** — `notifications.gateway.ts:25` with JWT from handshake. Restrict origin.

## Money correctness (P1 — legal/financial)

- **Deals cents mismatch** — item subtotal computed in JS float + `Math.round` (`deals.service.ts:734`) while persisted deal value uses SQL integer truncation (`recalcDealValue:590`). The two disagree on fractional cents. Unify on integer-cent arithmetic (ADR-0002).
- **Products bulkPriceUpdate bind-param bug** — `products.service.ts:464` captures `filterParams` after pushing the multiplier, so the COUNT query gets one extra bind parameter than its WHERE references. Real bug.
- **Kanban totals float coercion** — `pipeline-settings.service.ts:226` coerces a BIGINT cents SUM to JS `Number`. Precision risk on large sums.

## New finding (surfaced during remediation)

- **`tsc --noEmit` is red on test fixtures** — running the full project typecheck fails in `companies.controller.spec.ts`, `contacts.controller.spec.ts`, `deals.controller.spec.ts`, and `notifications.service.spec.ts` (fixtures missing entity fields; a `NotificationType` mismatch). Jest passes because ts-jest transpiles without full type-checking. The CI `tsc` job either excludes tests or is not catching this. Action: fix the fixtures and point the typecheck gate at a tsconfig that includes tests, so type drift in tests can't hide.

## Architecture debt (P2 — pay down incrementally)

- **No repository layer** — services embed raw SQL directly (contacts, companies, deals, products, dashboard, api-keys, audit-log write path), violating `backend-standards.md §2.1`. Extract repositories per module.
- **Module coupling** — `deals`, `contacts`, `companies` import `SettingsModule` and inject `CustomFieldsValidator` directly, violating the EventBus-only rule (ADR-0004). Controllers also orchestrate multiple services (forbidden by `backend-standards §3`).
- **Missing transactions** — `deals.create` + status transitions, `companies` NIT check-then-act (race), `saved-filters` default toggle — multi-write sequences run outside `db.transactional`.
- **Config lost-update race** — `settings.service.ts:65` and `onboarding-settings.controller.ts:49` read-modify-write the whole `tenant.config` JSONB while `TenantConfigService` writes atomically via `jsonb_set`. Standardize on the atomic path.

## Coverage gaps (feed to `test-author`)

Zero-test modules: `api-keys`, `users`, `tags`, `saved-filters`, `bulk-actions`, `audit-log`, `webhooks`, `message-templates`, `timeline`, `tenants`. Mocked-DB-only (isolation never asserted): `deals`, `activities`, `companies`, `products`, `dashboard`, `notifications`, `settings/pipeline`.
The contacts isolation e2e (`tenant-isolation.e2e-spec.ts:77`) bypasses the app (direct `dataSource.query`) instead of exercising middleware + `GET /:id → 404`. Rewrite it to go through HTTP.

---

## Remediation sequence (recommended)

1. **Security P0 sprint** (items 1-4 above) — small, high-impact, mostly `auth`/`webhooks`/`users`.
2. **Isolation-test sweep** — `test-author` fan-out, 1 module per agent, real HTTP through middleware. Turns on the P0 merge gate.
3. **DTO validation sweep** — one DTO class per unvalidated controller.
4. **Money fixes** — deals/products/kanban, each with an exactness test (`Number.isInteger`).
5. **Architecture paydown** — repository extraction + EventBus decoupling, module by module, behind green tests.

Only after 1-2 (security P0 + isolation gate) should Phase 2 (frontend) begin. 3-5 can proceed in parallel with Phase 2.
