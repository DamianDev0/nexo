# ADR-0010: Tenant data model declared as object metadata

- **Status:** Proposed
- **Date:** 2026-09-16
- **Deciders:** NexoCRM Architecture
- **Plan:** [`docs/plans/2.1-objetos-configurables.md`](../plans/2.1-objetos-configurables.md)

## Context

ADR-0009 made views, table layout, filters, inline edits, import and bulk actions
generic, but only over a closed union of record types (`contact | company | deal`).
Two limits remain:

1. **Every business noun that is not a contact, company or deal needs code.** A clinic
   has appointments, a real estate agency has properties, a workshop has vehicles.
   Today each would be a new module, new tables and new web slices.
2. **Custom fields live as JSON in `public.tenants.config.customFields`.** They are
   validated per module, cannot be indexed, sit outside the tenant schema and are
   described in three places (settings, import mapper, web form).

The product promise for phase 2 is that a company models its business in Nexo in under
ten minutes, from an industry template, without a consultant
([benchmark](../research/crm-adaptability-benchmark-2026-09.md) §1–§4). Every
adaptable CRM studied converges on the same skeleton: object and field metadata, a
generic record API derived from it, labelled associations and hard limits against
sprawl. They differ in where metadata lives and how records are stored.

Constraints from existing decisions: schema-per-tenant isolation (ADR-0001), money as
integer centavos (ADR-0002), modules talk through events (ADR-0004), layered module
internals (ADR-0005), settings as the shared reference module (ADR-0008), the object
engine (ADR-0009), and Contacts must not regress.

## Decision

We will describe every tenant's data model as metadata stored in the tenant schema, keep
standard objects in their own tables, store tenant-defined objects in one generic
`records` table, and derive the record API, views, board, form and record page from that
metadata.

| #   | Decision                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Metadata lives **inside each tenant schema** (`object_definitions`, `field_definitions`, `association_definitions`, `metadata_versions`). It is cached in Redis by `tenantId:metadataVersion`.                             |
| D2  | Tenant-defined objects are stored in **one `records` table**: real columns for what every object shares (name, owner, tags, pipeline, stage, audit) and `properties JSONB` for fields.                                     |
| D3  | Standard objects (`contact`, `company`, `deal`) **stay in their tables**. They are described with `is_system = true`, and their existing columns map to `field_definitions` with `storage = 'column'`.                     |
| D4  | An object is identified by an **immutable slug `key`** (`contact`, `inmueble`). Renaming changes only `label_singular` and `label_plural`.                                                                                 |
| D5  | Relations live in `record_associations` typed by `association_definitions`, with a **paired label** ("Propietario" / "Inmueble de") and a cardinality. Existing foreign keys are exposed as read-only system associations. |
| D6  | `ObjectType` becomes a **string validated against metadata** instead of a closed union. `object_views.object_type` drops its CHECK constraint.                                                                             |
| D7  | **One value validator** in `shared/object-engine/validation` is called from the API, import, bulk actions and, later, automations. No module validates field values on its own.                                            |
| D8  | Permissions v1 are **per object and role** (`min_role_view`, `min_role_edit`). Existing per-field permissions move to `field_definitions.config.permissions`. Record-level permissions are out of scope.                   |

Guardrails that come with the decision:

- **Limits per plan** (`plans.limits`): custom objects, fields per object, records per
  custom object and association labels per pair, surfaced in Settings with a warning at
  70 % and a 422 with a Spanish message when exceeded.
- **Templates first.** Objects are created mainly from a template or a suggestion; a
  blank object is possible but not the primary path.
- **No branching on keys.** Engine code (`shared/object-engine`,
  `entities/object-descriptor`, `widgets/records-board`) never tests `industry` or a
  specific object key. CI greps for it.
- `currency` fields store integer centavos in `properties`, exactly as columns do.

## Consequences

**Positive:**

- A new business noun is configuration: an admin installs a template and gets a menu
  entry, board, form, record page, filters, import and bulk actions without a deploy.
- Field rules are enforced once, identically in every write path.
- Metadata is isolated, backed up and restored with its tenant; no cross-schema joins.
- Contacts, companies and deals keep their proven tables, indexes and foreign keys.
- Custom field columns get typed filters and accent-insensitive search as a by-product,
  which closes audit findings C5, C7, C13, X8 and X10.

**Negative / trade-offs:**

- JSONB filtering is slower than typed columns. Mitigation: expression indexes created
  per filterable number or date field by a background job (`CREATE INDEX CONCURRENTLY`),
  a cap on combined conditions and p95 budgets in the perf suite (list 120 ms, numeric
  filter 150 ms, search 180 ms at 100k records).
- Associations have no database foreign key because both ends can live in different
  tables. The service enforces existence, active state and tenant, and cleans up on
  permanent deletion.
- Two storage strategies (`table` and `records`) must stay behind one interface; engine
  code cannot assume either.
- Migrating `config.customFields` into `field_definitions` touches every tenant. It ships
  in its own PR behind a compatibility layer that keeps `/settings/custom-fields/:entity`
  and the current forms working, with the Contacts Playwright suite as the gate.
- Metadata cached across API instances can go stale. Mitigation: a monotonic version in
  the database, cache keyed by version and an `ETag` on `GET /objects`.

**Neutral / notes:**

- Promoting a very large custom object to its own physical table is designed but not
  built: DDL would be generated from metadata when an object outgrows the Business
  plan limit.
- `config.customFields` stays read-only for one version and is removed with ADR-0011.
- Migration numbers in the plan are tentative; each gets the next free number when it
  merges.

## Alternatives considered

- **Central metadata in `public` (Twenty).** Rejected: breaks the natural isolation of
  schema-per-tenant, complicates per-tenant backup and restore, and needs cross-schema
  joins on every request.
- **Generated DDL per object.** Rejected for v1: every field change becomes a live
  migration on the tenant schema, which is slow, lock-prone and hard to roll back. The
  volumes of Colombian SMBs fit comfortably in a generic table.
- **Move contacts, companies and deals into `records`.** Rejected: high risk on the one
  object that is already hardened, audited and load-tested at 50k rows, for no user
  benefit.
- **A foreign-key column per relation.** Rejected: needs DDL for each new relation and
  cannot link arbitrary object pairs.
- **Keep the closed `ObjectType` union.** Rejected: incompatible with tenant-defined
  objects.
- **Validation per module.** Rejected: the audit found import, bulk edit and inline edit
  already disagreeing on the same rules (C8, C11).
- **Record-level permissions now.** Rejected for v1: object and role permissions cover
  SMB needs, and record-level sharing is a larger design.
