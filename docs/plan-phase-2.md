# NexoCRM — Plan Fase 2 después de Contactos

> 2026-09-16 · Parte de `docs/ROADMAP.md` y `docs/crm-foundations.md` §7.
> Contactos queda cerrado como el **objeto de referencia**. Este plan dice qué sigue y en qué orden.

---

## 0. Principio que ordena todo

**Un núcleo, N configuraciones.** Una clínica, una inmobiliaria y una agencia B2B usan el mismo Nexo; cambian datos, no código (`crm-foundations.md` §4–5).

Con Contactos aprendimos el costo: tabla, vistas, filtros, columnas, campos custom, import, acciones masivas y la ficha suman ~4.500 líneas **acopladas a `contact`** (`manage-contact-views`, `filter-contacts`, `customize-contacts-table`, `bulk-actions`, `import-contacts`, tablas `contact_views` / `contact_workspace_states`).

Si Empresas y Negocios copian ese patrón, triplicamos código y cada mejora se hace tres veces. **Por eso lo primero no es un objeto nuevo: es convertir Contactos en motor.**

Test para toda feature (RFC 0001 §9): _¿funciona igual para una clínica y para una constructora sin un `if (industry)`?_ Si no, está mal diseñada.

---

## 1. Qué ya está cerrado (no re-planear)

- Contactos: CRUD, FTS, vistas guardadas/compartidas, columnas, filtros en URL, import con dedup, merge, archivo/restauración, consentimientos, tags, timeline, acciones masivas con undo, ficha con paneles, composers, softphone, a11y AA.
- Settings backend: presets por industria, nomenclatura, taxonomías, campos custom (contacts/companies/deals), pipelines, theming, navegación.
- Shared UI: `data-table`, `record-layout`, `record-drawer`, `filter-bar`, `kanban-column`, `composer`.

---

## 2. Secuencia

> ⚠️ **Actualizado 2026-09-16:** la secuencia 2.1–2.4 se reemplaza por los planes detallados en [`plans/`](plans/README.md), tras el [benchmark de adaptabilidad](research/crm-adaptability-benchmark-2026-09.md). Esta tabla queda como historial.

| #        | Épica                                                                                                                                      | Por qué en este orden                                              | Tamaño |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------ |
| **2.0a** | Contactos como referencia: sprints S1–S5 de [`audit/contacts-reference-audit-2026-09-16.md`](audit/contacts-reference-audit-2026-09-16.md) | No se extrae un motor con bugs ni con dos formas de hacer lo mismo | L      |
| **2.0**  | Motor de objetos (extracción)                                                                                                              | Todo lo demás lo reutiliza                                         | L      |
| **2.1**  | Empresas                                                                                                                                   | Primer consumidor del motor; valida la extracción con poco riesgo  | M      |
| **2.2**  | Negocios — pipeline kanban                                                                                                                 | Capacidad #2 del CRM; donde el mercado compra                      | L      |
| **2.3**  | Actividades + agenda                                                                                                                       | Cierra "un vendedor gestiona su semana sin salir de Nexo"          | M/L    |
| **2.4**  | Configuración visible (settings UI)                                                                                                        | La adaptabilidad solo vende si el cliente la toca                  | M      |
| **2.5**  | Habeas Data (Ley 1581)                                                                                                                     | Requisito legal desde el primer contacto guardado                  | M      |
| **2.6**  | Cierre de Fase 1 en paralelo                                                                                                               | Gate CI de aislamiento, money fixes, cobertura                     | M      |

Criterio de salida de Fase 2 (uno solo): **un vendedor gestiona su semana completa sin salir de Nexo**, en cualquier preset de industria.

---

## 2.0 Motor de objetos — extraer lo que Contactos ya probó

**Meta:** que un objeto nuevo sea declarar un _descriptor_, no escribir 4.500 líneas.

Backend

- `object_views` y `object_workspace_states` genéricos con columna `object_type` (`contact | company | deal`). Migración que mueve `contact_views` / `contact_workspace_states` sin perder vistas compartidas ni orden.
- Catálogo de columnas por objeto (`contact-columns.catalog.ts` → patrón `ObjectColumnCatalog`) + campos custom del tenant fusionados.
- Filtros avanzados: compilador de condiciones a SQL parametrizado, compartido; cada objeto solo declara qué columnas son filtrables.
- Bulk actions ya tienen historial y undo: parametrizar por `object_type`.

Frontend

- `entities/object-descriptor`: key, columnas, campos, acciones de fila, ruta de ficha, nomenclatura.
- Features genéricas: `manage-views`, `filter-records`, `customize-table`, `edit-record-field` (renombrar desde `*-contact-*`).
- Widget `records-board` a partir de `contacts-board`; Contactos pasa a ser un descriptor más.

Aceptación

- Contactos sin regresión: suite Vitest + Playwright + budgets 50k filas verdes **antes** de tocar Empresas.
- `contacts-board` < 50 líneas propias; lo demás vive en el motor.
- Test de aislamiento cross-tenant en las tablas nuevas.
- jscpd en 0 clones.

