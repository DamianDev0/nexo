# SOP — NexoCRM Operational Runbooks

Standard procedures. Each runbook: when it's used, exact steps, verification, rollback.

## Index

| Runbook                                       | When                                               |
| --------------------------------------------- | -------------------------------------------------- |
| [local-dev-setup](local-dev-setup.md)         | Bring the project up from scratch on a new machine |
| [testing](testing.md)                         | Run and understand the test pyramid + gates        |
| [tenant-migration](tenant-migration.md)       | Run migrations across all tenants                  |
| [deploy-and-rollback](deploy-and-rollback.md) | Deploy and revert                                  |
| [incident-response](incident-response.md)     | DIAN / Wompi / tenant-leak incidents               |

## Convention

Every command assumes the monorepo root unless stated. App prefix: `pnpm --filter api …` / `pnpm --filter web …`.
