# RFC 0001 — Turning Nexo into a configurable multi-industry CRM

Status: Ready to implement
Audience: the agent picking up this work in a fresh session
Scope: `apps/api/src/modules/settings`, `apps/api/src/modules/contacts`, `apps/api/src/shared`, `apps/web/src/features/manage-settings`, `apps/web/src/entities/nomenclature`

---

## 0. Read this first

Nexo is a multitenant CRM for Colombian SMBs. The goal of this work is that a roofing company in Medellín, a real-estate agency, a clinic and a B2B agency all run **the same Nexo**, differing only in workspace configuration — no `if (industry === ...)` anywhere.

**The architecture for that is already right.** This is not a rewrite. The domain never imports terminology, taxonomies use stable `key` + optional `label`, deals are independent of contacts, and the frontend has no industry branching. What is broken is that several of these mechanisms are **built but not wired**: they run, write to the database, and nothing reads the result.

Everything below was verified against the running code and the live database on 2026-08-18. Line references are accurate as of that date; re-verify before editing.

Do not trust `docs/architecture.md`, `docs/backend-standards.md` or `docs/frontend-standards.md` — they describe Prisma, tRPC and an old folder layout. Authoritative: `CLAUDE.md`, `apps/web/CLAUDE.md`, `docs/frontend-architecture.md`, `docs/adr/`, and the code.

---

## 1. Verified state

### Works, do not rebuild

| Capability                                         | Where                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| Terminology per workspace (`nomenclature`)         | `config.nomenclature`, `TenantConfigService.getNomenclature`                  |
| Domain is terminology-free                         | zero `nomenclature` references inside `modules/contacts` and `modules/deals`  |
| Configurable taxonomies for status / source / type | `TaxonomyOption` in `packages/shared-types/src/settings.ts:376`               |
| Deals independent from contacts, N per contact     | `deals.contact_id` nullable; `DealsRepository` filters by `contactId`         |
| Custom-field write path on all three objects       | `customFields.validate(...)` in the contacts, deals and companies controllers |
| Pipelines + stages per workspace                   | `pipelines`, `pipeline_stages`                                                |
| Saved views / smart lists (storage)                | `contact_views`, `saved_filters`                                              |
| Per-user table layout                              | `contact_workspace_states.user_id`                                            |
| Module on/off                                      | `settings/guards/module-enabled.guard.ts`                                     |
| Design tokens + tenant theming                     | `ThemeCssService`                                                             |
| GIN indexes on `custom_fields`                     | `jsonb_path_ops` on contacts, companies, deals, products                      |

### The `TaxonomyOption` shape — reuse it, do not invent a new one

```ts
export type TaxonomyOption = {
  key: string // stable identity, never changes
  label: string | null // workspace override; null falls back to i18n
  description: string | null
  color: string
  order: number
  isSystem: boolean // shipped by Nexo, cannot be deleted
  enabled: boolean // archive flag — soft disable, keeps history valid
}
```

This already satisfies the "stable id, configurable label, archive don't delete" requirement. Anything new that needs configurable options must use this type.

---

## 2. The four defects to fix

Ranked by what actually makes Nexo feel like a sales CRM.

### D1 — Industry presets never take effect 🔴 highest visible impact

`SettingsService.buildIndustryConfig` (`apps/api/src/modules/settings/services/settings.service.ts:93`) writes:

```ts
config.industry = { sector, nomenclature, iconPack, pipelinePreset }
```

But `TenantConfigService.getNomenclature` reads **`config.nomenclature`**, a different key. Nothing anywhere reads `config.industry`. No pipeline stage rows are created.

Proof from the live database:

```
slug        | sector      | config.nomenclature is not null
nexo-acme   | tecnologia  | f
```

Also: `SettingsService.applyIndustryPreset` (line 74) — the dedicated method for this — has **zero callers** in the entire repo. It is dead code.

Net effect: choosing an industry during onboarding changes nothing the user ever sees.

### D2 — Lifecycle is a hardcoded enum 🔴 the semantic lock-in

`packages/shared-types/src/enums.ts:11`

```ts
export enum LifecycleStage {
  SUBSCRIBER,
  LEAD,
  MQL,
  SQL,
  OPPORTUNITY,
  CUSTOMER,
  EVANGELIST,
}
```

