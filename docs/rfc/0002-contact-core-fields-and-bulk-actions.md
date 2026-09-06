# RFC 0002 — Núcleo de contacto agnóstico por industria + Bulk Actions centralizadas

Status: Implementado en `feature/E04-contact-core-bulk-actions` (2026-09-05), incluido deshacer por snapshots (`bulk_action_snapshots`, `POST /bulk-actions/:id/revert`), lista Archivados con `restore` individual y masivo, Papelera en Ajustes (contactos, etiquetas con borrado suave, campos), vista `/bulk-actions`. `score` salió del núcleo (migración 0037): si una industria lo necesita, nace como campo custom numérico. Pendiente: UI web de `assign` y `send_*`, drip en UI.
Fecha: 2026-09-05
Alcance: `apps/api/src/modules/contacts`, `apps/api/src/modules/bulk-actions`, `apps/api/src/modules/settings`, `packages/shared-types`, `apps/web/src/entities/contact`, `apps/web/src/features/*`
Depende de: `docs/audit/sync-and-settings-model-2026-08-30.md` §4 (poda de contactos), `docs/crm-foundations.md` §3–5

---

## 0. Resumen ejecutivo

Dos decisiones, una entidad nueva.

1. **Contacto = núcleo fijo de 22 campos + extensión por preset/custom.** Se elimina de la tabla todo lo que es específico de una industria o que pertenece a otra tabla. Se renombran los campos con nombre "de ventas B2B" a nombres neutros (`job_title` → `role`, `lead_score` → `score`, `linkedin_url` → `social_url`).
2. **Bulk Actions pasa de 4 SQL sueltos a una entidad orquestada `bulk_actions`** con job asíncrono (BullMQ), progreso, actor (desde el JWT), auditoría y reintentos. Nueve acciones: `add_tags`, `remove_tags`, `assign`, `update_field`, `send_email`, `send_sms`, `send_whatsapp`, `export`, `archive`.

Estado verificado en código el 2026-09-05:

| Pieza            | Hoy                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Tabla `contacts` | 38 columnas (`tenant-schema.sql.ts:63` + migraciones 0014/0024/0027/0028)                                 |
| Campos custom    | `tenant_config.customFields.contacts[]` (FieldDef), validador + inferencia ya existen                     |
| Taxonomías       | `status`, `source`, `type`, `lifecycleStage` data-driven en `tenant_config.contactTaxonomy`               |
| Bulk actions     | `POST /bulk/:entity`, 4 acciones síncronas, sin DTO, sin actor, sin auditoría, sin tests, loop por id     |
| Web bulk         | `features/archive-contacts` hace N `DELETE /contacts/:id` con `Promise.allSettled` — no usa `/bulk`       |
| Cola             | BullMQ ya montado (`shared/queue/queue.module.ts`), colas `notifications/messages/invoices/imports`       |
| Auditoría        | `audit-log` escucha `audit.entity` del EventBus; acciones `contact.assigned`, `contact.tagged` ya existen |

---

## 1. Núcleo de contacto

### 1.1 Criterio

Un campo entra al núcleo solo si cumple las tres:

1. Lo necesitan **todas** las industrias (salud, inmobiliaria, comercio, servicios, educación, construcción, tecnología…).
2. Tiene **semántica de sistema**: lo lee alguna feature transversal (dedup, búsqueda, asignación, consentimiento, automatización, timeline).
3. Necesita **índice o FK** (no puede vivir en JSONB).

Si falla cualquiera → preset de industria o campo custom.

### 1.2 Núcleo propuesto (22 columnas)

Agrupado como HubSpot (Contact info · Sales · Communication · System). Nombres de columna nuevos donde aplica.

**Identidad (9)**

| Columna           | Tipo                  | Nota                                                                               |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `id`              | UUID                  |                                                                                    |
| `first_name`      | VARCHAR(100) NOT NULL |                                                                                    |
| `last_name`       | VARCHAR(100)          |                                                                                    |
| `email`           | VARCHAR(255)          | dedup key, índice único parcial `WHERE is_active` (futuro: tabla `contact_emails`) |
| `phone`           | VARCHAR(20)           | E.164. dedup key                                                                   |
| `whatsapp`        | VARCHAR(20)           | E.164. canal #1 en Colombia, se queda                                              |
| `document_type`   | VARCHAR(10)           | CC/NIT/CE/PP/TI. Obligatorio para DIAN                                             |
| `document_number` | VARCHAR(20)           | dedup key                                                                          |
| `avatar_url`      | TEXT                  |                                                                                    |

**Relación comercial (7)**

