# Núcleo CRM completo — plan maestro

> 2026-09-16 · Decisión de producto: **primero un núcleo CRM sólido y vendible; DIAN, Wompi, WhatsApp bidireccional e IA quedan para después.**
> Reordena [`../ROADMAP.md`](../ROADMAP.md) (Fases 3 "Dinero" y 4 "Automatización + IA" se posponen) y agrupa los planes de [`README.md`](README.md) dentro de un núcleo más amplio.
> Base: [`../crm-foundations.md`](../crm-foundations.md) §3.1 (8 capacidades núcleo) · [`../research/crm-adaptability-benchmark-2026-09.md`](../research/crm-adaptability-benchmark-2026-09.md).

---

## 1. Qué debe tener un CRM núcleo completo

Destilado de HubSpot Sales Hub, Pipedrive, Zoho CRM, Attio y GoHighLevel, sin las integraciones de dinero/mensajería. Si un comprador de pyme no encuentra una de estas 12 capacidades, **no lo percibe como CRM completo**.

| #       | Capacidad                        | Qué incluye como mínimo                                                                                                             |
| ------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **K1**  | Registros y modelo de datos      | Contactos, empresas, negocios, objetos propios; campos tipados; relaciones con etiqueta; ficha 360                                  |
| **K2**  | Listas y vistas                  | Tabla y kanban en cualquier objeto, filtros, vistas guardadas/compartidas, columnas, orden                                          |
| **K3**  | Pipelines y ventas               | Varios pipelines, etapas con reglas, ganado/perdido con motivo, pronóstico, productos en el negocio y cotización simple             |
| **K4**  | Actividades y agenda             | Tareas, llamadas, reuniones, notas, recordatorios, calendario, "Mis tareas", sin próximo paso                                       |
| **K5**  | Captura y asignación de leads    | Formularios web/QR, import, creación manual rápida, deduplicación al entrar, reglas de asignación (round-robin, por territorio)     |
| **K6**  | Equipo, roles y permisos         | Invitar, roles, equipos, visibilidad de registros (propios/equipo/todos), permisos por objeto y campo                               |
| **K7**  | Colaboración                     | Menciones, notificaciones in-app y correo, comentarios en registros, actividad del equipo                                           |
| **K8**  | Reportes y tableros              | Tableros por rol, reportes de embudo, conversión, actividad, pronóstico; filtros por fecha/dueño/equipo; exportar                   |
| **K9**  | Automatización básica            | Reglas "cuando pasa X y se cumple Y, haz Z" sobre eventos de registros: crear tarea, asignar, cambiar campo, notificar              |
| **K10** | Calidad y ciclo de vida del dato | Duplicados y fusión en todos los objetos, completitud, papelera, exportación, Habeas Data (autorización, exportar/suprimir titular) |
| **K11** | Búsqueda y productividad         | Búsqueda global de registros, creación rápida, atajos, acciones masivas, edición en línea                                           |
| **K12** | Adaptabilidad y arranque         | Ajustes sin consultor, paquetes de industria, onboarding < 10 min, ayuda contextual                                                 |

---

## 2. Estado actual de Nexo (verificado en código)

✅ listo · 🟡 parcial · ❌ no existe