This is HubSpot's B2B funnel imposed on every tenant. A clinic has no MQLs. It is also **inconsistent with Nexo's own design**: `status`, `source` and `type` stopped being enums and moved to `contactTaxonomy`; lifecycle never followed.

Used in exactly two places, both as a default value:

- `apps/api/src/modules/contacts/services/contacts.service.ts:266`
- `apps/api/src/modules/contacts/mappers/contact-import-row.mapper.ts:75`

### D3 — Custom fields can be written but never read 🔴 the engine with no output

Backend is complete: 16 types, per-entity, `required`/`unique`/`order`, select options with colors, min/max, relations, formulas, per-role permissions. Validation runs on create and update for contacts, deals and companies.

Frontend: `grep -rn "customFields" apps/web/src` → **0 results**.

Consequences:

- no admin screen to define fields
- not rendered in any form
- not available as table columns
- `ContactsRepository` selects `custom_fields` but never filters by it
- `saved_filters` has no notion of them
- the import wizard offers 17 fixed fields; a "Metros cuadrados" column can only be discarded

### D4 — Domain events are dead 🟠 blocks everything downstream

`apps/api/src/modules/webhooks/webhooks.listener.ts:18-24` subscribes to `contact.**`, `company.**`, `deal.**`, `activity.**`, `invoice.**`, `payment.**`, `product.**`.

The entire API emits **two** events: `audit.entity` and one auth event. The names `contact.created`, `deal.stage_changed` etc. exist only as values of the `AuditAction` enum travelling **inside the payload** of `audit.entity` — never as event names.

So: **webhooks never fire**, and there is no substrate for automation, lifecycle rules, or "Closed Won → lifecycle = Customer".

---

## 3. Secondary findings (fix opportunistically, do not block on them)

| Finding                                                                                                                                                                      | Evidence                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Taxonomy is **not enforced** — `status`/`source`/`type` are plain `@IsString()`; any string is accepted                                                                      | `modules/contacts/dto/contact.dto.ts:114-132`   |
| `getContactTaxonomy` is consumed **only** by the settings controller, never by contacts                                                                                      | grep: 3 hits, all in `settings/`                |
| Formula fields are dead — `CustomFieldsComputer` is registered in the module and never invoked                                                                               | `settings.module.ts:52`                         |
| `FieldDef` has no `groupId` → grouped forms impossible without changing the type                                                                                             | `settings/interfaces/custom-field.interface.ts` |
| `FieldDef` has no `isActive`/`isArchived` → deleting a field orphans jsonb values                                                                                            | same file                                       |
| No config audit trail for nomenclature, taxonomy, custom fields, field permissions, sidebar, theme — `TenantConfigService` has zero `audit.` calls (`SettingsService` has 2) | grep count                                      |
| Field permissions are stored and served but **never enforced** on any read/write path                                                                                        | grep: only settings files reference them        |
| Bulk actions are 4 fixed operations (`assign`, `tag`, `untag`, `softDelete`) — not configuration-driven                                                                      | `bulk-actions/services/bulk-actions.service.ts` |
| No contact lifecycle history (deals have `deal_stage_history`)                                                                                                               | information_schema                              |
| No config versioning, no configurable searchable fields, no record layouts                                                                                                   | grep: no hits                                   |
| `contacts` has no `priority` column (deals does)                                                                                                                             | information_schema                              |

---

## 4. Work plan

Order matters — later items depend on earlier ones.

### Step 1 — Make industry presets real (fixes D1)

Smallest change, largest perceived effect.

**Backend**

`IndustryPreset` currently only carries `nomenclature`, `iconPack`, `pipelineStages`. Extend it to a full configuration preset:

```ts
export interface IndustryPreset {
  sector: IndustrySector
  nomenclature: TenantNomenclature // note: full shape, matching config.nomenclature
  iconPack: string
  pipelineStages: PipelineStagePreset[]
  lifecycleStages: TaxonomyOption[] // depends on Step 2 — see note below
  statuses: TaxonomyOption[]
  sources: TaxonomyOption[]
  types: TaxonomyOption[]
  tags?: { name: string; description: string; color: string }[]
}
```

Then write a `applyPreset(tenantId, sector, schemaName)` that **materialises** into the keys that are actually read:

- `config.nomenclature` ← `preset.nomenclature` (not `config.industry.nomenclature`)
- `config.contactTaxonomy` ← statuses / sources / types / lifecycleStages
- real rows in `pipelines` + `pipeline_stages`
- rows in `tags`
- keep `config.industry = { sector, iconPack }` as provenance only

