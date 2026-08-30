# NexoCRM — Guía de Implementación de los Fundamentos

> Versión 1.0 · 2026-08-30
> Par técnico de [`crm-foundations.md`](crm-foundations.md). Ese documento dice **qué** y **por qué**; este dice **cómo**, **dónde** y **con qué estándar**.
> Todo lo de aquí respeta ADR-0001 (schema-per-tenant), ADR-0004 (EventBus, cero imports cruzados), ADR-0005 (controllers → services → repositories) y los 11 cops del front.

---

## 0. Principio rector

> **El kernel se compila. La aplicación se declara.**

Salesforce lo llama *Universal Data Dictionary*: objetos, campos y relaciones no son tablas creadas al vuelo, son **metadata** que un motor compilado interpreta en runtime. Nosotros ya vamos por ahí sin haberlo nombrado: `industry-presets.ts`, `tenant_config.contactTaxonomy`, `custom_fields JSONB`, `ThemeCssService`.

La diferencia entre lo que tenemos y un motor real es que hoy la metadata está **dispersa y parcialmente hardcodeada**. Esta guía la centraliza.

Regla de oro que se aplica a cada pieza de abajo:

| | Va en el kernel (código, compilado, testeado) | Va en metadata (datos por tenant) |
|---|---|---|
| Ejemplo | motor de filtros, motor de automatización, validador de campos | qué campos existen, cómo se llaman, qué etapas tiene el pipeline, qué automatización corre |
| Cambia | con un deploy | con un `UPDATE` |
| Lo toca | nosotros | el cliente (o un preset) |

Si un vertical nuevo requiere tocar código, el motor está mal hecho.

---

## 1. Brechas reales (auditoría del código, 2026-08-30)

Esto no es teoría; es lo que encontré leyendo el repo.

### G1 · El timeline no es un event store — es un `UNION ALL` en lectura

`modules/timeline/repositories/timeline.repository.ts` construye el timeline uniendo `activities` + `deals` + `notifications` en tiempo de consulta.

Consecuencias:
- Cada fuente nueva (WhatsApp, factura DIAN, pago Wompi, corrida de automatización, cambio de consentimiento) exige **editar ese SQL gigante**.
- No hay evento inmutable: si el `deal` cambia de estado, el "pasado" del timeline cambia con él. Eso rompe auditoría.
- No se puede paginar ni indexar bien con N ramas del union.
- No sirve como disparador de automatizaciones.

**Esta es la brecha #1.** Los eventos son uno de los cinco elementos de la anatomía canónica del CRM (objetos → registros → propiedades → asociaciones → **eventos**) y es el único que no tenemos de verdad.

### G2 · El EventBus es in-process y no durable

`shared/events/event-bus.service.ts` es un wrapper de `EventEmitter2`. Si el proceso muere entre el `COMMIT` y el `emit`, el evento se pierde en silencio. Aceptable para notificar; **inaceptable** para cobranza, DIAN o pagos.

No existe tabla `outbox` (`grep -rln outbox apps/api/src` → vacío).

### G3 · Los campos custom están a medias

- `custom_fields JSONB` + índice `GIN (jsonb_path_ops)` ya existen (`tenant-migrations.ts` 0021) — **esto está bien hecho**, es el patrón híbrido recomendado y le gana a EAV.
- Pero `constants/custom-field-entities.ts` fija `VALID_ENTITIES = ['contacts','companies','deals']` en código. Productos ya tiene la columna y no está en la lista. Agregar una entidad = editar código.
- La definición de campo (`FieldDef`) es un tipo propio, no un estándar. No hay contrato único que el front pueda consumir para renderizar formularios.

### G4 · Cero capa de consentimiento y contactabilidad

No hay dónde guardar "este contacto autorizó WhatsApp pero no llamadas", ni "esta autorización de datos se firmó el día X por el canal Y". Ley 1581 lo exige y Ley 2300 lo exige **específicamente para cobranza**. Sin esta capa no podemos encender automatización de cobro sin exponer al cliente a sanción de la SIC.

