# Architecture Decision Records (ADR)

Record of NexoCRM's significant architectural decisions. Format: simplified [MADR](https://adr.github.io/madr/).

## When to write an ADR

Any decision that is: costly to reverse, affects multiple modules, defines a contract, or that someone will ask "why was it done this way?" about in 6 months.

## Process

1. Copy `0000-template.md` → `NNNN-title-in-kebab.md` (NNNN = next number).
2. Initial status: `Proposed`. Discuss in PR.
3. On approval: `Accepted` + date. When replaced: `Superseded by ADR-XXXX`.
4. Never delete or edit the content of an accepted ADR — supersede it with a new one.

## Index

| #                                                        | Title                                                          | Status   |
| -------------------------------------------------------- | -------------------------------------------------------------- | -------- |
| [0001](0001-multitenancy-schema-per-tenant.md)           | Multitenancy schema-per-tenant                                 | Accepted |
| [0002](0002-money-as-integer-centavos.md)                | Money as integer cents                                         | Accepted |
| [0003](0003-frontend-fsd-atomic.md)                      | Frontend Feature-Sliced Design + Atomic                        | Accepted |
| [0004](0004-modular-monolith-eventbus.md)                | Modular monolith with EventBus                                 | Accepted |
| [0005](0005-api-layered-modules-repositories-mappers.md) | Layered module internals: repositories, mappers, thin services | Accepted |