Route it through the existing `TenantConfigService` setters (`updateNomenclature`, `updateContactTaxonomy`) so cache invalidation happens — do **not** write `config` directly, or the Redis caches go stale.

Call it from the onboarding flow. Today `SectorPicker` sets the sector via `PATCH /settings` and `buildIndustryConfig` runs inline (`settings.service.ts:61`); replace that inline call with `applyPreset`. Delete the dead `applyIndustryPreset`.

**Idempotency**: applying a preset to a workspace that already has data must not wipe it. Only apply to `isSystem` options and only when the tenant has not customised them, or gate it behind explicit user confirmation. Decide this before writing code.

**Nomenclature shape mismatch**: `IndustryPreset.nomenclature` is `{ contacts, companies, deals }` (plural strings) while `TenantNomenclature` is `{ contact: { singular, plural }, ... }`. The presets must be rewritten in the target shape. All 15 sectors in `industry-presets.ts` need updating.

**Verify**: create a workspace with sector `salud`, then `GET /settings/nomenclature` must return Pacientes, and the contacts page must show "Pacientes" in the sidebar without any further action.

---

### Step 2 — Lifecycle becomes a taxonomy (fixes D2)

**Backend**

1. Add `lifecycleStages: TaxonomyOption[]` to `ContactTaxonomy` (`packages/shared-types/src/settings.ts:386`) and to `DEFAULT_CONTACT_TAXONOMY`, seeded with the current 7 enum values as `isSystem: true` so existing rows stay valid.
2. Extend `normalizeTaxonomy` (`tenant-config.service.ts:312`) with the new collection.
3. Extend `TaxonomyReassignKind` and `ContactsRepository.reassignTaxonomyColumn` to accept `lifecycle` — needed so archiving a stage can move its contacts.
4. Change the DTO from `lifecycleStage?: LifecycleStage` to `lifecycleStage?: string` (`contact.dto.ts:141` and `:250`).
5. Replace `LifecycleStage.SUBSCRIBER` defaults in `contacts.service.ts:266` and `contact-import-row.mapper.ts:75` with the first enabled stage from the tenant's taxonomy.
6. Update `contact-import.mapper.ts` — `isLifecycleStage` currently validates against the enum; it must validate against the tenant catalog. Note this requires passing the taxonomy into the import mapper, which today only receives the tag catalog.
7. Keep the `LifecycleStage` enum exported as the seed constant for defaults. Do not delete it; delete only its use as a validation boundary.

**Frontend — this is nearly free**

`TaxonomyPane` is already generic: `StatusPane` is literally

```tsx
export function StatusPane() {
  return <TaxonomyPane kind="statuses" />
}
```

So the lifecycle admin screen is `<TaxonomyPane kind="lifecycleStages" />` plus a route under `settings/contacts/lifecycle/` and a `PANES` entry in `views/settings/ui/SettingsView.tsx`. Extend the `TaxonomyKind` union in `features/manage-settings/lib/taxonomy-edit.ts`.

Also update the lifecycle filter and the contacts table cell to read labels from the catalog instead of the i18n enum keys (`common.filters.hints.lifecycleStage.*`).

**Verify**: rename a stage in Settings, confirm the contacts table, the filter chips and the import all show the new label, and that stored rows still resolve.

---

### Step 3 — Custom fields get a read path (fixes D3)

Four consumers, in this order:

**3a. Admin screen** — `Settings → Fields`. New pane in `features/manage-settings`, one section per entity (contacts / companies / deals), consuming the existing CRUD at `/settings/custom-fields/:entity`. Model it on the taxonomy panes.

Before building it, resolve two schema gaps:

- add `isActive: boolean` to `FieldDef` and make delete an archive, so jsonb values are never orphaned (mirrors `TaxonomyOption.enabled`)
- add `groupId?: string` if grouped forms are wanted, otherwise explicitly defer grouping

**3b. Record form** — render custom fields in `features/create-contact`. Build a `type → component` map for the 16 field types. Values live under `customFields` in the form payload; the backend already validates them.

Watch the frontend cops: max 5 props per component, ≤200 lines per file, no fetching inside `ui/`.

