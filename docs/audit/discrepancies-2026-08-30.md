# NexoCRM — Discrepancias y puntos a mejorar

> Auditoría de código del 2026-08-30. Complementa [`phase-1-report.md`](phase-1-report.md) (que cubrió aislamiento y seguridad) y las brechas estructurales ya listadas en [`../crm-implementation-guide.md`](../crm-implementation-guide.md) §1.
> Aquí van hallazgos **nuevos**: discrepancias entre lo que decimos y lo que el código hace, y deuda de modelado que va a doler cuando escale.

Cada hallazgo: **evidencia con archivo:línea → impacto real → arreglo**.

---

## P0 — Rompen una regla propia o dejan un hueco operativo

### A1 · El rate limit es por IP, no por tenant

**Evidencia.** `apps/api/src/app.module.ts:75` registra `ThrottlerGuard` sin sobrescribir `getTracker()`. El default de `@nestjs/throttler` rastrea por **IP**. `apps/api/src/config/throttler.config.ts` define un solo throttler global (100 req/min en prod).

**Discrepancia.** `CLAUDE.md` (prohibido #10) dice literal: *"rate limit by IP (use per-tenant in Redis)"*. Usamos storage en Redis, pero el **tracker** sigue siendo la IP. Se implementó la mitad de la regla.

**Impacto real.**
- Una pyme con 15 personas detrás de un NAT comparte 100 req/min → bloqueos falsos en horario pico. Es exactamente el cliente objetivo.
- Un tenant abusivo desde varias IPs esquiva el límite.
- Detrás de load balancer sin `trust proxy` configurado, **todas** las peticiones comparten la IP del LB → un solo cliente puede tumbar el límite global.

**Arreglo.** `TenantThrottlerGuard extends ThrottlerGuard` con `getTracker(req)` → `tenantId ?? userId ?? ip`. Throttlers separados por familia de ruta (auth más estricto que lectura). Test: dos tenants desde la misma IP no se afectan.

---

### A2 · Redis corre sin contraseña en toda la aplicación

**Evidencia.**
```
apps/api/src/config/redis.config.ts     → solo { host, port }. No hay campo password.
apps/api/src/shared/queue/queue.module.ts:14 → config.get<string>('redis.password')  ← siempre undefined
apps/api/src/config/throttler.config.ts:9    → ni siquiera la pide
apps/api/src/config/env.validation.ts        → REDIS_HOST y REDIS_PORT validados; REDIS_PASSWORD no existe
```

**Impacto real.** Redis guarda colas BullMQ, contadores de rate limit y estado de sesión. Sin auth, cualquiera con acceso de red al puerto lee y escribe jobs — incluidos los de facturación y cobranza cuando existan. El código *aparenta* soportar contraseña (`queue.module.ts` la pide) pero el `registerAs` nunca la expone: falla silenciosa, el peor tipo.

**Arreglo.** Añadir `password` a `redisConfig`, `REDIS_PASSWORD` opcional en `env.validation.ts` pero **obligatorio si `NODE_ENV=production`**, y pasarlo también en `throttler.config.ts`. Test de arranque que falle si en producción falta.

---

### A3 · Cero restricciones `CHECK` en todo el esquema de tenant

**Evidencia.** `grep -c "CHECK" apps/api/src/shared/database/tenant-migrations.ts` → **0**, en 29 migraciones.

Ejemplos de lo que no está protegido (`0007_deal_items`):
```sql
quantity         INTEGER NOT NULL DEFAULT 1,   -- puede ser 0 o negativo
unit_price_cents BIGINT  NOT NULL DEFAULT 0,   -- puede ser negativo
discount_percent INTEGER DEFAULT 0,            -- puede ser 500
iva_rate         INTEGER DEFAULT 19,           -- puede ser 7 (no existe en Colombia)
```

**Impacto real.** Toda la integridad depende de la capa de aplicación. Un import masivo, un script de migración, un bug en un DTO o una consulta manual escriben basura sin resistencia. En el módulo de dinero esto deja de ser incómodo y pasa a ser una factura DIAN mal emitida — y las facturas DIAN no se borran, se anulan con nota crédito.

**Arreglo.** Migración `0030_data_integrity_checks`: `quantity > 0`, `unit_price_cents >= 0`, `discount_percent BETWEEN 0 AND 100`, `iva_rate IN (0,5,19)`, `value_cents >= 0`, colores `~ '^#[0-9A-Fa-f]{6}$'`, y `UNIQUE (name, entity_type)` en `tags`. Añadir la regla al DoD: **toda columna con dominio conocido lleva CHECK**.

---

## P1 — Deuda de modelado que va a doler al escalar

### B1 · Los tags están modelados dos veces, sin relación entre las dos

**Evidencia.**
```
tenant-migrations.ts:202  CREATE TABLE tags (id, name, color, entity_type)   ← catálogo
tenant-migrations.ts:62   ALTER TABLE companies ADD COLUMN tags TEXT[]        ← uso
tenant-migrations.ts:163  ALTER TABLE products  ADD COLUMN tags TEXT[]        ← uso
apps/api/scripts/clean-contact-tags.ts                                        ← el síntoma
```

No hay FK entre el arreglo de texto y el catálogo. Tampoco `UNIQUE (name, entity_type)` en `tags`.

**Impacto real.** Renombrar un tag deja huérfanas todas las filas. Borrarlo no limpia nada. Se pueden crear dos tags con el mismo nombre. La existencia de un script `clean-contact-tags.ts` es la prueba: estamos pagando con un limpiador lo que es un error de modelo.

**Arreglo.** Decidir **una** de las dos y ejecutarla completa:
- (a) Junction `entity_tags (entity_type, entity_id, tag_id)` con FK y `ON DELETE CASCADE` — correcto, permite renombrar sin dolor, y borra el script janitor.
- (b) Quedarse con `TEXT[]` y **borrar la tabla catálogo**, moviendo colores a `tenant_config`.

Recomendación: (a). El GIN sobre `TEXT[]` es rápido pero la falta de integridad ya nos costó un script.

---

### B2 · Tres tablas para el mismo concepto, y las tres solo sirven para contactos

**Evidencia.**
```
0012  saved_filters            (user_id, entity_type, name, filters JSONB, is_default, position)
0022  contact_views            (owner_id, name, filters, advanced_filters, columns, sort, density, visibility, is_favorite, position)
0023  contact_workspace_states (user_id UNIQUE, active_view_id, table_state JSONB)
```

`saved_filters` **ya es genérica** (tiene `entity_type`). `contact_views` es más rica pero está clavada a contactos. Hay un módulo `saved-filters` y otro pedazo dentro de `contacts`.

**Impacto real.** Cuando Empresas, Negocios y Productos reciban UI (Fase 2, ya en curso), quien lo construya va a clonar `contact_views` → `deal_views` → `company_views`. Cuatro tablas, cuatro repositorios, cuatro juegos de tests, un bug arreglado cuatro veces. **Es la trampa de generalización más cara que tenemos abierta ahora mismo**, y se abre en el sprint en curso.

**Arreglo, antes de construir la UI de Deals:** una sola tabla `entity_views (entity_type, owner_id, …)` que absorba `contact_views` + `saved_filters`, y `workspace_states (user_id, entity_type, …)` con clave compuesta en vez de `user_id UNIQUE`. Migración de datos: `contact_views` → `entity_views` con `entity_type='contacts'`.

---

### B3 · No existen asociaciones — un negocio tiene exactamente un contacto

**Evidencia.** No hay ninguna tabla de unión en las 29 migraciones. Las relaciones son columnas FK: `deals.contact_id`, `deals.company_id`, `activities.contact_id`.

**Impacto real.** La anatomía canónica del CRM es objetos → registros → propiedades → **asociaciones** → eventos, y las asociaciones son muchos-a-muchos **con etiqueta de rol** (decisor, comprador, técnico, firmante). En una venta B2B colombiana de $50M hay siempre más de una persona. Hoy el modelo obliga a elegir una y perder el resto — y el vendedor lo compensa escribiéndolo en un campo de notas, que es justo el dato que después no se puede filtrar ni automatizar.

**Arreglo.** `associations (from_type, from_id, to_type, to_id, label, is_primary)` con índices en ambos sentidos. Empezar por `deal ↔ contact` con roles; el resto migra después. Se apoya en el Field Registry (P1) para que los roles sean metadata por tenant, no un enum.

---

### B4 · Siete de veinte módulos no tienen ni un test

**Evidencia.** Conteo de `*.spec.ts` por módulo:

| Sin tests | Con tests |
|---|---|
| `api-keys` (0), `audit-log` (0), `bulk-actions` (0), `message-templates` (0), `saved-filters` (0), `timeline` (0), `users` (0) | settings (12), auth (11), contacts (10), geo (3), activities/companies/deals/products/tags (2), dashboard/notifications/tenants/webhooks (1) |

**Impacto real.** No es deuda uniforme — los siete sin tests incluyen los tres de mayor riesgo:
- `api-keys`: credenciales de acceso programático a datos de tenant.
- `bulk-actions`: mutaciones masivas. Un fallo aquí no daña una fila, daña una tabla.
- `users`: invitaciones y roles — el reporte de Fase 1 ya encontró aquí una escalada de privilegios.

`timeline` sin tests además es el módulo que vamos a reescribir (P2 de la guía): sin tests no hay red de seguridad para el cambio.

**Arreglo.** Antes de reescribir el timeline, cubrirlo. Los otros seis entran en el paydown de Fase 1 con prioridad `bulk-actions` → `users` → `api-keys`.

---

### B5 · Faltan e2e de aislamiento en los módulos de lectura y configuración

**Evidencia.** `apps/api/test/` cubre: contacts (dentro de `tenant-isolation`), companies, deals, products, activities, tags, saved-filters, message-templates, webhooks, api-keys, contact-taxonomy, contact-views, contact-workspace.

**Sin cubrir:** `notifications`, `dashboard`, `audit-log`, `timeline`, `bulk-actions`, `users`.

**Impacto real.** El ROADMAP ya lo reconoce como pendiente, pero subestima el riesgo: `dashboard` y `timeline` son módulos de **agregación** — leen de muchas tablas a la vez, que es exactamente donde una fuga cruzada se esconde mejor. Y `bulk-actions` escribe masivamente. El patrón `crear → 404` no aplica; hace falta el patrón "tenant A ve N filas, tenant B ve M, y ninguna se cruza".

**Arreglo.** Helper `assertNoCrossTenantRows(schemaA, schemaB, endpoint)` en `test/helpers/`, y un spec por módulo. Regla al DoD: **el gate de aislamiento aplica también a endpoints de solo lectura**.

---

### B6 · Cuatro controllers reciben cuerpos sin DTO — es decir, sin validación

**Evidencia.**
```
modules/api-keys/controllers/api-keys.controller.ts:39
  @Body() dto: { name: string; scopes?: string[]; expiresAt?: string }
modules/dashboard/controllers/dashboard.controller.ts:151, :169
modules/message-templates/controllers/message-templates.controller.ts:124
  @Body() dto: { recipients: string[]; variables: Record<string, string> }
```

**Impacto real.** Un tipo TypeScript en `@Body()` es **solo compilación**: `ValidationPipe` no tiene metadata que validar, así que en runtime entra cualquier cosa. Los dos peores:
- `api-keys`: `scopes?: string[]` sin validar → se puede pedir un scope inventado o inyectar valores arbitrarios en la creación de credenciales.
- `message-templates`: `recipients: string[]` sin validar → destinatarios sin formato, sin límite de cantidad. Cuando esto se conecte a WhatsApp, es un envío masivo no acotado con costo por mensaje **y** riesgo de quality rating en rojo.

**Arreglo.** DTOs con class-validator: `@IsArray() @ArrayMaxSize(n) @IsIn(VALID_SCOPES, {each:true})`, `@IsPhoneNumber('CO', {each:true})`. Añadir un cop al script de arquitectura: `@Body()` con tipo objeto inline = violación.

---

### B7 · Aritmética de dinero en punto flotante y truncamiento en SQL

**Evidencia 1** — `modules/deals/mappers/deal.mapper.ts:85-87`:
```ts
const unitPrice = Number(r.unit_price_cents)
const subtotal = (r.quantity * unitPrice * (100 - r.discount_percent)) / 100
```
`unit_price_cents` es `BIGINT` (llega como string). Se convierte a `Number` y se multiplica y divide en float. Hay `Math.round` al final, lo que salva el caso común, pero la operación viola ADR-0002 (dinero siempre entero).

**Evidencia 2** — `modules/deals/repositories/deals.repository.ts:303`:
```sql
SUM(d.value_cents * COALESCE(ps.probability, 0) / 100)::text AS weighted_value_cents
```
`BIGINT * INTEGER / 100` en Postgres es **división entera**, y se aplica por fila antes del `SUM` → trunca hasta 1 centavo por negocio. Con 5.000 negocios, el pronóstico queda hasta $50 corto. Es poco dinero pero es un número que el dueño compara contra su Excel, y no cuadra.

**Evidencia 3** — todos los mappers hacen `Number(r.*_cents)` sobre columnas `BIGINT` sin `Number.isInteger`. Las sumas agregadas (`total_billed_cents`, `total_receivable_cents`) son las que pueden acercarse al límite de precisión.

**Arreglo.** Calcular el subtotal en SQL con enteros (`(quantity * unit_price_cents * (100 - discount_percent)) / 100` con casts explícitos y redondeo declarado), mover el `/100` fuera del `SUM`, y añadir un helper `toCents(value: string): number` que afirme `Number.isInteger` y lance si no. Test de dinero con `Number.isInteger` en cada aserción, como ya manda la regla #7.

---

### B8 · El canal por defecto de las plantillas es email

**Evidencia.** `tenant-migrations.ts:224` → `channel VARCHAR(20) NOT NULL DEFAULT 'email'`.

**Discrepancia.** El PRD dice que WhatsApp es *"el canal #1 en Colombia"* y un principio de producto declarado es *"WhatsApp como primer ciudadano"*. El default de la base de datos dice lo contrario. Además no hay ningún canal de email implementado — solo `RESEND_API_KEY` para transaccionales de auth.

**Impacto real.** Cada plantilla que un cliente cree sin elegir canal nace como email, un canal que no existe. Es un default que produce datos muertos.

**Arreglo.** Cambiar el default a `'whatsapp'` en una migración, y añadir `CHECK (channel IN ('whatsapp','email','sms'))` — que además cierra parte de A3.

---

### B9 · No hay detección ni fusión de duplicados

**Evidencia.** Cero código de dedup/merge en los 20 módulos (los aciertos del grep son `merge` de objetos de configuración).

**Impacto real.** El import masivo ya existe (`shared/imports`), y la vía normal de entrada de un cliente nuevo es subir su Excel. Sin dedup, el primer día en Nexo produce la base sucia que la literatura identifica como causa principal de abandono de CRM. Duele exactamente en el momento de mayor riesgo de churn: el onboarding.

**Arreglo.** Dedup en dos capas: (1) preventiva en el import — clave natural por documento/NIT, teléfono E.164 y email normalizados, con vista previa antes de escribir; (2) correctiva — `POST /contacts/:id/merge` que reasigna asociaciones y **conserva el evento de fusión** en el event store (P2), para que la fusión sea reversible en auditoría.

---

## P2 — Documentación y proceso

### C1 · Ocho documentos siguen describiendo un stack que no existe

**Evidencia.** Mencionan Prisma o tRPC: `architecture.md`, `backend-standards.md`, `frontend-standards.md`, `implementation-guide.md`, `project-context.md`, `security.md`, `PRD.md`, `rfc/0001-configurable-crm.md`.

**Impacto real.** El skill `nexo-context` ya marca tres de ellos como no confiables, pero **`PRD.md` y `security.md` no estaban en esa lista**. Que el documento de seguridad describa una capa de datos que no usamos significa que sus controles no se pueden auditar contra el código: cualquiera que lo lea para verificar cumplimiento está validando un sistema imaginario.

**Arreglo.** Prioridad: `security.md` primero (riesgo de cumplimiento), `PRD.md` después (es la fuente de verdad de producto). Al resto, banner de obsolescencia al inicio o borrado. Regla: un documento sin dueño ni fecha de revisión se archiva, no se deja "por si acaso".

---

### C2 · Dos sistemas de seguimiento vivos, uno vencido hace cuatro meses

**Evidencia.** `docs/ROADMAP.md` dice que *"replaces the loose tracking in sprint-status.yaml"*. `docs/sprint-status.yaml` sigue ahí, con `mvp_target: 2026-05-09` y `beta_target: 2026-05-30` — ambas fechas ya pasaron (hoy: 2026-08-30).

Además el propio ROADMAP tiene `Status (2026-07-25)` y afirma *"15 modules"* cuando `apps/api/src/modules/` tiene **20**.

**Impacto real.** Un agente o una persona nueva no sabe cuál leer. El que abra `sprint-status.yaml` planea contra un MVP que venció.

**Arreglo.** Borrar `sprint-status.yaml` (git lo conserva) y actualizar la tabla de estado del ROADMAP. Regla: una sola fuente de verdad de ejecución, con fecha visible.

---

### C3 · `CLAUDE.md` dice zod para env; el código usa class-validator

**Evidencia.** `CLAUDE.md`: *"Validate env with zod at startup"*. `apps/api/src/config/env.validation.ts` usa `plainToInstance` + `validateSync` de class-validator.

**Impacto real.** Bajo — el env **sí** se valida y falla el arranque si algo falta. Es deriva de documentación, no un hueco. Pero es el tipo de detalle que hace que alguien "corrija" el código para cumplir el doc y rompa lo que funciona.

**Arreglo.** Corregir el doc, no el código. class-validator es coherente con el resto del backend; zod es la convención del front.

---

### C4 · La regla de aislamiento de vendor UI se quedó corta

**Evidencia.** ADR-0006 aísla el código vendorizado de shadcn en `shared/ui/shadcn/`. Hoy conviven además:
```
shared/ui/smoothui/   (gooey-popover 345 líneas, animated-stepper 284)
shared/ui/ruixen/     (toolbar-dock 324, badge-morph 191)
```

**Impacto real.** Son los archivos más grandes del front después de los locales de i18n y `sidebar.tsx`, y superan el límite de 200 líneas — presumiblemente grandfathered por baseline. Ninguna regla escrita dice qué se puede vendorizar, quién lo aprueba, ni cómo se actualiza. Dos librerías se volvieron tres sin decisión registrada.

**Arreglo.** Extender ADR-0006: `shared/ui/<vendor>/` es la única ruta permitida para código de terceros, exenta del límite de líneas pero **prohibida de modificar** (si hay que tocarlo, se envuelve en un componente propio). Registrar los vendors actuales y su versión.

---

### C5 · Señales menores, para no perderlas

| Señal | Evidencia | Nota |
|---|---|---|
| `contacts.service.ts` en 381 líneas | límite de ADR-0005 es 400 | El próximo cambio lo rompe. Partir por caso de uso ahora. |
| Baseline de tipografía con 77 entradas | `apps/web/scripts/baselines/check-typography.json` | Es la deuda congelada más grande del front. Va bajando (el diff actual quita 2), pero sin plan de vaciado. |
| 8 archivos en baseline de test-mirror | `check-test-mirror.json` | Todos en `setup-workspace` y `nomenclature` — justo la lógica del onboarding, que es nuestra métrica #1. |
| `console.log` en `plans.seed.ts:77` | prohibido #6 | Es un seed, no runtime. Aceptable, pero merece excepción explícita en vez de convivir con la regla rota. |
| `as any` en `token.service.ts:27` | prohibido #6 | Tipo de `expiresIn` de jsonwebtoken. Único `any` del backend — merece el comentario justificante que la regla exige. |
| i18n `es.ts` / `en.ts` con 887 claves cada uno | sincronizados ✅ | El cop funciona. Sin hallazgo. |

---

## Orden sugerido

Por relación impacto/esfuerzo, no por severidad nominal.

| # | Acción | Por qué primero |
|---|---|---|
| 1 | **B2** unificar `contact_views` + `saved_filters` → `entity_views` | Se abre la trampa **en el sprint en curso**. Cada semana que pasa cuesta una tabla más. |
| 2 | **A2** contraseña de Redis | Hueco operativo real, arreglo de una hora. |
| 3 | **A1** throttler por tenant | Rompe una regla propia y produce bloqueos falsos al cliente objetivo. |
| 4 | **B6** DTOs en los 4 controllers + cop que lo impida | Superficie de entrada sin validación, incluyendo credenciales. |
| 5 | **A3** migración de `CHECK` constraints | Barata, y es prerrequisito de confianza para el módulo de dinero. |
| 6 | **B1** decidir el modelo de tags y borrar el script janitor | Deuda visible que ya generó código de mantenimiento. |
| 7 | **B4** tests de `timeline` | Prerrequisito para reescribirlo (P2 de la guía de implementación). |
| 8 | **C1/C2** arreglar `security.md`, `PRD.md`; borrar `sprint-status.yaml` | Higiene: la documentación falsa desorienta a agentes y a personas. |
| 9 | **B7** dinero entero de punto a punto | Antes de la Fase de dinero, no durante. |
| 10 | **B3** asociaciones, **B9** dedup | Estructurales; entran con el Field Registry y el event store. |