### G5 · Cero motor de automatización

Hay BullMQ configurado (`shared/queue/queue.module.ts`, colas: notifications, messages, invoices, imports) y un procesador de mensajes. No hay motor trigger → condición → acción.

### G6 · Los presets cubren 3 de 5 preguntas

`industry-presets.ts` define nomenclatura, pipeline, campos, lifecycle y tags para 9 sectores. Faltan **plantillas de mensaje** y **dashboard por defecto**.

### G7 · Permisos solo a nivel de rol/endpoint

`@Auth(roles)` protege rutas. No hay visibilidad por registro (¿ve el vendedor los negocios de otro vendedor?) ni por campo (¿ve el pasante el margen?). Es una pregunta que aparece en la primera demo a una empresa de 20 personas.

---

## 2. Blueprint de implementación

Ocho piezas. Cada una: **qué es → dónde va → contrato → migración → tests → gate**. En orden de dependencia.

---

### P1 · Field Registry (nuestra UDD)

**Qué.** Una sola fuente de verdad de "qué campos existen en este tenant para esta entidad", estándar y legible desde back y front. Reemplaza la lista hardcodeada de entidades y unifica campos estándar + custom bajo un mismo contrato.

**Estándar adoptado: JSON Schema (draft 2020-12) + una extensión `x-nexo` para lo de UI.**
Razón: es el único formato que sirve simultáneamente como (a) contrato entre back y front, (b) validación, (c) documentación, (d) entrada de librerías de formularios ya existentes. No inventamos un DSL.

```jsonc
// contrato emitido por GET /settings/schema/:entity
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "nexo:contact",
  "type": "object",
  "properties": {
    "fullName": { "type": "string", "maxLength": 120, "x-nexo": { "label": "Nombre", "group": "identidad", "order": 1, "system": true } },
    "eps":      { "type": "string", "enum": ["sura","sanitas","nueva-eps"], "x-nexo": { "label": "EPS", "group": "salud", "order": 12, "storage": "custom_fields", "filterable": true } }
  },
  "required": ["fullName"]
}
```

`x-nexo` lleva: `label`, `group`, `order`, `widget`, `storage` (`column` | `custom_fields`), `filterable`, `system`, `deprecated`.

**Dónde.**
```
apps/api/src/modules/settings/
  services/field-registry.service.ts        ← compone estándar + custom → JSON Schema
  repositories/field-registry.repository.ts ← lee tenant_config + catálogo de campos estándar
  constants/standard-fields.ts              ← los campos "de fábrica" por entidad (reemplaza custom-field-entities.ts)
  controllers/schema.controller.ts          ← GET /settings/schema/:entity
packages/shared-types/src/field-schema.ts   ← tipos del contrato (compartido web/api)
```

**Migración.** `0030_field_registry` — tabla `field_definitions` por tenant (id, entity, key, type, config JSONB, storage, is_system, order, deprecated_at). Migrar `tenant_config.customFields` a esa tabla en el mismo paso. `custom_fields JSONB` en las entidades **se queda** — es el almacenamiento; la tabla es el diccionario.

**Gobernanza codificada** (§3.2 de foundations, ahora como reglas ejecutables):
- Límite duro: 60 campos custom por entidad → `BadRequestException`. Advertencia en UI a los 40.
- Campos `text` libres: el creador debe elegir explícitamente; el default del picker es `select`.
- `deprecated_at` en vez de borrar: los datos históricos no se destruyen.

**Tests.** `field-registry.service.spec.ts`: composición estándar+custom, límite de 60, deprecación, y que un campo `storage: custom_fields` produzca el `jsonb` path correcto. Isolation e2e: tenant A no ve el schema de B.