**3c. Table columns** — merge tenant custom fields into `CONTACT_COLUMN_CATALOG` (`modules/contacts/constants/contact-columns.catalog.ts`) so they become selectable columns. `ContactColumnDef` needs a marker distinguishing core from custom, because the accessor differs (`contact[key]` vs `contact.customFields[key]`).

**3d. Filtering and sorting — read this before promising it**

The GIN indexes are `USING gin (custom_fields jsonb_path_ops)`. `jsonb_path_ops` supports **containment (`@>`) only**. It does **not** support ordering or range queries.

So today you can index-support `field = value`. You cannot index-support `budget > 50000000` or `ORDER BY custom_fields->>'budget'`. Doing either means a sequential scan over the whole tenant.

Pick one before writing filter code:

- **(a)** allow equality filters only on custom fields — cheap, honest, ships now
- **(b)** add per-field expression indexes for the ones marked filterable/sortable — requires DDL at field-creation time, per tenant schema
- **(c)** promote hot fields to real typed columns — fastest queries, heaviest machinery

Recommendation: ship (a), design `FieldDef` with a `filterable`/`sortable` flag so (b) can arrive later without a breaking change.

**3e. Import** — concatenate tenant custom fields onto `CONTACT_FIELD_DEFS` in `modules/contacts/constants/contact-import.mapper.ts` so the mapping step offers them. This is the smallest of the five and the most visible: today a "Metros cuadrados" column can only be discarded.

---

### Step 4 — Emit domain events (fixes D4)

Mechanical and high leverage.

`EventBusService` is a thin wrapper over `EventEmitter2`. The listener contract already expects:

```ts
interface CrmEvent {
  schemaName: string
  entityType: string
  entityId: string
  _eventName?: WebhookEvent
  [key: string]: unknown
}
```

Emit real named events alongside the existing audit call — in the services, not the controllers, and after the transaction commits:

```
contact.created  contact.updated  contact.deleted  contact.lifecycle_changed
deal.created     deal.stage_changed  deal.won  deal.lost
activity.created activity.completed
```

Reuse the `AuditAction` string values as event names so the two stay in sync.

The moment this lands, webhooks start working with no other change. Verify with a webhook pointed at a request bin.

**Do not build a workflow engine in this session.** The `workflows` table exists with no module. Events first; the engine is a separate piece of work.

---

### Step 5 — Contact lifecycle history (do it early even without UI)

This one is time-sensitive in a way the others are not: **transitions that happen before the table exists are unrecoverable**. Every day without it is analytics permanently lost.

New tenant migration — next id is `0029` in `apps/api/src/shared/database/tenant-migrations.ts`:

