# Agent & Skill Orchestration — NexoCRM

How we use agents and skills so we don't improvise. Rule: the task picks the tool, not the other way around.

## Own agents (`.claude/agents/`)

| Agent                       | Use                                            | Mode         |
| --------------------------- | ---------------------------------------------- | ------------ |
| `code-auditor`              | Audit a module/slice → ranked findings         | read-only    |
| `tenant-isolation-verifier` | Adversarial verification of cross-tenant leaks | read-only    |
| `test-author`               | Write unit/integration/e2e and raise coverage  | writes tests |

## Harness agents

- `Explore` — broad read-only searches (fan-out across many files).
- `Plan` — design the implementation strategy for a feature.
- `general-purpose` — open-ended multi-step tasks.

## Installed skills we use

| Skill                 | When                                               |
| --------------------- | -------------------------------------------------- |
| `/code-review`        | Review every PR (correctness + quality)            |
| `/security-review`    | Sensitive changes: auth, payments, isolation, DIAN |
| `fsd-nextjs-frontend` | Phase 2 — build UI with FSD + Atomic               |
| `ddd` / `ddd-dotnet`  | Domain modeling in new modules                     |
| `simplify`            | Cleanup after a feature                            |
| `bmad-*`              | Brainstorming, adversarial review, doc sharding    |

## Phase 1 (audit) pattern — parallel Workflow

Fan-out: 1 `code-auditor` per module in parallel → each critical finding passes through `tenant-isolation-verifier` (adversarial) → synthesis into `docs/audit/`. Only verified findings survive. Requires explicit user opt-in (token cost).

## Feature pattern (Phases 2-4)

1. `Plan` designs the feature against the PRD + ADRs.
2. Implement following standards + the matching skill.
3. `test-author` covers the feature.
4. `/code-review` + `/security-review` before merge.
5. If the feature makes an architectural decision → new ADR.

## Principle

All non-trivial work is audited/adversarially verified before being called done. A finding without a reproduction path doesn't count. A tautological test doesn't count.