| #   | Estado | Qué hay                                                                                                                                                       | Qué falta                                                                                                                  |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| K1  | 🟡     | Contactos completos (ficha, merge, consentimientos, timeline); API de empresas y negocios; campos custom en 3 objetos (16 tipos, fórmula, permisos por campo) | Objetos propios, relaciones con etiqueta, UI de empresas y negocios, ficha desde metadata → **plan 2.1, 2.2**              |
| K2  | 🟡     | Motor genérico: vistas, columnas, filtros avanzados, tablero (`widgets/records-board`) — solo montado en Contactos                                            | Kanban fuera de API, montaje en todos los objetos → **2.2, 2.3**                                                           |
| K3  | 🟡     | API de pipelines/etapas con color y probabilidad (`PipelinesPane`), negocios con won/lost/reopen/forecast, `products` API (13 endpoints) y `deal_items`       | UI de negocios y kanban, reglas por etapa, motivos de pérdida, catálogo de productos en web, cotización PDF → **2.3 + C4** |
| K4  | 🟡     | API de actividades (CRUD, calendar, complete/cancel/reopen), tipos configurables, composers en ficha de contacto                                              | Actividades sobre cualquier registro, "Mis tareas", calendario, recordatorios → **2.5**                                    |
| K5  | 🟡     | Import CSV con dedup, creación manual, probe de duplicados                                                                                                    | Formularios web/QR, reglas de asignación, dedup al entrar por formulario → **C3**                                          |
| K6  | 🟡     | 8 roles (`UserRole`), guards por rol, invitar/aceptar (`users.controller.ts` 3 endpoints), `fieldPermissions`, Google OAuth                                   | Pantalla de usuarios y roles, equipos, visibilidad por registro, desactivar usuario, 2FA → **C1**                          |
| K7  | 🟡     | Notificaciones API (listar, leer, preferencias), `mentioned_user_ids` en actividades, entidad web `notification`                                              | Centro de notificaciones completo, menciones que notifican, correo transaccional de avisos → **C2**                        |
| K8  | 🟡     | `dashboard` API (métricas, pipeline, actividades de hoy, top vendedores, ingresos por mes, config por usuario) y vista web básica                             | Reportes de embudo/conversión/actividad, filtros por equipo, tableros por rol, exportar → **C5**                           |
| K9  | ❌     | Tablas `workflows`/`workflow_executions` sin motor; eventos de dominio emitidos (`WEBHOOK_EVENTS`)                                                            | Motor de reglas simple → **C6**                                                                                            |
| K10 | 🟡     | Merge y papelera de contactos, bulk con undo, consentimientos por canal, export en bulk, audit log                                                            | Duplicados/fusión en todos los objetos, completitud, Habeas Data completo → **2.2 + C7**                                   |
| K11 | 🟡     | Paleta de comandos para **navegar** (`HeaderSearch`), creación rápida (`HeaderQuickCreate`), atajos, bulk, edición en línea                                   | Búsqueda global de **registros** en todos los objetos → **C2**                                                             |
| K12 | 🟡     | Ajustes amplios (apariencia, nomenclatura, navegación, campos, taxonomías, etiquetas, pipelines, tipos de actividad), presets por 9 sectores, onboarding      | Paquetes versionados, ayuda contextual → **2.4 + C8**                                                                      |

**Lectura:** la base es mucho más grande que la UI. El trabajo no es inventar módulos sino **cerrar capacidades de punta a punta** sobre el motor genérico.

---

## 3. Fuera del núcleo (pospuesto explícitamente)

| Pospuesto                                                     | Por qué ahora no                                           | Qué se deja listo para no rehacer                                                                 |
| ------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Facturación electrónica DIAN, notas crédito                   | Integración regulatoria pesada; no define si el CRM se usa | Negocios con líneas de producto, IVA por línea y montos en centavos (C4)                          |
| Pagos Wompi, cartera                                          | Depende de facturación                                     | Estado "ganado" + cotización con total                                                            |
| WhatsApp Business API bidireccional, bandeja unificada        | Costo, verificación Meta, operación                        | Botones "abrir WhatsApp" existentes, plantillas de mensaje (rama `feature/E0X-message-templates`) |
| Sincronización de correo (Gmail/Outlook) y calendario externo | Integraciones OAuth y privacidad                           | Actividades con tipo "correo" registradas manualmente                                             |
| IA (resúmenes, scoring, bot)                                  | Requiere datos limpios y uso real                          | Timeline y eventos consistentes                                                                   |
| Automatización con constructor visual y Ley 2300              | Va sobre el motor de reglas simple de C6                   | Eventos de dominio y `stage_hooks`                                                                |
| POS/retail                                                    | Ya congelado en ROADMAP                                    | —                                                                                                 |

---

## 4. Épicas del núcleo

Los planes 2.1–2.5 ya escritos cubren K1–K4 y K12 en parte. Se agregan **C1–C8** para completar el resto.

### C1 — Equipo, roles y visibilidad · M/L

**Objetivo:** el dueño administra su equipo sin soporte y cada persona ve lo que le corresponde.