```ts
{
  id: '0029_contact_lifecycle_history',
  up: (schema) => `
    CREATE TABLE IF NOT EXISTS "${schema}".contact_lifecycle_history (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contact_id  UUID NOT NULL REFERENCES "${schema}".contacts(id) ON DELETE CASCADE,
      from_stage  VARCHAR(50),
      to_stage    VARCHAR(50) NOT NULL,
      reason      TEXT,
      source      VARCHAR(30),
      changed_by  UUID,
      changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_${schema}_clh_contact
      ON "${schema}".contact_lifecycle_history (contact_id, changed_at DESC);
  `,
}
```

Mirror `deal_stage_history`. Write to it from `ContactsService.update` whenever `lifecycleStage` changes, in the same transaction. Run `pnpm --filter api migrate` (dry-run first with `migrate:dry`).

---

### Step 6 — Cheap correctness fixes

- **Audit config changes**: `TenantConfigService` has zero `audit.` calls. Inject `AuditLogService` and call `settingsUpdated(tenantId, userId, schemaName, meta, description)` from `updateNomenclature`, `updateContactTaxonomy`, `updateCustomFields`, `updateFieldPermissions`, `updateSidebarConfig`. Signature at `audit-log.service.ts:202`.
- **Field permissions**: either enforce them on read/write, or remove the endpoints. Shipping the admin UI without enforcement ships a false security promise. Enforcing is the larger job — if deferring, at minimum stop exposing it in the UI.
- **Enforce taxonomy**: `status`/`source`/`type` accept arbitrary strings. Validate against the tenant catalog the same way `ContactsService.resolveTags` validates tags.
- **Wire or delete `CustomFieldsComputer`**: call it on contact/deal/company create+update so `formula` fields compute, or drop the type from `FIELD_TYPES` until it is wired.

---

## 5. Explicitly out of scope

- **Custom Objects.** Dynamic schema, dynamic permissions, dynamic navigation and dynamic search — a separate product. For Colombian SMBs the payoff does not justify it. Revisit only with a concrete enterprise customer.
- **Jobs as a fifth core object.** `deals` has 13 backend files and **zero frontend pages**. Adding a fifth object before the fourth has a UI is how this stalls. Most verticals can model a Job as a deal in a post-sale pipeline. Build it when a paying customer needs it.
- **Workflow engine.** Emit events now; the engine later.
- **Config versioning.** Audit trail first (Step 6); versioning only if an enterprise deal requires it.

---

## 6. Non-negotiable repo rules

Full detail in `CLAUDE.md` and `apps/web/CLAUDE.md`. The ones this work will trip over:

**Backend**

- Modules never import each other — EventBus only. `settings` is imported by contacts/deals/companies for `CustomFieldsValidator`; that is already established, keep it that way.
- Layering: controllers → services (zero SQL) → repositories (all SQL). Mappers are pure, no `@Injectable`.
- SQL uses `$n` bind params, never `${}` interpolation. Go through `sqlRows<T>(qr, sql, params)`.
- Tenant data only via `TenantDbService.query/transactional(schemaName, cb)`.
- Money is integer COP cents in BIGINT.
- NestJS exceptions, never `throw new Error()`. No `console.log`.
- Every DB-touching change needs a cross-tenant isolation test (tenant A cannot reach tenant B → 404).

**Frontend** — 11 pre-commit cops, `pnpm --filter web check:arch`

- ≤200 lines per file, ≤5 props per `*Props`
- **zero comments** — this is enforced by a cop, not a preference
- no hardcoded colors; tokens only
- no raw `<button>/<input>/<select>/<table>` outside `shared/ui`
- no data fetching inside `ui/` except `ui/containers/`
- tests mirror `src/` under `tests/`, never inside `src/`
- `es.ts` and `en.ts` key sets must match exactly
- Server Components by default; `'use client'` only for state/events/browser APIs

**Server-side i18n gotcha**: `getT()` in `shared/i18n/server.ts` now supports `{{var}}` interpolation (added 2026-08-18). Tenant terminology in server-rendered metadata goes through `getEntityLabel(entity, form)` in `entities/nomenclature/server.ts`.

**Git**: branch `feature/E0X-slug`, Conventional Commits, **never commit or push unless explicitly asked**.

---

## 7. Verification

Per step:

```bash
pnpm --filter api typecheck && pnpm --filter api test
pnpm --filter web check-types && pnpm --filter web test
pnpm --filter web check:arch          # 11 cops
node scripts/check-api-architecture.mjs
pnpm --filter api migrate:dry         # before any tenant migration
```

Current baseline, all green as of 2026-08-18: **989 web tests, 565 api tests**, all cops passing. Any red is something this work introduced.

Manual checks that matter more than the suites:

1. New workspace with sector `salud` → sidebar says Pacientes, pipeline stages exist, lifecycle stages are the healthcare set — **with zero manual configuration**.
2. Rename a lifecycle stage → table, filters and import all follow; stored contacts still resolve.
3. Define a custom field "Tipo de techo" → appears in the contact form, as a table column, and as an import mapping target.
4. Point a webhook at a request bin, create a contact → it fires.

---

## 8. Definition of done for this session

Nexo stops being a sales CRM when all four are true:

1. Picking an industry at onboarding visibly configures the workspace.
2. A workspace can define its own lifecycle stages, and nothing in the code depends on `LifecycleStage`.
3. A custom field defined in Settings is visible in the form, the table and the import.
4. Creating a contact emits `contact.created` and the webhook fires.

The rest of the RFC's checklist — custom objects, jobs, automation engine, config versioning — are features Nexo does not have. They are not broken promises and they are not what makes it feel industry-locked. These four are.

---

## 9. The test to apply to every future feature

Before implementing anything, ask:

> Can this work for a completely different industry without changing the core domain model?

- "Add Property Type" → create a custom field, **not** a `property_type` column
- "Rename Leads to Patients" → update terminology, **not** rename the entity
- "Turn Lead into Customer" → update the lifecycle key, **not** create a Customer record
- "Roofing needs Inspections" → custom field + pipeline, **not** `if (industry === 'roofing')`