**Gate.** Ningún endpoint nuevo de campos sin test de aislamiento (regla #9 de forbidden-backend).

---

### P2 · Event Store append-only + Transactional Outbox

**Qué.** Dos tablas que arreglan G1 y G2 de una vez.

**Estándar adoptado: W3C Activity Streams 2.0** (`actor` / `verb` / `object` / `target`) como forma del evento.
Razón: es el vocabulario estándar para "quién hizo qué a qué cosa y cuándo", que es exactamente un timeline de CRM. Nos ahorra inventar un esquema y nos deja interoperar después.

```
events (append-only, nunca UPDATE ni DELETE)
  id, occurred_at, actor_type, actor_id, verb,
  object_type, object_id, target_type, target_id,
  payload JSONB, correlation_id, idempotency_key UNIQUE

outbox
  id, event_id, destination, status, attempts, next_attempt_at, locked_at
```

**Cómo se escribe.** El evento se inserta **en la misma transacción** que el cambio de negocio (`TenantDbService.transactional`). Nunca después. Eso es el patrón outbox: el evento existe si y solo si el cambio existe.

Un relay (worker BullMQ) lee `outbox` con `SELECT ... FOR UPDATE SKIP LOCKED`, despacha (webhooks, automatizaciones, notificaciones) y marca. Entrega **at-least-once** → todo consumidor debe ser idempotente vía `idempotency_key`.

**Dónde.**
```
apps/api/src/shared/events/
  event-store.service.ts       ← append(schemaName, event, queryRunner)
  outbox.relay.processor.ts    ← worker BullMQ, SKIP LOCKED
  event-bus.service.ts         ← se mantiene para lo no-crítico (in-process)
apps/api/src/modules/timeline/repositories/timeline.repository.ts  ← se reescribe: 1 SELECT sobre events
```

**Migración.** `0031_event_store_outbox`. Índices: `(object_type, object_id, occurred_at DESC)` para el timeline, `(status, next_attempt_at)` parcial `WHERE status='pending'` para el relay, `UNIQUE (idempotency_key)`.

**Migración de datos.** El `UNION ALL` actual se conserva **detrás de una bandera** durante un release: timeline nuevo = `events`, con backfill de activities/deals históricos. Se borra el union cuando el backfill esté verificado.

**Tests.** `event-store.spec.ts` (append transaccional: rollback del negocio ⇒ no hay evento), `outbox.relay.spec.ts` (doble despacho ⇒ un solo efecto), e2e de timeline con orden y paginación.

**Por qué esta pieza va temprano.** Todo lo demás cuelga de aquí: automatizaciones se disparan por eventos, cobranza audita por eventos, habeas data exporta eventos, WhatsApp escribe eventos.

---

### P3 · Consentimiento y Contactabilidad (Ley 1581 + Ley 2300)

**Qué.** La capa que convierte cumplimiento en feature. Dos conceptos separados, no los mezclemos:

1. **Autorización de tratamiento de datos** (Ley 1581): ¿tengo derecho a *tener* este dato?
2. **Canales y ventana de contacto** (Ley 2300): ¿tengo derecho a *escribirle ahora por este canal*?

```
data_consents         contact_id, purpose, granted_at, revoked_at, source, evidence_url, policy_version
contact_channels      contact_id, channel(whatsapp|sms|email|call), address, opted_in_at, opted_out_at, verified_at
contact_attempts      contact_id, channel, purpose, sent_at, blocked_reason, automation_run_id
```

**El motor de ventana (`ContactabilityService`) es kernel puro y testeable:**

```ts
canContact({ channel, purpose, at, contactId }): Allow | Deny<reason>
```

Reglas para `purpose = 'collections'` (Ley 2300):
- lunes–viernes 07:00–19:00, sábado 08:00–15:00 (hora `America/Bogota`)
- domingos y **festivos colombianos** prohibidos salvo autorización expresa registrada
- solo por canales con `opted_in_at` y sin `opted_out_at`
- tope de frecuencia por periodo
- toda denegación se registra en `contact_attempts` con `blocked_reason` — **el bloqueo es evidencia, no un error silencioso**

**Festivos.** Se calculan, no se hardcodean. Ley 51 de 1983 ("Emiliani"): 18 festivos, de los cuales los trasladables (6 ene, 19 mar, 29 jun, 15 ago, 12 oct, 1 nov, 11 nov, Ascensión, Corpus Christi, Sagrado Corazón) **se corren al lunes siguiente** si no caen en lunes. Los móviles se derivan de Pascua (algoritmo de Gauss/Butcher). Va en `packages/shared-utils/colombia-holidays.ts`, junto a `colombia-geo.ts`, con cobertura ≥ 95% como manda el gate (tabla de verificación año por año 2024–2030).

**Dónde.**
```
apps/api/src/modules/contactability/          ← módulo nuevo (no importa a contacts: EventBus)
  services/contactability.service.ts          ← el motor de ventana
  services/consent.service.ts
  repositories/…  dto/…  events/…
packages/shared-utils/src/colombia-holidays.ts
```

**Tests.** Tabla de casos por hora y día (domingo 09:00 → deny; sábado 15:01 → deny; festivo trasladado lunes → deny; martes 18:59 → allow). Test explícito de zona horaria (el servidor en UTC no debe cambiar el resultado).

**Valor comercial.** *"Nexo no te deja incumplir la Ley 2300."* Un CRM global te deja mandar el WhatsApp de cobro un domingo a las 9 p. m. y la multa es tuya.

---

### P4 · Motor de automatización (ECA)

**Qué.** El modelo estándar es **Event–Condition–Action**: un evento entra, se evalúan condiciones, se ejecutan acciones. Todo lo demás (secuencias, esperas, ramas) se construye encima.

**Definición como metadata, no como código:**

```jsonc
{
  "id": "wf-cobranza",
  "trigger": { "verb": "invoice.overdue" },
  "conditions": [{ "field": "daysOverdue", "op": "gte", "value": 3 }],
  "actions": [
    { "type": "send_message", "channel": "whatsapp", "templateId": "…", "purpose": "collections" },
    { "type": "create_activity", "activityType": "call", "assignTo": "owner", "dueIn": "P2D" }
  ],
  "guards": { "respectContactWindow": true, "maxPerContactPerWeek": 2 }
}
```

**Reglas de diseño no negociables:**

| Regla | Por qué |
|---|---|
| Se dispara **solo desde el event store**, nunca desde un service | única fuente de verdad, replay posible |
| Cada acción tiene **idempotency key** derivada de `(runId, stepIndex)` | el relay es at-least-once; sin esto se cobra dos veces |
| `guards.respectContactWindow` consulta `ContactabilityService` **antes de encolar**, y el job se **reprograma** al inicio de la próxima ventana | Ley 2300 por diseño, no por filtro añadido después |
| Toda corrida escribe `automation_runs` + eventos por paso | auditoría exigible y depuración |
| Sin lenguaje de fórmulas. Condiciones = operadores tipados sobre el Field Registry | evita convertirnos en constructor de software |

**Dónde.**
```
apps/api/src/modules/automations/
  services/automation-engine.service.ts     ← evalúa (≤400 líneas; si crece, se parte por acción)
  services/condition-evaluator.service.ts   ← puro, sin DI
  actions/                                  ← una clase por tipo de acción, registradas por token
  automation.processor.ts                   ← worker BullMQ (cola nueva: QUEUE_NAMES.AUTOMATIONS)
```

**BullMQ.** Cola dedicada; `delay` para las esperas y para la reprogramación por ventana legal; rate limit por tenant (nunca por IP); `attempts` + backoff exponencial ya está en el default del `QueueModule`. Monitoreo de `waiting`/`active` con heartbeat: un scheduler que falla en silencio es peor que uno que no existe.

**Tests.** Motor puro con tabla de casos; test de idempotencia (doble entrega ⇒ un mensaje); test de ventana (evento un domingo ⇒ job reprogramado al lunes 07:00, no descartado).

---

### P5 · Canal WhatsApp

**Qué.** WhatsApp como ciudadano de primera clase: cada mensaje es un evento en el event store y aparece en el timeline del contacto sin digitación.

**Lo que dicta el diseño (reglas de Meta, no nuestras):**

| Hecho | Consecuencia de diseño |
|---|---|
| Webhook verifica con `hub.mode` / `hub.verify_token` / `hub.challenge` → responder el challenge y 200 | endpoint `@Public` con verificación de firma; responder rápido y procesar en cola |
| Ventana de servicio de 24 h: si el cliente escribió primero, se responde libre y **gratis** | el motor debe preferir la ventana abierta antes que gastar plantilla |
| Fuera de la ventana solo plantillas aprobadas | catálogo de plantillas con estado de aprobación y categoría |
| Cobro por mensaje de plantilla desde jul-2025. Colombia: marketing ≈ USD 0.0125 vs utility/auth ≈ USD 0.0008 (**~15×**) | clasificador de categoría + **estimador de costo en COP antes de enviar** |
| Quality rating (verde/amarillo/rojo) por bloqueos y reportes | dashboard de salud del número; frenar campañas si baja |
| Opt-in explícito obligatorio | se resuelve con `contact_channels` de P3 — la misma tabla sirve para Meta y para la SIC |

**Dónde.**
```
apps/api/src/modules/channels/
  controllers/whatsapp-webhook.controller.ts   ← @Public + verificación de firma + idempotencia por message id
  services/whatsapp.service.ts
  services/message-cost.service.ts             ← estimación en COP
  whatsapp.processor.ts
```

**Idempotencia.** Meta reintenta. La clave es el `message.id` de Meta → `UNIQUE` en la tabla de mensajes. Regla #10 de forbidden-backend (webhooks idempotentes + firma verificada) aplica tal cual.

---

### P6 · Preset packs completos

**Qué.** Cerrar G6: los 9 sectores deben responder las cinco preguntas, no tres.

`IndustryPreset` crece con:
```ts
messageTemplates: PresetTemplate[]   // bienvenida, seguimiento, cotización, recordatorio de pago, postventa
dashboardLayout: PresetWidget[]      // qué mira el dueño cada mañana
automations: PresetAutomation[]      // 2–3 flujos encendidos por defecto, conservadores
```

**Regla:** todo template de cobranza nace con `purpose: 'collections'` → hereda automáticamente las restricciones de P3. El cumplimiento no es opcional por preset.

Trabajo de datos, sin arquitectura nueva. Alto retorno por hora invertida: es lo que hace que el onboarding entregue valor en minuto uno.

---

### P7 · Permisos por registro y por campo

**Qué.** Cerrar G7 con el modelo mínimo que aguanta una demo real:

- **Por registro**: `owner_id` + política por rol (`own` | `team` | `all`) por entidad. Nada de compartir arbitrario todavía.
- **Por campo**: lista de campos ocultos por rol, resuelta en el **mapper** (nunca en el controller) para que no salgan del proceso.

**Sobre RLS de Postgres:** es tentador, pero nuestro aislamiento de tenant ya es **schema-per-tenant** (ADR-0001) y es estructural. Meter RLS encima añade riesgo real conocido: si `app.current_user` no se resetea, el pool sirve datos del usuario anterior. Decisión: **visibilidad intra-tenant en capa de aplicación**, con test de regresión por rol. Documentar como ADR para que nadie lo re-abra en seis meses.

---

### P8 · UI derivada del schema (front)

**Qué.** El front deja de conocer los campos. Consume `GET /settings/schema/:entity` y renderiza.

**Cómo, respetando los 11 cops:**

```
apps/web/src/entities/field-schema/
  model/   ← useEntitySchema (TanStack Query, cache por tenant+entity)
  lib/     ← schemaToZod.ts (JSON Schema → Zod, puro, sin hooks)
  ui/      ← SchemaForm.tsx, SchemaField.tsx (mapea x-nexo.widget → shared/ui)
```

- `schemaToZod` es **función pura** → vive en `lib/`, y su test espejo va en `apps/web/tests/entities/field-schema/lib/schemaToZod.test.ts` (nunca en `src/`).
- Los widgets salen de `shared/ui` — nada de `<input>` crudo (cop #5).
- Archivos < 200 líneas: `SchemaForm` orquesta, `SchemaField` hace el switch, cada widget aparte.
- Cero comentarios (cop #6).
- La nomenclatura del tenant ya la resuelve `entities/nomenclature`; el schema aporta `label` por campo, no el nombre de la entidad.

**Ya existe media pieza:** `features/create-contact/ui/CustomFieldInput.tsx` y `CustomFieldsSection.tsx` hacen esto solo para custom fields de contactos. P8 es generalizarlo y moverlo a `entities/` para que lo usen contactos, empresas, negocios y productos.

---

## 3. Estándares que adoptamos (y por qué)

Tabla de referencia. Si alguien pregunta "¿bajo qué estándar hicieron esto?", esta es la respuesta.

| Área | Estándar | Aplicación en Nexo |
|---|---|---|
| Definición de campos | **JSON Schema draft 2020-12** + `x-nexo` | contrato back↔front, validación, formularios (P1, P8) |
| Eventos y timeline | **W3C Activity Streams 2.0** (actor/verb/object/target) | forma del event store (P2) |
| Entrega de eventos | **Transactional Outbox** + at-least-once + idempotency keys | outbox relay con `FOR UPDATE SKIP LOCKED` (P2) |
| Campos flexibles en Postgres | **JSONB híbrido** (columnas tipadas para el núcleo, JSONB para el resto) + `GIN jsonb_path_ops` | ya implementado (mig. 0021); se documenta como decisión, no como accidente |
| Automatización | **ECA (Event–Condition–Action)** | motor de automatizaciones (P4) |
| Aislamiento | **schema-per-tenant** (ADR-0001), sin RLS | reafirmado en P7 |
| Dinero | COP en centavos, `BIGINT` (ADR-0002) | ya vigente |
| Fechas | `TIMESTAMPTZ` UTC en DB · `America/Bogota` en UI · `DD/MM/YYYY` | crítico en P3: la ventana legal se evalúa en hora local |
| Teléfonos | **E.164** | prerequisito de WhatsApp (P5) |
| Facturación | **UBL 2.1** / DIAN Res. 000227 de 2025 | fase de dinero |
| Datos personales | **Ley 1581 de 2012** + **Ley 2300 de 2023** | P3, y export/borrado del titular |
| Festivos | **Ley 51 de 1983** (Emiliani), cálculo derivado de Pascua | `packages/shared-utils` (P3) |

---

## 4. Orden de ejecución

Dependencias reales, no preferencias.

```
P1 Field Registry ─┬─> P8 UI derivada del schema
                   │
P2 Event Store ────┼─> P4 Motor ECA ──> P6 Preset packs (automatizaciones)
      ▲            │        ▲
      │            │        │
      └── P5 WhatsApp ──────┘
                   │
P3 Consentimiento ─┘  (bloquea P4 y P5: sin esto no se enciende ningún envío)

P7 Permisos: independiente, antes de la primera demo empresarial
```

| Sprint | Entrega | Criterio de salida (uno, medible) |
|---|---|---|
| 1 | P2 event store + outbox; timeline reescrito | El timeline sale de una sola tabla y el union viejo está borrado |
| 2 | P1 field registry + P8 SchemaForm | Agregar un campo en Settings lo hace aparecer en el formulario sin tocar código |
| 3 | P3 consentimiento + festivos + habeas data (export/borrado) | Un contacto se exporta y se suprime en un clic, con evidencia de autorización |
| 4 | P5 WhatsApp entrante/saliente | Un lead escribe por WhatsApp y aparece como contacto con la conversación en su timeline |
| 5 | P4 motor ECA con `respectContactWindow` | Un evento de mora un domingo produce un job reprogramado al lunes 07:00, con registro |
| 6 | P6 preset packs 9 sectores | Onboarding de cualquier sector deja el CRM usable en < 10 min |
| 7 | P7 permisos | Un vendedor no ve los negocios de otro; el margen no viaja al cliente HTTP |

---

## 5. Definition of Done (aplica a cada pieza)

Checklist que ya impone el repo — aquí explícito para que nadie lo descubra en el pre-commit:

**Backend**
- [ ] `controllers/` sin SQL ni lógica; `services/` sin SQL y ≤ 400 líneas; **todo** el SQL en `repositories/`
- [ ] SQL con `$n` bind params, jamás `${expr}`; a través de `sqlRows<T>(qr, sql, params)`
- [ ] Cero imports entre módulos — comunicación por EventBus / event store
- [ ] Toda ruta con `@Auth` / `@ApiEndpoint` / `@Public`
- [ ] Excepciones NestJS, nunca `throw new Error()`; `Logger`, nunca `console.log`
- [ ] DTO con class-validator; el repositorio no importa DTOs
- [ ] **Test e2e de aislamiento cross-tenant** (tenant A → recurso de B = 404) — bloqueante para merge
- [ ] Migración añadida a `shared/database/tenant-migrations.ts` (siguiente id libre: `0030`)
- [ ] Sin logs de tokens, NITs, emails ni teléfonos

**Frontend**
- [ ] FSD respetado: `app → views → widgets → features → entities → shared`, imports solo hacia abajo, consumo por `index.ts`
- [ ] Archivos < 200 líneas; `page.tsx` ≤ 5 líneas; props ≤ 5
- [ ] Cero comentarios; cero colores hardcodeados; cero `<input>`/`<button>` crudos fuera de `shared/ui`
- [ ] Server Component por defecto; mutaciones con Server Actions + `revalidateTag`
- [ ] Tests espejo en `apps/web/tests/…` para todo `lib/` y `model/`
- [ ] `es.ts` / `en.ts` con los mismos keys; cero strings inline
- [ ] Fechas `DD/MM/YYYY`, dinero con `formatCOP`, `??` en vez de `||`

**Ambos**
- [ ] Cobertura: global ≥ 70%, `packages/shared-utils` ≥ 95% (aplica a `colombia-holidays.ts`)
- [ ] `pnpm lint && pnpm check:arch && pnpm --filter web check:arch` en verde

---

## 6. ADRs a escribir

Cada pieza estructural necesita su acta. Sin esto, en tres meses alguien lo revierte "porque no sabía".

| ADR | Decisión |
|---|---|
| 0007 | Event store append-only + transactional outbox como única fuente de eventos de dominio |
| 0008 | JSON Schema + `x-nexo` como contrato de metadata de campos (Field Registry) |
| 0009 | JSONB híbrido + GIN `jsonb_path_ops` para campos custom (por qué no EAV, por qué no columnas dinámicas) |
| 0010 | Contactabilidad Ley 2300 como restricción de primera clase del motor de automatización |
| 0011 | Visibilidad intra-tenant en capa de aplicación, **no** con Postgres RLS |

---

## 7. Fuentes

**Arquitectura metadata-driven**
- Salesforce — *The Force.com Multitenant Architecture* (whitepaper): https://www.developerforce.com/media/ForcedotcomBookLibrary/Force.com_Multitenancy_WP_101508.pdf
- Salesforce — diseño de la plataforma multitenant (ACM): https://dl.acm.org/doi/pdf/10.1145/1559845.1559942
- Salesforce database architecture deep dive: https://cirra.ai/articles/salesforce-database-architecture-explained
- Twenty CRM — modelo de datos: https://docs.twenty.com/user-guide/data-model/overview

**PostgreSQL: campos flexibles**
- Crunchy Data — Indexing JSONB in Postgres: https://www.crunchydata.com/blog/indexing-jsonb-in-postgres
- TigerData — cómo indexar JSONB: https://www.tigerdata.com/learn/how-to-index-json-columns-in-postgresql
- pgsql-general — EAV designs for multi-tenant applications (hilo): https://postgrespro.com/list/thread-id/2343655
- Permit.io — permisos finos en Postgres multi-tenant: https://www.permit.io/blog/implementing-fine-grained-postgres-permissions-for-multi-tenant-applications
- Crunchy Data — RLS para tenants: https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres

**Eventos, outbox e idempotencia**
- W3C — Activity Streams 2.0 Core: https://www.w3.org/TR/activitystreams-core/
- W3C — Activity Vocabulary: https://w3c.github.io/activitystreams/vocabulary/
- GetStream — diseño de activity streams según la spec W3C: https://getstream.io/blog/designing-activity-stream-newsfeed-w3c-spec/
- Transactional outbox en Postgres: https://www.matthewswong.com/en/blog/transactional-outbox-pattern-postgres/
- Outbox pattern en NestJS (implementación práctica): https://www.aboutjs.dev/en/posts/the-outbox-pattern-in-nestjs-a-practical-implementation
- `nestjs-inbox-outbox` (referencia de diseño): https://github.com/Nestixis/nestjs-inbox-outbox
- Idempotencia y deduplicación en automatización: https://logiclot.io/docs/automation-idempotency-deduplication

**Motor de automatización**
- Triggerflow — orquestación basada en triggers (ECA), paper: https://arxiv.org/pdf/2106.00583
- Red Hat — qué es la automatización event-driven: https://www.redhat.com/en/topics/automation/what-is-event-driven-automation
- Cloudflare — Rules of Workflows (reglas de diseño de pasos): https://developers.cloudflare.com/workflows/build/rules-of-workflows/
- BullMQ — Job Schedulers: https://docs.bullmq.io/guide/job-schedulers/
- BullMQ — Rate limiting: https://docs.bullmq.io/guide/rate-limiting
- BullMQ en producción (topología y monitoreo): https://markaicode.com/architecture/bullmq-production-system-design-architecture/

**UI derivada de schema**
- JSON Schema draft 2020-12: https://json-schema.org/draft/2020-12/schema
- JSON Forms (React): https://jsonforms.io/docs/integrations/react
- react-jsonschema-form: https://github.com/rjsf-team/react-jsonschema-form
- ui-schema: https://github.com/ui-schema/ui-schema

**WhatsApp**
- Meta — configurar webhooks de Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/
- Meta — pricing de la plataforma: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- Tarifas Colombia: https://www.plivo.com/whatsapp/pricing/co/
- Opt-in / opt-out (guía de implementación): https://www.braze.com/docs/user_guide/message_building_by_channel/whatsapp/message_processing/opt-ins_and_opt-outs
- Quality rating y límites de mensajería: https://docs.yellow.ai/docs/platform_concepts/channelConfiguration/WA-messaging-limits

**Cumplimiento colombiano**
- Ley 2300 de 2023 (texto oficial): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=213990
- Ley 1581 de 2012 (texto oficial): http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html
- SIC — preguntas frecuentes de protección de datos: https://sic.gov.co/preguntas-frecuentes-pdp
- Ley 51 de 1983 (Emiliani, texto oficial): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4954
- Festivos en Colombia (lista y reglas de traslado): https://es.wikipedia.org/wiki/Anexo:D%C3%ADas_festivos_en_Colombia
- DIAN — Resolución 000227 de 2025 (reglas 2026): https://www.sai-open.com/nueva/facturacion-electronica-colombia-2026-resolucion-000227/

**Derechos del titular (patrones de implementación)**
- Crypto-shredding para borrado verificable: https://granit-fx.dev/blog/crypto-shredding-gdpr-erasure-without-deleting-rows/
- Right to erasure en SaaS: https://payproglobal.com/answers/what-is-saas-right-to-be-forgotten/
- *Forgotten @ Scale* — borrado en sistemas grandes (paper): https://arxiv.org/pdf/1910.13784