| Incluye                                                                                                                         | Referencia en repo                                                            |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Ajustes → Usuarios: invitar, reenviar, cambiar rol, desactivar (reasignando registros), último acceso                           | `users.controller.ts` (list, invite, accept), tabla `invitations`, `UserRole` |
| Equipos: crear, miembros, líder; filtro "mi equipo" en todos los tableros                                                       | Nuevo `teams` + `team_members` en tenant                                      |
| Visibilidad por objeto y rol: **propios / equipo / todos** (lectura y edición) aplicada en el compilador de filtros             | `RecordFilterDefinition` (`shared/database/record-filter-sql.ts`)             |
| Permisos por campo existentes expuestos en UI                                                                                   | `TenantFullConfig.fieldPermissions`                                           |
| Seguridad de cuenta: 2FA TOTP opcional por usuario, obligatorio configurable por owner; sesiones activas y cerrar sesión remota | `auth` module, `refresh_tokens`                                               |

**Criterio de salida:** un vendedor con visibilidad "propios" no puede ver ni por API ni por export un contacto de otro vendedor (e2e 404), y el owner desactiva a un usuario reasignando sus 300 registros en un paso.

### C2 — Búsqueda global y centro de notificaciones · M

| Incluye                                                                                                                                                                                                       | Referencia                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Búsqueda global de registros en todos los objetos (nombre, email, teléfono normalizado, NIT, campos marcados `searchable`), sin tildes, respeta visibilidad de C1, resultados agrupados por objeto, recientes | `HeaderSearch` (hoy navegación), `search_text` + `nexo_unaccent` (plan 2.1 A2) |
| Centro de notificaciones: campana con no leídas, filtros, marcar leídas, preferencias por tipo y canal (in-app / correo)                                                                                      | `notifications.controller.ts` (5 endpoints), `entities/notification`           |
| Menciones `@usuario` en notas y actividades que notifican y enlazan al registro                                                                                                                               | `activities.mentioned_user_ids`                                                |
| Correo transaccional de avisos (asignación, mención, tarea vencida) con Resend                                                                                                                                | `shared/integrations/resend`                                                   |

**Criterio de salida:** escribir "jose 300" encuentra a "José Pérez" con celular 300… en < 300 ms; una mención llega como notificación y correo y abre el registro exacto.

### C3 — Captura y asignación de leads · M

| Incluye                                                                                                                                               | Referencia                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Formularios web públicos por objeto (campos desde metadata, consentimiento Ley 1581 obligatorio, anti-spam, QR descargable, embebible con `<script>`) | Backlog #11 `contacts-backlog.md`; `tenant-public.controller.ts` para rutas públicas |
| Deduplicación al entrar (email/teléfono/NIT normalizados) con política: actualizar, crear o marcar                                                    | `contact-duplicates.service.ts`, plan 2.2 probe                                      |
| Reglas de asignación: round-robin por equipo, por fuente, por ciudad/territorio, con respaldo                                                         | Nuevo `assignment_rules`; se ejecuta en creación (formulario, import, manual, API)   |
| Fuente y campaña (UTM) capturadas automáticamente                                                                                                     | `contacts.source` taxonomía                                                          |

**Criterio de salida:** un formulario en la web del cliente crea el contacto con consentimiento y UTM, lo asigna por round-robin al equipo "Ventas Medellín" y notifica al asignado en < 5 s.

### C4 — Productos y cotizaciones (sin facturación) · M

| Incluye                                                                                                  | Referencia                                                                                        |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Catálogo de productos/servicios en web (precio COP en centavos, IVA 0/5/19, unidad, activo, categorías)  | `products.controller.ts` (13 endpoints), tabla `products`                                         |
| Líneas de producto en el negocio con descuento e IVA por línea; valor del negocio calculado desde líneas | `deals.controller.ts` `:id/items`, tabla `deal_items` (checks de IVA y descuento ya en migración) |
| Cotización PDF con marca del tenant, numeración propia, envío por correo y enlace público de aceptación  | Tema/marca de `appearance`; S3 para PDF                                                           |
| Inventario **fuera** (se mantiene API, sin UI)                                                           | `inventory_movements`                                                                             |

