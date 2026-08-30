# NexoCRM — Execution Roadmap

> Operational source of truth. Replaces the loose tracking in `sprint-status.yaml`.
> Each phase has **measurable exit criteria**. No phase advances without meeting them.
> Current strategic goal: **finish the PRD's B2B product**. Retail/POS pivot frozen.

---

## Status (2026-08-30)

| Layer                              | Reality                                               | %               |
| ---------------------------------- | ----------------------------------------------------- | --------------- |
| Backend core                       | 20 modules, ~640 tests, 30 migrations                 | ~67% of B2B PRD |
| Frontend                           | Only 4 pages (auth, onboarding, dashboard). No CRM UI | ~10%            |
| Money module (DIAN/Wompi/WhatsApp) | 0 code                                                | 0%              |
| Automation + AI                    | 0 code                                                | 0%              |
| Project documentation              | ADR/SOP/ROADMAP created in Phase 0                    | —               |

Real shippable product today: **~25%**. The backend ran ahead of the frontend and of the module that justifies the price.

---

## Phase 0 — Foundation (docs + governance) · IN PROGRESS

**Goal:** stop improvising. Organizational scaffolding.

- [x] Root `CLAUDE.md` (rules condensed for the harness)
- [x] `docs/ROADMAP.md` (this file)
- [x] ADR system (`docs/adr/`) + backfilled decisions
- [x] SOP runbooks (`docs/sop/`)
- [x] Agent roster (`docs/AGENTS.md` + `.claude/agents/`)

**Exit criteria:** any future agent can orient itself from `CLAUDE.md` → docs alone.

---

## Phase 1 — Audit + Hardening of what exists · IN PROGRESS

**Goal:** verify and harden the base before building on top. Do not build on the unaudited.

**Audit done (2026-07-25):** parallel multi-agent audit of 15 modules → 71 findings, adversarially verified. Full report: [`docs/audit/phase-1-report.md`](audit/phase-1-report.md).

- **0 confirmed cross-tenant data leaks** — isolation holds structurally (schema is server-derived). The 15 "isolation" findings are actually the **missing mandatory isolation test** (coverage debt), not leaks.
- **1 confirmed exploit**: Google OAuth auto-provisions unknown accounts as tenant OWNER (account takeover).
- Test baseline already 362/362 green (the "16 failing" note was stale).

**Remaining work (remediation sequence in the report):**

- [x] Multi-agent audit + adversarial verification.
- [x] Green test baseline confirmed.
- [x] Security P0: Google OAuth OWNER bug, invite privilege escalation, webhooks SSRF + secret/`schemaName` leak — fixed, 374 tests green.
- [x] **e2e harness repaired** — was fully broken (uuid ESM, missing AWS env, supertest import, outdated auth flow, stale tenant cache). Built `test/helpers/e2e.ts`; `tenant-isolation` + `tenant-match` specs green (5/5) with real cross-tenant 404. Unblocks all integration/e2e testing.
- [x] Isolation-test sweep — 9 resource modules now have real-HTTP cross-tenant e2e specs (companies, deals, products, activities, tags, saved-filters, message-templates, webhooks, api-keys) + contacts. e2e suite 11 files / 32 tests green.
- [ ] Isolation tests for the remaining read/aggregation/config modules (notifications, dashboard, audit-log, timeline, bulk-actions, users-invite) — need a tailored approach, not the create→404 pattern.
- [ ] Fix `migrate-all-tenants` TypeORM CLI (broken under pnpm) + supply full e2e env to CI's `e2e` job (JWT/cookie/AWS) so the isolation gate actually runs in CI.
- [ ] DTO validation sweep (7 controllers with inline-object bodies).
- [ ] Money fixes: deals float-vs-int cents, products bind-param bug, kanban float coercion.
- [ ] Coverage ≥ 70% global, ≥ 95% in `packages/shared-utils`.

**Exit criteria:**

- [x] 0 confirmed tenant leaks (adversarial verification).
- [ ] Security P0 items fixed + regression tests.
- [ ] Full suite green in CI with isolation gate enabled.
- [ ] Coverage ≥ 70% global, ≥ 95% in `packages/shared-utils`.

Gate: only after Security P0 + isolation gate does Phase 2 begin. DTO/money/architecture paydown can run in parallel with Phase 2.

---

## Phase 2 — CRM Frontend (the bulk of the work)

**Goal:** give a face to the already-built backend. Skill `fsd-nextjs-frontend`.

Order by slice (each: list + detail + form + tests + e2e + lighthouse):

1. Contacts (CRUD, FTS, timeline, tags, saved filters)
2. Companies (NIT, associated contacts)
3. Deals — kanban pipeline drag&drop + forecast
4. Activities + calendar
5. Products + inventory
6. Settings UI (custom fields, pipelines, theme, nomenclature)
7. Inbox/conversations (shell — filled in Phase 3)

**Exit criteria:**

- [ ] Every backend endpoint has UI.
- [ ] Playwright + MSW e2e per critical flow, green.
- [ ] Lighthouse: perf ≥ 90, a11y ≥ 90 on key pages.
- [ ] Installable PWA, basic offline (contacts/deals cached).

---

## Phase 3 — Money Module (justifies the price)

**Goal:** the PRD's retention hook.

1. DIAN resolution config + authorized numbering.
2. Invoice emission via MATIAS/Factus (CUFE, UBL 2.1, PDF+QR). MSW in tests.
3. Credit note (voiding).
4. Wompi: payment link + reconciliation webhook (idempotent).
5. Receivables (cartera) dashboard.
6. Basic WhatsApp: invoice + payment link (shared number).

**Exit criteria:**

- [ ] DIAN invoice approved in sandbox end-to-end.
- [ ] Idempotent Wompi webhook (test: double send = 1 payment).
- [ ] invoices/payments coverage ≥ 85%.
- [ ] Performance p95 < 200ms; DIAN emit < 30s.

---

## Phase 4 — Automation + AI (flagship feature)

1. Workflow engine on BullMQ (trigger → condition → action).
2. WF-02 automated receivables collection (the most sellable ROI).
3. Lead scoring + AI contact summary (pgvector already in stack).
4. Bidirectional WhatsApp inbox + AI bot.

**Exit criteria:** the PRD's 5 prebuilt workflows running with audit logs.

---

## Phase 5 — Pre-launch hardening

- k6 load + stress (p95 < 200ms under 50 users/tenant, 1000 tenants).
- Isolation pen-test.
- Compliance: habeas data (export/delete), 2-year log retention.
- Observability: structured logs + correlation IDs + DIAN/latency/webhook alerts.

---

## Frozen (out of current focus)

Retail/POS pivot (corner stores, supermarkets, pharmacies): counter POS, barcode, cash drawers/shifts, lots/expiry, DIAN POS ticket, multi-branch. Documented as an opportunity, **not executed until B2B is finished**.