Fuera de alcance: objetos custom creados por el usuario (anti-meta §3.2 de foundations — llegan tarde y con plantilla).

---

## 2.1 Empresas

Backend casi listo (`companies` + summary + asignar contactos).

- Lista con el motor (vistas, filtros, columnas, custom fields, import CSV, bulk).
- Ficha con `record-layout`: NIT con DV (módulo 11), contactos asociados, negocios abiertos en COP, timeline agregado de sus contactos.
- Dedup por NIT; merge de empresas reutilizando el patrón de ADR-0007.
- Aceptación: crear empresa desde la ficha de contacto y desde import · NIT inválido bloqueado en front (zod) y back (class-validator) · isolation e2e.

---

## 2.2 Negocios — pipeline

- Kanban por pipeline (múltiples pipelines por tenant: ventas, postventa, cobranza — Q8 se resuelve con presets, no con módulos nuevos).
- Drag & drop con update optimista (TanStack Query es válido aquí, ver defaults del frontend); probabilidad por etapa desde `pipeline_stages`.
- Vista tabla vía motor, misma data.
- Ganado/perdido con **motivo de pérdida como taxonomía** (`TaxonomyOption`), no texto libre.
- Forecast: suma ponderada por etapa y mes de cierre esperado.
- Ficha del negocio: contacto, empresa, productos (líneas con IVA por línea, preparación para Fase Dinero), timeline.
- **Antes de UI:** cerrar money fixes de Fase 1 (deals float vs int, kanban float coercion). Todo valor en centavos `BIGINT` y `formatCOP`.
- Aceptación: mover 200 tarjetas sin jank · conflicto de edición concurrente resuelto sin perder la última escritura visible · `Number.isInteger` en tests de dinero · isolation e2e.

---

## 2.3 Actividades + agenda

- Bandeja "Mis tareas" (hoy / vencidas / próximas) como pantalla de inicio del vendedor.
- Calendario semana/mes, zona `America/Bogota`, festivos colombianos (se reutilizan en Ley 2300 más adelante).
- Recordatorios vía `notifications` (BullMQ).
- **"Sin próximo paso" como estado de primera clase** (backlog #12): contacto/negocio sin actividad futura se marca; umbrales por configuración, no números mágicos.
- Aceptación: formatos `DD/MM/YYYY` · una tarea vencida aparece en ficha, bandeja y dashboard · isolation e2e.

---

## 2.4 Configuración visible

Las capas de personalización (léxico / estructura / apariencia) ya existen en backend; el cliente tiene que poder tocarlas sin soporte.

- Editor de pipelines y etapas (reordenar, probabilidad, archivar sin romper histórico).
- Editor de campos custom por objeto con **gobernanza**: `select` sugerido sobre texto libre, alerta a los 40 campos, bloqueo blando a los 60.
- Taxonomías (estados, fuentes, motivos de pérdida) con el mismo componente para todas.
- Completar los 9 presets con **dashboard por defecto** y plantillas sugeridas (preguntas 4 y 5 de foundations §5) — trabajo de datos.
- Aceptación: cambiar de preset en onboarding cambia nomenclatura, pipeline, campos y dashboard sin recargar código · ninguna pantalla lee `industry`.

---

## 2.5 Habeas Data

- Autorización con origen, finalidad y evidencia por contacto (consentimientos ya existen — completar campos Ley 1581).
- Exportar y suprimir datos del titular en un clic, con registro en `audit-log`.
- Métrica: 0% contactos sin fuente/autorización visible en dashboard.

---

## 2.6 Cierre de Fase 1 (en paralelo, no bloquea 2.0)

- Isolation tests para notifications, dashboard, audit-log, timeline, bulk-actions, users-invite.
- Arreglar `migrate-all-tenants` + env completo en job `e2e` de CI → gate real.
- DTO sweep (7 controllers con bodies inline).
- Money fixes (bloquean 2.2).
- Cobertura ≥ 70% global, ≥ 95% `shared-utils`.

---

## 3. Después de Fase 2 (sin cambios frente a foundations §7)

3. **Conversación** — WhatsApp bidireccional en el timeline + épica de plantillas (`feature/E0X-message-templates`).
4. **Dinero** — DIAN + Wompi + cartera.
5. **Automatización con freno legal** — motor de flujos + Ley 2300.
6. Verticalización profunda · 7. Inteligencia.

Backlog de Contactos pendiente (multi-valor email/teléfono, adjuntos, RUES, SARLAFT, lead score, @menciones) se reevalúa al terminar 2.1: varios pasan a ser features del motor y aplican a los tres objetos a la vez.

---

## 4. Definición de terminado por épica

- Backend: capas ADR-0005, `pnpm check:arch` verde, isolation e2e cross-tenant (404).
- Web: 11 cops verdes, tests espejo en `apps/web/tests/`, i18n es/en sincronizado, lógica en `model/`, nunca en `ui/`.
- Playwright del flujo crítico · Lighthouse perf ≥ 90 y a11y ≥ 90.
- Funciona en al menos 2 presets distintos (ej. salud e inmobiliaria) sin tocar código.