**Criterio de salida:** un vendedor arma una cotización con 3 productos e IVA mixto, el total cuadra al centavo, el cliente la acepta por enlace y el negocio pasa a la etapa configurada.

### C5 — Reportes y tableros · L

| Incluye                                                                                                                                                                                | Referencia                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Tableros por rol (vendedor, gerente, dueño) sembrados por paquete de industria y editables                                                                                             | `dashboard` module, `user_dashboard_configs`, plan 2.4 capa `home` |
| Reportes predefinidos: embudo por etapa y conversión, ciclo de venta, negocios ganados/perdidos por motivo, actividad por usuario, fuentes de leads, sin próximo paso, tiempo en etapa | `record_stage_history` (2.3), `activities`, `contacts.source`      |
| Constructor simple: objeto + métrica (conteo, suma COP, promedio) + agrupar por (campo, dueño, equipo, fecha) + filtros existentes + visualización (barra, línea, tabla, número)       | Compilador de filtros genérico                                     |
| Exportar a CSV/XLSX y programar envío semanal por correo                                                                                                                               | `CsvExportService`, BullMQ                                         |

**Criterio de salida:** un gerente responde "¿cuánto vendió cada vendedor este trimestre y dónde se pierden los negocios?" en 2 clics y lo recibe cada lunes por correo.

### C6 — Automatización básica (motor de reglas) · L

| Incluye                                                                                                                                                                                                                                                      | Referencia                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Reglas por objeto: disparador (creado, campo cambió, entró a etapa, sin actividad N días, fecha de campo llega) → condiciones (filtros del motor) → acciones (crear tarea, asignar, cambiar campo, agregar etiqueta, notificar, enviar correo con plantilla) | Tablas `workflows`, `workflow_executions` (sin uso); eventos `WEBHOOK_EVENTS`; `stage_hooks` (2.3) |
| Ejecución en BullMQ con reintentos, idempotencia y **registro visible de cada ejecución con error legible**                                                                                                                                                  | `shared/queue`; principio P8                                                                       |
| Plantillas de reglas por paquete de industria (inactivas por defecto)                                                                                                                                                                                        | Plan 2.4 `behavior.automations`                                                                    |
| Límites por plan (reglas activas, ejecuciones/mes)                                                                                                                                                                                                           | `plans.limits.workflows`                                                                           |

**Criterio de salida:** "cuando un negocio entra a Propuesta y el valor es > $5.000.000, crear tarea de seguimiento en 3 días al dueño y notificar al gerente" se configura sin código y su ejecución queda auditada.

### C7 — Calidad del dato y Habeas Data · M

| Incluye                                                                                                                                | Referencia                                                |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Duplicados y fusión para empresas, negocios y objetos propios (patrón ADR-0007)                                                        | Plan 2.2 C3                                               |
| Indicador de completitud por registro y lista "datos incompletos" configurable por objeto                                              | `contact-completeness.ts` (hoy hardcodeado, auditoría A2) |
| Habeas Data: finalidad y evidencia de autorización, exportar datos del titular, suprimir con registro, política de privacidad generada | `data_consents`, backlog #8, `plan-phase-2.md` §2.5       |
| Exportación completa de la cuenta (todos los objetos, CSV/XLSX) para el dueño                                                          | `CsvExportService`                                        |
| Papelera unificada para todos los objetos con retención configurable                                                                   | `TrashPane`                                               |

**Criterio de salida:** un titular pide sus datos y el admin los exporta y suprime en < 2 minutos con evidencia en audit log.

### C8 — Experiencia, móvil y arranque · M

| Incluye                                                                                             | Referencia                                                                      |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| PWA instalable: ficha, llamadas, notas y "Mis tareas" usables en celular; offline básico de lectura | `ROADMAP.md` Fase 2 exit criteria (PWA) — hoy no hay manifest ni service worker |
| Checklist de primeros pasos por paquete y estado de configuración                                   | Plan 2.4 `onboarding.checklist`                                                 |
| Ayuda contextual (tooltips "¿para qué sirve?", enlaces a guías) y changelog in-app                  | `crm-foundations.md` Q7                                                         |
| Rendimiento y accesibilidad: Lighthouse perf ≥ 90, a11y ≥ 90 en tablero, ficha y "Mis tareas"       | `ROADMAP.md` Fase 2                                                             |

