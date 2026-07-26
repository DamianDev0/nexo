# SOP — Incident Response

**When:** production failure. Prioritize containment over root cause.

## Severities

| Sev  | Definition            | Examples                                                         |
| ---- | --------------------- | ---------------------------------------------------------------- |
| SEV1 | Data or money at risk | Cross-tenant leak, double charge, incorrect DIAN invoice emitted |
| SEV2 | Core function down    | Login down, invoices not emitting, payments not reconciling      |
| SEV3 | Degradation           | High latency, delayed notifications                              |

## General flow

1. **Contain**: stop the bleeding (disable feature/workflow, pause queue, revert deploy).
2. **Communicate**: log in the incident channel; SEV1 notifies the Owner.
3. **Diagnose**: structured logs by correlation ID; review the `audit-log`.
4. **Resolve + verify**.
5. **Blameless postmortem** → if the decision changes architecture, write an ADR.

## Specific playbooks

### Cross-tenant data leak (SEV1, R-07)

1. Identify the endpoint/module via logs and tenant IDs.
2. If actively exploitable: disable the endpoint.
3. Ley 1581: a breach is reported to the SIC within < 24h.
4. Reproduce with an isolation test; fix; the test becomes a permanent regression.

### DIAN error > 1% (SEV2)

1. Check MATIAS/Factus (DIAN provider) status.
2. Invoices stay in `pending_dian`, are **not** delivered to the customer. Confirm none went out without a CUFE.
3. Retry the queue when the provider recovers (jobs are idempotent).

### Wompi webhook (SEV2)

1. Webhooks have no guaranteed retry: check idempotency (double process = 1 payment).
2. Manual reconciliation from the receivables dashboard if a payment was left unmarked.

## Retention

Security logs ≥ 2 years (Ley 1581). Invoice/payment audit: immutable.