| Columna             | Tipo              | Nota                                                                            |
| ------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `company_id`        | UUID FK           | asociación B2B                                                                  |
| `assigned_to_id`    | UUID FK           | propietario. Sin dueño el contacto muere                                        |
| `status`            | VARCHAR(30)       | taxonomía tenant                                                                |
| `status_changed_at` | TIMESTAMPTZ       |                                                                                 |
| `lifecycle_stage`   | VARCHAR(30)       | taxonomía tenant; historial en `contact_lifecycle_history`                      |
| `source`            | VARCHAR(50)       | taxonomía tenant. **Fuente original**, inmutable tras creación                  |
| `score`             | INTEGER DEFAULT 0 | renombra `lead_score`. Neutro: en salud es "prioridad", en inmobiliaria "calor" |

**Ubicación (2)**

| Columna          | Tipo         | Nota                                                          |
| ---------------- | ------------ | ------------------------------------------------------------- |
| `city`           | VARCHAR(100) |                                                               |
| `municipio_code` | VARCHAR(5)   | DANE; deriva `department` por lookup en `geo`, no se almacena |

**Sistema (4)**

| Columna                                               | Tipo        | Nota                                       |
| ----------------------------------------------------- | ----------- | ------------------------------------------ |
| `tags`                                                | TEXT[]      | índice GIN                                 |
| `custom_fields`                                       | JSONB       | extensión                                  |
| `last_contacted_at`                                   | TIMESTAMPTZ | escrito por activities/timeline vía evento |
| `is_active`, `created_by`, `created_at`, `updated_at` |             | (cuenta como 1 bloque)                     |

### 1.3 Sale del núcleo

| Columna actual                                   | Destino                                                                                        | Razón                                                                                                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `job_title`                                      | custom field **estándar** `role` (text) en preset base                                         | "Cargo" solo aplica B2B. En salud es "parentesco", en educación "acudiente de". Se renombra a `role` y cada preset lo etiqueta                                           |
| `linkedin_url`                                   | custom `social_url` (url) en presets tecnología/servicios                                      | solo B2B                                                                                                                                                                 |
| `birthday`                                       | custom `birth_date` (date) en presets salud/educación/comercio                                 | útil pero no universal                                                                                                                                                   |
| `address`                                        | custom `address` (text) en presets inmobiliaria/construcción/comercio                          | texto libre sin geo; cuando exista `addresses` tabla, migra                                                                                                              |
| `department`                                     | **derivado** de `municipio_code` vía `geo`                                                     | dato redundante, se desincroniza                                                                                                                                         |
| `country`                                        | eliminar                                                                                       | siempre `CO`; si se abre LatAm, vuelve como columna                                                                                                                      |
| `type` + `type_label`                            | eliminar                                                                                       | `type_label` es un anti-patrón (audit §4.4). `type` se absorbe en `lifecycle_stage` o en un custom `select` del preset. Taxonomía `types` se retira de `contactTaxonomy` |
| `data_consent`, `consent_date`, `consent_source` | tabla `data_consents (contact_id, channel, granted, granted_at, revoked_at, source, evidence)` | Ley 1581 exige evidencia + historial; un booleano no sirve                                                                                                               |
| `opt_out_email/sms/whatsapp`                     | misma tabla `data_consents`, una fila por canal                                                | Ley 2300: canales autorizados con trazabilidad                                                                                                                           |

Resultado: **38 → 22** columnas. Nada se pierde: lo que sale se convierte en FieldDef que el preset enciende.

### 1.4 Renombres (agnósticos de industria)

| Antes             | Después              | Por qué                             |
| ----------------- | -------------------- | ----------------------------------- |
| `leadScore`       | `score`              | "lead" es jerga de ventas B2B       |
| `jobTitle`        | `role` (custom)      | cargo/parentesco/rol según vertical |
| `linkedinUrl`     | `socialUrl` (custom) | no atar a una red                   |
| `birthday`        | `birthDate` (custom) | consistente con `*_date`            |
| `lastContactedAt` | se mantiene          | ya neutro                           |

La **etiqueta** visible la pone la nomenclatura del preset (`Score` → "Prioridad" en salud, "Calificación" en inmobiliaria). El motor de nomenclatura ya existe; se extiende con un mapa `fieldLabels: Record<fieldKey, string>` en `TenantNomenclature`.

### 1.5 Campos custom "estándar de fábrica"

Nuevo concepto: **FieldDef con `isSystem: true`**. Nace en el preset base, el tenant puede desactivarlo (`isActive: false`) pero no borrarlo ni cambiar `key`/`type`. Así `role`, `birth_date`, `address`, `social_url` viven en `custom_fields` JSONB pero con contrato estable para import/export/filtros.

