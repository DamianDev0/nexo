# ADR-0006: Frontend architecture gates in pre-commit

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** NexoCRM Architecture

## Context

A deep audit of the contacts/settings work found recurring antipatterns that code review kept missing: data fetching inside `ui/` components, `*Props` types growing past 5 props, slices importing another slice's internals instead of its `index.ts`, and markup or helpers duplicated across slices when a shared version already existed. ESLint boundaries enforces layer direction but none of these finer rules; they only surfaced when a human audited the diff.

## Decision

Four scripted checks join the existing three (`file-size`, `colors`, `html-primitives`) in `apps/web/scripts/`, each with a frozen baseline:

- `check-ui-purity` — no `@tanstack/react-query`, `shared/api/services`, `shared/api/dal`, `zustand`, `axios` or slice `query/` imports inside `ui/` (containers exempt).
- `check-props-count` — any `*Props` interface/type with more than 5 top-level props fails; group with object-as-props.
- `check-cross-slice-imports` — `@/<layer>/<slice>/<segment>/…` imports from outside that slice fail; consume the slice's `index.ts`.
- `check-shared-duplication` — the same long `className` repeated in two slices, or a local `function`/`const` redeclaring a name exported from `shared/lib` or `@repo/shared-utils`, fails.

All seven run in `pnpm lint` (`check:arch`) and per-commit via lint-staged, so a commit introducing a fresh violation is rejected. Baselines regenerate only with `--update` and only when legacy shrinks.

## Consequences

**Positive:**

- The audit's findings are now regressions a machine catches at commit time, not review-time archaeology.
- Legacy debt is visible and monotonically decreasing (baseline shrink is reported on every run).

**Negative:**

- Heuristic checks (regex, not AST) can false-positive; the escape hatch is the baseline file, reviewed in the diff.
- Pre-commit gains ~1s per web commit.