**Criterio de salida:** un vendedor instala Nexo en su celular, abre "Mis tareas", llama a un cliente desde la ficha y registra la nota en < 30 s.

---

## 5. Orden de ejecución

```
Base            0 Preparación ─► 2.1 Objetos configurables
                                     │
Ventas          ├─► 2.3 Pipelines ─► C4 Productos y cotizaciones
Registros       ├─► 2.2 Empresas + objeto propio
Trabajo diario  ├─► 2.5 Actividades y agenda
Equipo          └─► C1 Equipo, roles y visibilidad ─► C2 Búsqueda y notificaciones
                                     │
Crecer          C3 Captura y asignación ─► C6 Automatización básica
Decidir         C5 Reportes y tableros
Confiar         C7 Calidad del dato y Habeas Data
Adoptar         2.4 Paquetes de industria ─► C8 Experiencia y móvil
```

| Hito                          | Épicas                | Qué puede vender el equipo comercial al cerrar el hito                                                   |
| ----------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| **H1 — CRM de ventas usable** | 0, 2.1, 2.3, 2.2, 2.5 | "Maneja tus contactos, empresas, negocios en kanban y tu agenda en un solo lugar, adaptado a tu negocio" |
| **H2 — Listo para equipos**   | C1, C2, C4            | "Tu equipo con roles, cada uno ve lo suyo, cotizaciones profesionales"                                   |
| **H3 — Crece sin esfuerzo**   | C3, C6, C5            | "Los leads de tu web llegan solos, se asignan, y ves qué funciona"                                       |
| **H4 — Núcleo completo**      | C7, 2.4, C8           | "Datos limpios y legales, listo para tu industria en 10 minutos, en tu celular"                          |

**Por qué este orden:**

1. **2.1 primero:** todo lo demás (permisos, búsqueda, reportes, automatización) se escribe una sola vez sobre el motor genérico en vez de por objeto.
2. **Pipelines y actividades antes que equipo:** sin kanban ni agenda no hay uso diario que proteger con permisos.
3. **C1 antes de C2, C5 y C6:** búsqueda, reportes y reglas deben respetar la visibilidad desde el día uno; agregarla después obliga a reescribir consultas.
4. **C3 antes de C6:** las reglas más valiosas (asignar, primer seguimiento) empiezan cuando entran leads.
5. **2.4 al final del núcleo:** los paquetes empaquetan lo que ya existe (objetos, pipelines, reglas, tableros); hacerlos antes empaqueta cosas incompletas.

Si hay un solo desarrollador: seguir la tabla de hitos en orden. Con dos: en H1 uno lleva 2.1→2.3 y otro 2.5 (después de 2.1 A4); en H2 uno C1→C2 y otro C4.

---

## 6. Definición de "núcleo completo"

- Las 12 capacidades K1–K12 en ✅ en la tabla §2.
- Flujo de punta a punta en Playwright para 3 paquetes de industria: lead entra por formulario → asignado → tareas → negocio en kanban con cotización → ganado → aparece en reporte.
- Aislamiento por tenant y visibilidad por rol probados en cada endpoint.
- Presupuestos: listas p95 ≤ 150 ms con 100k registros por objeto; búsqueda global ≤ 300 ms; Lighthouse ≥ 90.
- Cobertura ≥ 70 % global (Fase 1) y sin excepciones nuevas en baselines de arquitectura.

---

## 7. Próximos documentos a escribir

Con el mismo formato de 2.1–2.5 (objetivo, referencias, decisiones, modelo de datos, API, web, PRs, pruebas, riesgos), en el orden en que se van a necesitar:

1. `C1-equipo-roles-visibilidad.md` (antes de cerrar H1, porque afecta el compilador de filtros).
2. `C4-productos-y-cotizaciones.md`.
3. `C2-busqueda-y-notificaciones.md`.
4. `C3-captura-y-asignacion.md`.
5. `C5-reportes-y-tableros.md`.
6. `C6-automatizacion-basica.md`.
7. `C7-calidad-y-habeas-data.md`.
8. `C8-experiencia-y-movil.md`.
