# SOP — Testing

**When:** before opening a PR, and to understand what blocks a merge.

## Pyramid

```
        E2E (5%)         Playwright + MSW — critical business flows
   Integration (25%)     Jest + Supertest + PG Docker (api) · MSW (web services)
      Unit (70%)         Jest (api) · Vitest (web) — services, validators, hooks, utils
```

## Tools per app

- **api**: Jest (`pnpm --filter api test`), e2e Jest+Supertest (`test:e2e`), real PG via Docker.
- **web**: Vitest (`pnpm --filter web test`), Playwright (`test:e2e`), MSW to mock the backend.
- **Perf/stress**: k6 (to introduce in Phase 1/5) — load, spike, soak profiles.
- **Lighthouse**: Lighthouse CI over key pages (to introduce in Phase 2).

## Commands

```bash
pnpm test                       # whole suite (turbo)
pnpm --filter api test          # api unit + integration
pnpm --filter api test:e2e      # api e2e (requires Postgres + seed)
pnpm --filter web test          # web unit (vitest)
pnpm --filter web test:e2e      # playwright
pnpm --filter web check:arch    # file-size + colors + html-primitives
```

## Gates (block merge to `main`) — P0

Must be green: **tenant isolation**, **NIT validation**, **tax calculation**, **webhook idempotency**, and the full suite. See `docs/test-strategy.md §2`.

## Minimum coverage

| Scope                                  | Minimum                        |
| -------------------------------------- | ------------------------------ |
| Global                                 | 70%                            |
| invoices / payments                    | 85% (legal/financial critical) |
| auth                                   | 80%                            |
| utils / validators (NIT, money, dates) | 95%                            |

## New-module rule

Every DB-touching module **must** include an isolation test: a request authenticated as tenant A cannot read tenant B's data (expects 404). Without that test, it does not merge.

## Regression

Every PR runs the full suite + Playwright visual snapshots. A changed snapshot is reviewed manually before approval.
