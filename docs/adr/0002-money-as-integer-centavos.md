# ADR-0002: Money as integer COP cents

- **Status:** Accepted (backfill)
- **Date:** 2026-07-25
- **Deciders:** NexoCRM Architecture

## Context

The product handles DIAN invoicing and payment reconciliation: amounts must be exact. Floating-point arithmetic (`0.1 + 0.2 !== 0.3`) produces cent-level errors that are unacceptable in electronic invoicing (DIAN rejection, receivables mismatch).

## Decision

All amounts are stored and computed as **integer COP cents** (`BIGINT`). `$100,000 COP = 10_000_000`. `DECIMAL`, `FLOAT`, `NUMERIC` are forbidden for money. Formatting to `$1,250,000` happens only in the presentation layer via `formatCOP`.

## Consequences

**Positive:**

- Exact arithmetic; forecast, taxes and withholdings with no floating-point drift.
- Uniform contract across the whole app (DB, API, calculations).

**Negative / trade-offs:**

- Must remember to divide/format only in the UI; a raw `cents` value shown is a visible bug.
- Requires tests asserting `Number.isInteger` on calculation results.

## Alternatives considered

- **Decimal library (decimal.js)** — correct but adds weight and complex cross-layer serialization; integer cents is simpler and sufficient for COP (no sub-cent subdivision).