```ts
type FieldDef = {
  // …existente
  isSystem?: boolean // nuevo: definido por Nexo, no borrable
  group?: 'identity' | 'commercial' | 'location' | 'communication' | 'other' // nuevo: agrupa en ficha
}
```

### 1.6 Migración (una sola, reversible)

`0030_contacts_core_prune`:

1. Copiar `job_title, linkedin_url, birthday, address` → `custom_fields` bajo `role, social_url, birth_date, address` (solo si no nulos).
2. Insertar filas en `data_consents` desde `data_consent/consent_*` + `opt_out_*`.
3. `ALTER TABLE … RENAME COLUMN lead_score TO score`.
4. `DROP COLUMN` de los 13 campos salientes.
5. Actualizar `tenant_config.customFields.contacts` inyectando los 4 FieldDef `isSystem` si faltan.
6. Retirar `types` de `contactTaxonomy`.

Down: reconstruir columnas desde JSONB + `data_consents`. Se prueba en `migrate:dry` contra tenant seed antes de correr en todos.

### 1.7 Impacto en código (checklist)

Backend:

- `contact-row.interfaces.ts`, `contact.constants.ts` (CONTACT_COLUMNS, UPDATABLE_FIELDS, FILTERABLE_COLUMNS, SORTABLE_COLUMNS, TAXONOMY_USAGE_SQL sin `type`), `contact.dto.ts`, `contact.mapper.ts`, `contact-import.mapper.ts`, `contact-columns.catalog.ts`.
- `settings/dto/contact-taxonomy.dto.ts` sin `types`; `industry-presets.ts` mueve `jobTitle`/`address`/`birthday` a `customFields.contacts` por sector.
- `shared-types/contacts.ts`: `Contact` con 22 campos; `ContactSortField` sin `leadScore` → `score`.

Web:

- `entities/contact/config/contact-columns.constants.ts` (`leadScore` → `score`), `contact-columns.tsx`, `cell-renderers.tsx`, `custom-field-cells.tsx` (render de `isSystem` igual que custom).
- `features/create-contact` quita `type`/`typeLabel`; agrega `companyId`, `assignedToId`, `documentType/Number` (pendiente del audit §5.3).
- i18n: `contacts.columns.jobTitle` → `contacts.columns.role`, etc.

Tests: `contact.mapper.spec`, `contacts.service.spec`, `contact-import.mapper.spec`, e2e `contacts` isolation; web `contact-sort.test`, `contact-columns` snapshots.

---

## 2. Bulk Actions centralizadas

### 2.1 Cómo lo hacen los referentes

|            | HubSpot                                                                           | GoHighLevel                                                                                                                                                            | Salesforce                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modelo     | Job asíncrono por selección; barra de progreso; "Bulk action history" en Settings | Entidad `Bulk Action` con lista: nombre, tipo, estado, total/procesados/fallidos, creador, programado; pausar/reanudar/cancelar; **drip mode** (N por lote cada X min) | Bulk API 2.0: `job` con `state` (Open→UploadComplete→InProgress→JobComplete/Failed/Aborted), resultados `successfulResults` / `failedResults` / `unprocessedRecords` |
| Selección  | ids explícitos o "todos los que cumplen el filtro"                                | ids o filtro guardado (smart list)                                                                                                                                     | CSV/ids                                                                                                                                                              |
| Actor      | usuario del token, visible en historial                                           | "Created by"                                                                                                                                                           | `createdById`                                                                                                                                                        |
| Límite     | 1.000 por acción UI                                                               | sin límite, drip                                                                                                                                                       | 150M filas/24h                                                                                                                                                       |
| Reversible | no                                                                                | no                                                                                                                                                                     | no                                                                                                                                                                   |

Lo común: **entidad persistida + job asíncrono + progreso + actor + resultados por fila**. Eso es lo que construimos.

### 2.2 Entidad `bulk_actions` (por tenant)

```sql
CREATE TABLE "${schema}".bulk_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity          VARCHAR(20)  NOT NULL,          -- contacts | companies | deals
  action          VARCHAR(30)  NOT NULL,          -- ver §2.3
  params          JSONB        NOT NULL DEFAULT '{}',
  selection_mode  VARCHAR(10)  NOT NULL,          -- ids | filter
  selection_ids   UUID[]       DEFAULT '{}',
  selection_query JSONB,                          -- ContactListQuery serializado (advanced + filtros)
  status          VARCHAR(20)  NOT NULL DEFAULT 'queued',  -- queued | running | paused | completed | completed_with_errors | failed | cancelled
  total           INTEGER      NOT NULL DEFAULT 0,
  processed       INTEGER      NOT NULL DEFAULT 0,
  succeeded       INTEGER      NOT NULL DEFAULT 0,
  failed          INTEGER      NOT NULL DEFAULT 0,
  errors          JSONB        NOT NULL DEFAULT '[]',   -- [{id, message}] capado a 200 (mismo patrón que IMPORT_MAX_ISSUES)
  result_file_url TEXT,                            -- export
  drip            JSONB,                           -- { batchSize, intervalSeconds } opcional (send_*)
  job_id          VARCHAR(100),                    -- BullMQ job id
  created_by      UUID NOT NULL REFERENCES "${schema}".users(id),
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON "${schema}".bulk_actions (created_at DESC);
CREATE INDEX ON "${schema}".bulk_actions (created_by);
```

`created_by` sale **siempre** de `ctx.userId` del JWT (`TenantContext`), nunca del body.

### 2.3 Catálogo de acciones

| `action`        | `params`                                         | Por entidad                | Ejecuta                                                                                                                      | Rol mínimo |
| --------------- | ------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `add_tags`      | `{ tags: string[] }`                             | contacts, companies, deals | UPDATE por lote (no por id): `WHERE id = ANY($1)`                                                                            | manager    |
| `remove_tags`   | `{ tags: string[] }`                             | idem                       | idem                                                                                                                         | manager    |
| `assign`        | `{ assignedToId }`                               | idem                       | idem + evento `*.assigned`                                                                                                   | manager    |
| `update_field`  | `{ field, value }`                               | idem                       | solo campos en allowlist (`status`, `lifecycleStage`, `source`, `score`, custom activos). Valida contra taxonomía / FieldDef | manager    |
| `send_email`    | `{ templateId, variables? }`                     | contacts                   | encola en `messages` por contacto **respetando `data_consents`**; drip opcional                                              | marketing  |
| `send_sms`      | idem                                             | contacts                   | idem                                                                                                                         | marketing  |
| `send_whatsapp` | idem                                             | contacts                   | idem                                                                                                                         | marketing  |
| `export`        | `{ format: 'csv' \| 'xlsx', columns: string[] }` | idem                       | genera archivo, sube a S3, `result_file_url`                                                                                 | sales_rep  |
| `archive`       | `{}`                                             | idem                       | `is_active = false` por lote                                                                                                 | manager    |

`delete` físico **no existe** como bulk. Solo `archive`.

### 2.4 Orquestación

```
POST /bulk-actions                      → valida DTO, resuelve selección, inserta fila (queued), encola job → 202 { id }
GET  /bulk-actions                      → historial paginado del tenant (filtro por actor, entidad, estado)
GET  /bulk-actions/:id                  → estado + progreso (polling cada 2s desde web; SSE luego)
POST /bulk-actions/:id/cancel           → status = cancelled; processor revisa flag entre lotes
POST /bulk-actions/:id/pause | resume   → solo send_* con drip
GET  /bulk-actions/:id/errors           → errores completos (la fila guarda 200; el resto en log)
```

Módulo `bulk-actions` (ADR-0005):

```
bulk-actions/
  controllers/bulk-actions.controller.ts
  dto/bulk-action.dto.ts                 ← class-validator (hoy inexistente)
  services/bulk-actions.service.ts       ← crea entidad, encola, cancela
  services/bulk-action-runner.service.ts ← ejecuta un lote: switch(action) → handler
  handlers/<action>.handler.ts           ← uno por acción, interface BulkActionHandler { entities, run(batch) }
  repositories/bulk-actions.repository.ts   ← CRUD entidad + progreso
  repositories/bulk-targets.repository.ts   ← UPDATE … WHERE id = ANY($1) por tabla
  processors/bulk-actions.processor.ts      ← BullMQ, cola nueva QUEUE_NAMES.BULK
  mappers/bulk-action.mapper.ts
  events/bulk-action.events.ts
```

Flujo del processor:

1. Carga entidad; si `cancelled` → sale.
2. Resuelve targets: `selection_ids` o ejecuta `selection_query` con paginación por cursor (reusa `advanced-filter-sql`).
3. Itera en lotes de 500 (`BULK_BATCH_SIZE`). Cada lote en una transacción: handler → `processed/succeeded/failed` → `UPDATE bulk_actions`.
4. Entre lotes revisa `status` (cancel/pause) y drip.
5. Al terminar: `completed` | `completed_with_errors` | `failed`; emite `bulk_action.completed` → notificación al actor + `audit.entity`.

**Sin cross-module imports.** `send_*` no importa `message-templates`: encola en `QUEUE_NAMES.MESSAGES` con `MessageJobData` (contrato en `shared/queue`). `assign`/`add_tags` emiten `contact.assigned`/`contact.tagged` que `audit-log` ya escucha. Contacts no aprende nada de bulk.

### 2.5 Auditoría y quién lo hizo

- Fila `bulk_actions.created_by` + `AuditAction.BulkActionStarted/Completed/Cancelled` (nuevos) con `metadata: { bulkActionId, action, entity, total }`.
- Cada mutación de fila individual **no** genera un audit por registro (500k filas = 500k audits). Se registra el bulk como unidad; el drill-down está en `bulk_actions.errors` y en `updated_at` de la fila.
- `AuditEntityType.BulkAction = 'bulk_action'`.

### 2.6 Límites y seguridad

- `selection_ids` ≤ 10.000 por request; `filter` sin tope pero con `total` calculado antes de encolar y confirmación en UI si > 1.000.
- Rate limit por tenant en Redis: 5 bulk activos simultáneos.
- `send_*` filtra por `data_consents.granted = true` para el canal. Sin consentimiento → cuenta como `failed` con motivo `no_consent`.
- Test de aislamiento: tenant A crea bulk con ids de tenant B → `total = 0`, `processed = 0`; `GET /bulk-actions/:id` cruzado → 404.

### 2.7 Web

- `features/bulk-actions/` (reemplaza `archive-contacts`): `ui/BulkActionBar.tsx` (acciones según entidad y rol), `model/useBulkAction.ts` (crea + poll), `query/useBulkActionStatus.ts` (TanStack, `refetchInterval` mientras `running`).
- `entities/bulk-action/` para tipos, labels de estado y `useBulkActionHistory`.
- `views/settings/bulk-actions` historial (como GHL): tabla con actor, acción, estado, progreso, fecha.
- Toast persistente con progreso; al terminar `revalidateTag('contacts')`.

### 2.8 Retiro del módulo actual

`POST /bulk/:entity` se elimina (nadie en web lo consume). `shared-types/bulk-actions.ts` se reescribe:

```ts
export type BulkActionKind =
  | 'add_tags'
  | 'remove_tags'
  | 'assign'
  | 'update_field'
  | 'send_email'
  | 'send_sms'
  | 'send_whatsapp'
  | 'export'
  | 'archive'
export type BulkActionStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'completed_with_errors'
  | 'failed'
  | 'cancelled'
export type BulkActionSelection =
  | { mode: 'ids'; ids: string[] }
  | { mode: 'filter'; query: ContactListQuery }
export type CreateBulkActionInput = {
  entity: CustomFieldEntity
  action: BulkActionKind
  params: Record<string, unknown>
  selection: BulkActionSelection
  drip?: { batchSize: number; intervalSeconds: number }
}
export type BulkAction = {
  id
  entity
  action
  status
  total
  processed
  succeeded
  failed
  errors
  resultFileUrl
  createdById
  startedAt
  finishedAt
  createdAt
}
```

---

## 3. Orden de ejecución

| #   | Paso                                                                                                             | Bloquea a |
| --- | ---------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Migración `0030_contacts_core_prune` + `data_consents`                                                           | 2, 4      |
| 2   | Backend contacts: interfaces, constants, DTO, mapper, presets, shared-types                                      | 3         |
| 3   | Web contacts: columnas, celdas, form, i18n, tests                                                                | —         |
| 4   | Tabla `bulk_actions` + módulo nuevo + cola `BULK` + handlers `add_tags/remove_tags/assign/archive/update_field`  | 5, 6      |
| 5   | Handler `export` (S3)                                                                                            | —         |
| 6   | Handlers `send_*` (dependen de `data_consents` de #1 y del canal real — hoy `MessageQueueProcessor` solo loggea) | —         |
| 7   | Web `features/bulk-actions` + historial en settings                                                              | —         |

Pasos 1–3 y 4 son independientes entre sí; se pueden correr en paralelo.

---

## 4. Decisiones abiertas para el usuario

1. **`whatsapp` como columna propia vs. `contact_channels`.** Propuesta: columna propia ahora (canal #1, dedup), tabla de canales cuando exista inbox.
2. **`type` desaparece.** Los tenants que ya usan `types` en taxonomía se migran a un custom `select` `contact_type` con las mismas opciones. Confirmar.
3. **Drip mode** en v1 o después. Propuesta: estructura en tabla desde v1, UI en v2.
4. **Historial de bulk en Settings** (GHL) vs. en la lista de contactos (HubSpot). Propuesta: Settings → Datos → Acciones masivas.
