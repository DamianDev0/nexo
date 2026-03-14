# NexoCRM — Épicas y Stories (MVP + Personalización Profunda)

**BMad Enterprise Track | Agente: PM John + Architect Winston**

> Versión: 3.0 | Marzo 2026
> Alcance MVP (12 semanas): E-01 a E-13
> Personalización profunda (Post-MVP P1): E-15A, E-15B, E-15C, E-15D — corazón diferenciador del producto
> Import & migración: E-14
> Backlog extendido: E-16 a E-33

---

## Índice

- [Épicas del MVP](#épicas-del-mvp)
  - [E-01: Fundación Multitenant](#e-01-fundación-multitenant)
  - [E-02: Autenticación y Autorización](#e-02-autenticación-y-autorización)
  - [E-03: Onboarding + Configuración General](#e-03-onboarding-wizard--configuración-general)
  - [E-04: Gestión de Contactos](#e-04-gestión-de-contactos)
  - [E-05: Gestión de Empresas](#e-05-gestión-de-empresas)
  - [E-06: Pipeline de Ventas](#e-06-pipeline-de-ventas-deals)
  - [E-07: Actividades](#e-07-actividades)
  - [E-08: Facturación Electrónica DIAN](#e-08-facturación-electrónica-dian)
  - [E-09: Pagos Wompi](#e-09-pagos-wompi)
  - [E-10: WhatsApp Básico](#e-10-whatsapp-básico-notificaciones-salientes)
  - [E-11: Catálogo de Productos](#e-11-catálogo-de-productos-mvp-básico)
  - [E-12: Notificaciones y Alertas](#e-12-notificaciones-y-alertas)
  - [E-13: Dashboard y Métricas](#e-13-dashboard-y-métricas-básicas)
- [Estimación Total MVP](#estimación-total-del-mvp)
- [E-14: Import Masivo y Migración](#e-14-import-masivo-y-migración)
- [Épicas de Personalización Profunda](#épicas-de-personalización-profunda-post-mvp-p1)
  - [E-15A: Theme Engine y Branding](#e-15a-theme-engine-y-branding-por-tenant)
  - [E-15B: Nomenclatura y Navegación Configurable](#e-15b-nomenclatura-y-navegación-configurable)
  - [E-15C: Campos Custom, Vistas y Formularios](#e-15c-campos-custom-vistas-y-formularios)
  - [E-15D: Dashboard Configurable y Reportes](#e-15d-dashboard-configurable-y-reportes-custom)
- [Estimación Total Personalización](#estimación-total-personalización)
- [Backlog Post-MVP](#backlog-post-mvp)
- [Resumen Ejecutivo del Roadmap](#resumen-ejecutivo-del-roadmap)

---

## Épicas del MVP

### E-01: Fundación Multitenant

**Objetivo:** Configurar el sistema base de multitenancy con schema-per-tenant en PostgreSQL, resolución de subdominio y provisioning de nuevos tenants.

**Criterio de aceptación épica:** Un nuevo tenant puede registrarse, se crea su schema aislado, y sus datos nunca son visibles desde otro tenant.

> **Nota v3.0:** El modelo `public.tenants` incluye desde el día 1 el campo `config JSONB` completo con subestructura `theme`, `nomenclature`, `sidebarConfig`, `modules`, `customFields`, `i18n` y `dashboardLayout` — aunque vacíos, para evitar migraciones costosas cuando se implementen E-15A/B/C/D. El campo `i18n` soporta configuración regional desde el inicio.

---

#### Story E-01-S01: Configuración del schema público y provisioning de tenants

**Como** sistema, **quiero** crear automáticamente un schema PostgreSQL aislado para cada tenant nuevo **para que** sus datos estén completamente separados de otros tenants.

**Criterios de aceptación:**

- Al registrar un nuevo tenant, se crea `tenant_{slug}` schema en PostgreSQL
- El schema incluye todas las tablas del modelo de datos (contacts, companies, deals, activities, invoices, payments, pipelines, products, inventory_movements, whatsapp_conversations, whatsapp_messages, workflows, workflow_executions, notifications, ai_embeddings, audit_log)
- Los índices GIN para búsqueda full-text se crean automáticamente
- La extensión pgvector está disponible para la tabla ai_embeddings
- El TenantMiddleware resuelve el tenant correcto por subdominio en cada request
- La tabla `public.tenants` incluye el campo `config JSONB` con la estructura base:
  ```json
  {
    "theme": {
      "colors": {},
      "typography": {},
      "branding": {},
      "iconPack": "outline",
      "darkModeDefault": "system"
    },
    "nomenclature": {
      "contact": { "singular": "Contacto", "plural": "Contactos" },
      "company": { "singular": "Empresa", "plural": "Empresas" },
      "deal": { "singular": "Deal", "plural": "Deals" },
      "activity": { "singular": "Actividad", "plural": "Actividades" }
    },
    "sidebarConfig": { "modules": [] },
    "modules": {
      "contacts": true,
      "companies": true,
      "deals": true,
      "invoices": true,
      "payments": true,
      "whatsapp": true,
      "products": true,
      "reports": true
    },
    "i18n": {
      "language": "es",
      "locale": "es-CO",
      "currency": "COP",
      "timezone": "America/Bogota",
      "dateFormat": "DD/MM/YYYY"
    },
    "customFields": { "contacts": [], "companies": [], "deals": [] },
    "dashboardLayout": null
  }
  ```
- Test: un request autenticado como tenant A que intenta acceder a datos de tenant B recibe 404

**Tareas técnicas:**

1. Crear tabla `public.tenants` con campo `config JSONB` con el schema tipado arriba y seed de defaults
2. Crear tabla `public.plans` con seed de planes (free, starter, pro, enterprise)
3. Implementar `TenantProvisioningService` con la función `createTenantSchema(slug)`
4. Crear el SQL de todas las tablas del tenant como template
5. Implementar `TenantMiddleware` (subdominio → lookup en public.tenants → inyectar en request)
6. Cache del tenant lookup en Redis (TTL 5 minutos), incluyendo el campo `config` completo
7. Test de aislamiento: script que verifica que schema A no accede a schema B

**Estimación:** 5 story points

---

#### Story E-01-S02: Migration runner para todos los tenants

**Como** desarrollador, **quiero** un script que aplique migraciones a todos los schemas de tenants **para que** los cambios de modelo de datos se propaguen sin downtime.

**Criterios de aceptación:**

- El script itera todos los tenants y aplica el SQL de migración a cada schema
- Los errores en un tenant no detienen la migración de los demás (se loguean para revisión)
- El script es idempotente (ejecutarlo dos veces no duplica cambios)
- El script se ejecuta como paso del pipeline CI/CD antes del deploy

**Tareas técnicas:**

1. Crear `scripts/migrate-all-tenants.ts`
2. Agregar al pipeline GitHub Actions como paso pre-deploy-production
3. Documentar el proceso de rollback de migraciones

**Estimación:** 2 story points

---

### E-02: Autenticación y Autorización

**Objetivo:** Sistema completo de autenticación con Google OAuth, JWT RS256, refresh tokens, RBAC granular y audit log de acceso.

---

#### Story E-02-S01: Login con email/password y JWT

**Como** usuario, **quiero** iniciar sesión con mi email y contraseña **para que** pueda acceder a mi cuenta de NexoCRM de forma segura.

**Criterios de aceptación:**

- Login con email + password (bcrypt, min 12 salt rounds)
- Emite access token (JWT RS256, 1h) y refresh token (opaque UUID, 30 días)
- Access token en response body, refresh token en httpOnly cookie (Secure, SameSite=Lax)
- Rate limiting: máximo 10 intentos fallidos por IP en 15 minutos
- Refresh token rotation en cada uso; reutilización detectada invalida todas las sesiones del usuario
- Endpoint POST /auth/logout invalida el refresh token activo

**Tareas técnicas:**

1. Configurar Passport.js con estrategia local
2. Implementar generación de JWT RS256 (generar par de claves RSA)
3. Almacenar hash SHA-256 del refresh token en BD (nunca el token en claro)
4. Implementar rate limiting con Redis (sliding window)
5. Implementar refresh token rotation con detección de reutilización
6. Tests: login válido, password incorrecto, rate limit, refresh rotation

**Estimación:** 5 story points

---

#### Story E-02-S02: Login con Google OAuth 2.0

**Como** usuario, **quiero** iniciar sesión con mi cuenta de Google **para que** no tenga que recordar otra contraseña.

**Criterios de aceptación:**

- Botón "Continuar con Google" en la pantalla de login y registro
- Si el email ya existe en el tenant, vincula la cuenta Google (no crea duplicado)
- Si el email no existe, crea el usuario automáticamente con role 'owner' (solo en registro)
- Los mismos JWT de la Story E-02-S01 se emiten al final del OAuth flow

**Tareas técnicas:**

1. Configurar Passport.js con estrategia Google OAuth 2.0
2. Manejar el callback y la lógica de "find or create"
3. Redirigir al frontend con el access token tras el OAuth exitoso

**Estimación:** 3 story points

---

#### Story E-02-S03: RBAC — Roles y permisos granulares

**Como** Owner del negocio, **quiero** que cada miembro de mi equipo tenga acceso solo a lo que necesita **para que** los datos sensibles estén protegidos.

**Criterios de aceptación:**

- Roles: Owner, Admin, Manager, Sales Rep, Viewer con permisos definidos en la matriz del PRD
- El guard RBAC se aplica en todos los endpoints relevantes
- Un Sales Rep no puede emitir facturas DIAN (solo Manager+)
- Un Viewer no puede crear ningún registro
- Solo el Owner puede cambiar la resolución DIAN activa
- Invitación de usuarios por email con link de activación (expira en 48h)

**Tareas técnicas:**

1. Implementar `RBACGuard` y decorador `@RequirePermission`
2. Crear tabla `permissions` con la matriz de permisos por rol
3. Endpoint POST /users/invite (envía email con token)
4. Endpoint POST /auth/accept-invite (activa cuenta y asigna rol)
5. Tests de permisos por rol para cada endpoint crítico

**Estimación:** 5 story points

---

#### Story E-02-S04: Audit log de acceso y actividad del sistema

**Como** Owner del negocio, **quiero** ver un historial de quién hizo qué y cuándo en el sistema **para que** pueda detectar accesos no autorizados y auditar cambios críticos.

**Criterios de aceptación:**

- Página Settings → Seguridad → Audit Log visible solo para Owner y Admin
- El log muestra: fecha/hora, usuario, acción (login, logout, crear factura, cambiar resolución DIAN, invitar usuario, etc.), entidad afectada, IP de origen
- Filtros: por usuario, por tipo de acción, por rango de fechas
- Exportar el log filtrado a CSV
- Los eventos de login fallido también se registran (con IP y user-agent)
- Los eventos de cambio de resolución DIAN, cambio de permisos y eliminación de registros se marcan como "críticos" con badge rojo
- El audit log es inmutable — ningún rol puede eliminarlo, ni siquiera el Owner
- Paginación cursor-based — los logs pueden ser miles de registros

**Tareas técnicas:**

1. La tabla `tenant_{slug}.audit_log` ya existe en el schema — verificar que incluye `ip_address`, `user_agent`, `severity` ('info' | 'warning' | 'critical')
2. `AuditLogService.log(event: AuditEvent)` llamado desde los servicios relevantes
3. Interceptor `AuditInterceptor` para endpoints críticos (no para GETs — solo mutaciones y accesos sensibles)
4. Endpoint GET /audit-log con paginación cursor + filtros
5. Endpoint GET /audit-log/export.csv
6. Página `app/(app)/settings/security/audit-log/page.tsx` con tabla + filtros + export
7. Tests: log de login, log de cambio de resolución DIAN, inmutabilidad (DELETE devuelve 403)

**Estimación:** 5 story points

---

### E-03: Onboarding Wizard + Configuración General

**Objetivo:** Flujo de registro guiado de 4 pasos para nuevos tenants + panel de configuración general del negocio (datos fiscales, zona horaria, moneda, idioma).

---

#### Story E-03-S01: Wizard de onboarding de 4 pasos

**Como** nuevo usuario, **quiero** un wizard de configuración guiado **para que** pueda empezar a usar NexoCRM sin necesitar ayuda externa.

**Criterios de aceptación:**

- 4 pasos: (1) Datos personales/empresa (2) Sector y equipo (3) Pipeline (4) Primer contacto
- El usuario puede saltar el paso 4 (primer contacto es opcional)
- Si el usuario viene de Google OAuth, el paso 1 pre-llena nombre y email
- Al completar el wizard, el usuario llega al dashboard con guía contextual de empty state
- La validación del NIT en el paso 2 usa el algoritmo módulo 11 y muestra el DV calculado
- El wizard se puede retomar si el usuario cierra el browser a mitad
- En el paso 2, al seleccionar el sector, se aplica automáticamente un **preset de nomenclatura e íconos** para esa industria (ej: "Salud" → contactos = Pacientes, deals = Citas; "Educación" → contactos = Alumnos, deals = Matrículas). Esto pre-llena `nomenclature` y `iconPack` en `tenant.config`
- El preset de sector queda guardado pero es editable más adelante en Settings → Apariencia

**Tareas técnicas:**

1. Página /onboarding con stepper y estado persistido en localStorage
2. Selector de sector con íconos (8 sectores: Salud, Educación, Inmobiliaria, Comercio, Servicios, Restaurante, Tecnología, Construcción)
3. Componente InputNIT con validación de DV en tiempo real
4. Seed de presets por sector: pipeline stages + nomenclatura + icon pack por defecto
5. Al completar el wizard, `TenantProvisioningService.applyIndustryPreset(tenantId, sector)` guarda el preset en `tenant.config`
6. Empty state del dashboard con 4 CTAs contextuales post-onboarding

**Estimación:** 8 story points

---

#### Story E-03-S02: Configuración general del negocio

**Como** Owner del negocio, **quiero** un panel de configuración general **para que** el sistema refleje la identidad y las preferencias operativas de mi empresa.

**Criterios de aceptación:**

- Página Settings → General con las siguientes secciones:

**Sección Datos del negocio:**

- Nombre del negocio (máx 100 caracteres)
- NIT (con validación de DV en tiempo real)
- Régimen tributario (Responsable de IVA / No responsable / Gran contribuyente / Régimen simple)
- Dirección fiscal completa (calle, ciudad, departamento, código postal)
- Teléfono de contacto
- Email de contacto del negocio (no del usuario — el del negocio)
- Website (opcional)
- Logo del negocio (PNG/SVG/WebP, máx 2MB) — mismo upload que en E-15A pero accesible desde aquí

**Sección Preferencias regionales:**

- Idioma de la interfaz (Español / English / Português — solo estos 3 en el MVP de settings)
- Zona horaria (lista de IANA timezones — por defecto America/Bogota)
- Moneda principal (COP por defecto — lista de ISO 4217 con símbolo)
- Formato de fecha (DD/MM/YYYY / MM/DD/YYYY / YYYY-MM-DD)
- Formato de número (1.000,00 colombiano / 1,000.00 anglosajón)

**Sección Datos para facturación:**

- Estos campos pre-llenan automáticamente el emisor en las facturas DIAN
- Razón social (puede ser diferente al nombre comercial)
- Municipio (código DIAN del municipio)
- Responsabilidades fiscales (tags multiselect según lista DIAN)

- Al guardar, todos los campos se persisten en `public.tenants` (datos directos) y en `tenant.config.i18n` (preferencias regionales)
- Los cambios de idioma/zona horaria se aplican inmediatamente sin re-login
- Solo Owner puede cambiar datos fiscales; Owner y Admin pueden cambiar preferencias regionales

**Tareas técnicas:**

1. Endpoint PATCH /settings/general (RBAC: Owner para fiscal, Owner/Admin para el resto)
2. Endpoint GET /settings/general — devuelve datos actuales del tenant
3. Actualizar `TenantContext` en el frontend para exponer `i18n` config
4. Hook `useLocale()` que provee format helpers basados en `tenant.config.i18n`
5. Helpers de formateo: `formatCurrency(cents, currency)`, `formatDate(date, format)`, `formatNumber(n, locale)`
6. Página `app/(app)/settings/general/page.tsx` con secciones acordeón
7. Tests: guardado de datos fiscales, cambio de idioma aplica en la UI, formateo de moneda según locale

**Estimación:** 5 story points

---

### E-04: Gestión de Contactos

**Objetivo:** CRUD completo de contactos con campos Colombia-específicos, búsqueda full-text, deduplicación y timeline.

---

#### Story E-04-S01: CRUD de contactos con campos colombianos

**Como** vendedor, **quiero** crear y gestionar contactos con todos los datos que necesito en Colombia **para que** tenga toda la información de mis clientes en un solo lugar.

**Criterios de aceptación:**

- Crear contacto con: nombre, apellido, email, teléfono, WhatsApp, tipo de documento (CC/NIT/CE/PP/TI), número de documento, ciudad/municipio, departamento, estado, fuente, tags, vendedor asignado
- El selector de municipio tiene los 1.122 municipios de Colombia (searchable)
- La deduplicación detecta en tiempo real si ya existe un contacto con el mismo email, teléfono o número de documento y muestra sugerencia
- El estado del contacto es: Nuevo, En contacto, Calificado, Cliente, Inactivo, Perdido
- Soft delete (is_active = false) — el contacto no aparece en listas pero sus datos persisten
- Vista de lista y vista de tabla con columnas configurables

**Tareas técnicas:**

1. Endpoints POST/GET/PATCH/DELETE /contacts con paginación cursor-based
2. Endpoint GET /contacts/check-duplicate?email=&phone=&document= — deduplicación en tiempo real
3. JSON de 1.122 municipios en `packages/shared-utils/src/colombia-geo.ts`
4. Soft delete: DELETE /contacts/:id → sets is_active=false
5. Tests: CRUD completo, deduplicación por los 3 campos, soft delete, paginación

**Estimación:** 8 story points

---

#### Story E-04-S02: Búsqueda full-text de contactos

**Como** usuario, **quiero** buscar contactos desde cualquier parte de la app **para que** encuentre a quien necesito en menos de 2 segundos.

**Criterios de aceptación:**

- Búsqueda en: nombre, apellido, email, teléfono, nombre de empresa, número de documento, tags
- Resultados en menos de 300ms con hasta 10.000 contactos
- Búsqueda parcial funciona: "carlos" encuentra "Carlos Martínez"
- El buscador es el mismo campo en el header — no abre una página nueva

**Tareas técnicas:**

1. Índice GIN con tsvector configurable por `tenant.config.i18n.language` (no hardcodeado a 'spanish' — usar función que mapea language → postgres dict: `'es' → 'spanish'`, `'en' → 'english'`, `'pt' → 'portuguese'`)
2. Endpoint GET /contacts?q=term usando `to_tsquery(dict, term)` con el diccionario del tenant
3. Debounce de 300ms en el frontend antes de disparar la query

**Estimación:** 3 story points

---

#### Story E-04-S03: Timeline de contacto

**Como** vendedor, **quiero** ver el historial completo de un contacto en una sola vista **para que** tenga todo el contexto antes de comunicarme con él.

**Criterios de aceptación:**

- El timeline muestra todos los eventos del contacto en orden cronológico inverso
- Tipos de eventos en el timeline: actividad, nota, mensaje WhatsApp, factura emitida, pago recibido, deal creado/movido, cambio de estado
- El timeline se actualiza en tiempo real (WebSocket) cuando hay eventos nuevos
- El usuario puede agregar notas directamente desde el timeline

**Tareas técnicas:**

1. Endpoint GET /contacts/:id/timeline — agrega eventos de activities, invoices, payments, deals, whatsapp_messages ordenados por created_at DESC
2. WebSocket room `contact:{id}` — emite evento cuando se crea cualquier entidad relacionada al contacto
3. Componente `TimelineFeed` con scroll infinito y skeleton loading
4. Tests: timeline con múltiples tipos de evento, actualización en tiempo real via WS

**Estimación:** 5 story points

---

### E-05: Gestión de Empresas

**Objetivo:** CRUD de empresas con validación de NIT colombiano e información fiscal para DIAN.

---

#### Story E-05-S01: CRUD de empresas con NIT colombiano

**Como** vendedor, **quiero** gestionar las empresas de mis clientes con sus datos fiscales **para que** pueda facturarles correctamente y ver toda su actividad en un solo lugar.

**Criterios de aceptación:**

- Crear empresa con: nombre, NIT (con validación DV automática), régimen tributario, tamaño de empresa, sector CIIU, website, teléfono, dirección
- El régimen tributario es: Responsable de IVA, No responsable, Gran contribuyente, Régimen simple de tributación
- Relación 1:N empresa → contactos (asignar contactos existentes a la empresa)
- Vista de empresa muestra: datos fiscales, todos sus contactos, deals activos, facturas emitidas, total facturado, deuda vigente

**Tareas técnicas:**

1. Endpoints POST/GET/PATCH/DELETE /companies con paginación
2. Función `calculateNitDV(nit: string): number` en `packages/shared-utils` usando algoritmo módulo 11 colombiano
3. Endpoint GET /companies/:id/summary — agrega contactos, deals activos, facturas, total facturado y deuda vigente en una sola query
4. Endpoint POST /companies/:id/contacts — asigna un contacto existente a la empresa
5. Tests: validación NIT correcto/incorrecto, CRUD, summary con datos reales

**Estimación:** 5 story points

---

### E-06: Pipeline de Ventas (Deals)

**Objetivo:** Pipeline visual kanban con deals, drag & drop y vista de forecast.

---

#### Story E-06-S01: Pipeline kanban con drag & drop

**Como** vendedor, **quiero** ver mis deals en un tablero kanban y moverlos entre etapas **para que** tenga claridad del estado de cada oportunidad de venta.

**Criterios de aceptación:**

- Vista kanban con columnas por stage, drag & drop para mover deals
- El cambio de stage se guarda inmediatamente (optimistic update en frontend + confirmación servidor)
- El pipeline tiene stages configurables (nombre, color, probabilidad de cierre)
- Los stages por defecto se crean en el onboarding según el sector del tenant
- Al mover un deal a "Perdido", se requiere seleccionar motivo de pérdida (modal)
- Contador y valor total por stage en el header de cada columna

**Tareas técnicas:**

1. Implementar @dnd-kit/core para el drag & drop
2. Optimistic updates con TanStack Query y rollback en error
3. Modal de motivo de pérdida (requerido antes de confirmar el drop)
4. Endpoint PATCH /deals/:id/move-stage

**Estimación:** 8 story points

---

#### Story E-06-S02: Deal — creación y detalle

**Como** vendedor, **quiero** crear deals con items y ver su detalle completo **para que** tenga toda la información de la oportunidad y pueda convertirla a factura con un click.

**Criterios de aceptación:**

- Crear deal con: título, contacto (búsqueda), empresa (auto-cargada del contacto), valor en COP, fecha estimada de cierre, vendedor asignado
- Los items del deal (productos/servicios) se pueden agregar desde el catálogo o como texto libre
- El deal tiene su propio timeline de actividades
- Botón "Crear factura" en el deal que pre-carga los items en el formulario de factura

**Tareas técnicas:**

1. Endpoint POST /deals con array de items (catalogProductId o texto libre con precio manual)
2. Endpoint GET /deals/:id con relaciones completas (contact, company, stage, pipeline, items, activities timeline)
3. Endpoint POST /deals/:id/convert-to-invoice — crea un draft de factura pre-cargado con los items del deal
4. Tests: creación con items de catálogo, con items de texto libre, detalle con relaciones, conversión a factura

**Estimación:** 5 story points

---

### E-07: Actividades

---

#### Story E-07-S01: Registro de actividades y recordatorios

**Como** vendedor, **quiero** registrar mis actividades y recibir recordatorios **para que** nunca pierda un seguimiento con un cliente.

**Criterios de aceptación:**

- Crear actividades de tipo: llamada, reunión, email, tarea, nota, WhatsApp
- Cada actividad se puede asociar a un contacto, empresa o deal
- Recordatorio configurable: X minutos/horas/días antes
- Al enviar un WhatsApp desde el CRM, se crea automáticamente una actividad de tipo WhatsApp
- Vista de calendario con actividades del usuario logueado (vista diaria y semanal)
- Filtros: por tipo, por assignee, por entidad asociada, por estado (pendiente/completada)

**Tareas técnicas:**

1. Endpoints POST/GET/PATCH/DELETE /activities
2. Endpoint GET /activities/calendar?from=&to=&userId= — actividades por rango de fechas para vista calendario
3. Job BullMQ `activity-reminder` — se encola con `delay` calculado al crear la actividad, dispara notificación in-app al usuario asignado
4. Endpoint PATCH /activities/:id/complete — marca la actividad como completada con `completed_at = NOW()`
5. Tests: CRUD, recordatorio se encola con delay correcto, completar actividad, filtros por tipo y estado

**Estimación:** 5 story points

---

### E-08: Facturación Electrónica DIAN

**Objetivo:** Emitir facturas electrónicas que cumplan con la Resolución 000202/2025 de la DIAN vía MATIAS API.

---

#### Story E-08-S01: Configuración de resolución DIAN

**Como** dueño del negocio, **quiero** configurar mi resolución de facturación de la DIAN **para que** mis facturas sean legalmente válidas.

**Criterios de aceptación:**

- Formulario en Settings/DIAN para ingresar: número de resolución, fecha, prefijo, rango desde, rango hasta, clave técnica DIAN
- El sistema valida que el consecutivo actual está dentro del rango
- Alerta automática cuando quedan menos de 50 consecutivos disponibles
- Un tenant puede tener máximo 1 resolución activa a la vez
- Solo el role Owner puede cambiar la resolución activa

**Tareas técnicas:**

1. Endpoints POST/GET /invoice-resolutions
2. Endpoint PATCH /invoice-resolutions/:id/activate — desactiva la resolución anterior, activa la nueva; registra el cambio en audit_log con severity 'critical'
3. Job periódico diario (BullMQ cron) que verifica `range_to - current_number < 50` y dispara alerta in-app + email al Owner
4. Tests: activación de nueva resolución desactiva la anterior, alerta de consecutivos bajos, intento de activar por Sales Rep (403)

**Estimación:** 3 story points

---

#### Story E-08-S02: Emitir factura electrónica vía MATIAS API

**Como** vendedor o contador, **quiero** emitir facturas electrónicas DIAN directamente desde NexoCRM **para que** no tenga que salir a otra herramienta.

**Criterios de aceptación:**

- Formulario de factura pre-cargado desde deal (o creación manual)
- Campos requeridos: cliente (con NIT y régimen tributario), items con descripción/cantidad/precio/IVA, resolución activa
- Cálculo automático de: subtotal, IVA (19%/5%/0%), retención en la fuente (si aplica), ICA (configurable por municipio), total
- Al emitir: estado pasa a "Pendiente DIAN", se encola el job y se muestra spinner con mensaje
- Si DIAN aprueba: estado "Aprobada", se muestra CUFE y botones de envío
- Si DIAN rechaza: estado "Rechazada" con mensaje en lenguaje humano del motivo
- Los reintentos son automáticos (máximo 3 intentos con backoff exponencial)

**Tareas técnicas:**

1. Implementar cliente MATIAS API con los tipos correctos del request/response
2. Job BullMQ `emit-dian` con retry y backoff exponencial
3. WebSocket que actualiza el estado de la factura en el frontend en tiempo real
4. Mapeo de errores DIAN a mensajes en español para el usuario

**Estimación:** 13 story points _(el más complejo del MVP)_

---

#### Story E-08-S03: Nota crédito (anulación de factura)

**Como** contador, **quiero** anular una factura emitida ante la DIAN **para que** el registro contable sea correcto sin eliminar evidencia histórica.

**Criterios de aceptación:**

- Solo se pueden anular facturas con estado "Aprobada" o "Pagada"
- Se requiere seleccionar motivo de anulación (lista predefinida)
- Se genera automáticamente una Nota Crédito ante la DIAN por el monto total
- La factura original queda con estado "Anulada" — nunca se elimina
- Si la factura estaba pagada, el pago queda como crédito a favor del cliente

**Tareas técnicas:**

1. Endpoint POST /invoices/:id/credit-note con `{ reason: string }`
2. Validación de estado: solo 'approved' o 'paid' permiten nota crédito
3. Integración con MATIAS API para emitir la nota crédito
4. Actualizar `invoice.status → 'voided'` y `payment.status → 'credited'` si aplica; registrar en audit_log
5. Tests: anulación de factura aprobada, anulación de factura pagada, intento de anular draft (400), intento por Sales Rep (403)

**Estimación:** 5 story points

---

### E-09: Pagos Wompi

---

#### Story E-09-S01: Generación de link de pago Wompi

**Como** vendedor, **quiero** generar un link de pago con un click **para que** mi cliente pueda pagar con su método preferido.

**Criterios de aceptación:**

- Botón "Generar link de pago" en la factura aprobada
- El link se genera vía Wompi API y expira en 72 horas (configurable)
- El link acepta: Nequi, PSE, tarjeta crédito/débito, Daviplata, Bancolombia
- El link se puede copiar al portapapeles o compartir directamente por WhatsApp
- El monto y nombre del cliente están pre-cargados en el link de Wompi

**Tareas técnicas:**

1. Integración con Wompi Payment Link API (`POST /payment_links`)
2. Endpoint POST /invoices/:id/payment-link — crea el link y lo persiste en `payments.wompi_payment_link`
3. Endpoint GET /invoices/:id/payment-link — devuelve el link existente o genera uno nuevo si expiró
4. Tests: generación exitosa, link expirado genera uno nuevo, factura no aprobada devuelve 400

**Estimación:** 5 story points

---

#### Story E-09-S02: Webhook de Wompi y conciliación automática

**Como** sistema, **quiero** procesar los webhooks de Wompi automáticamente **para que** las facturas se marquen como pagadas sin intervención manual.

**Criterios de aceptación:**

- El webhook de Wompi actualiza la factura a estado "Pagada" automáticamente
- La verificación de firma del webhook es obligatoria (rechazar si no coincide)
- El handler es idempotente (procesar el mismo webhook dos veces no duplica el pago)
- Una notificación in-app y por email se envía al Owner cuando se recibe un pago
- El dashboard de cartera se actualiza en tiempo real via WebSocket

**Tareas técnicas:**

1. Endpoint público POST /webhooks/wompi — sin auth JWT, con verificación de firma HMAC-SHA256 usando el events secret de Wompi
2. Handler idempotente: verificar que `wompi_transaction_id` no existe en `payments` antes de crear
3. Actualizar `invoice.status → 'paid'`, crear registro en `payments` con todos los metadatos
4. Llamar a `NotificationsService.send()` para notificación in-app + email al Owner
5. Emitir evento WebSocket `payment:received` al room del tenant
6. Tests: webhook válido procesa pago, webhook duplicado no duplica (idempotencia), firma inválida devuelve 400, notificación enviada

**Estimación:** 5 story points

---

#### Story E-09-S03: Dashboard de cartera

**Como** Owner o Manager, **quiero** una vista consolidada de mis cobros pendientes **para que** pueda gestionar el flujo de caja sin perder ninguna factura.

**Criterios de aceptación:**

- Dashboard en /payments con tabs: Por cobrar / Vencidas / Pagadas
- Las facturas vencidas se muestran ordenadas por días de mora (más antiguas primero)
- Los totales (por cobrar, vencido, pagado del mes) se muestran en cards métricas
- El usuario puede enviar un recordatorio de cobro desde el dashboard (abre el template de WhatsApp)
- Filtros por período y por cliente

**Tareas técnicas:**

1. Endpoint GET /payments/dashboard?tab=pending|overdue|paid&from=&to=&contactId=
2. Cálculo de días de mora: `DATE_PART('day', NOW() - due_date)` para facturas vencidas
3. Caching de los totales en Redis (TTL 5 minutos, invalidado al recibir un pago)
4. Tests: tab vencidas ordena por mora, totales correctos, cache hit y miss

**Estimación:** 5 story points

---

### E-10: WhatsApp Básico (notificaciones salientes)

---

#### Story E-10-S01: Envío de factura y link de pago por WhatsApp

**Como** vendedor, **quiero** enviar la factura y el link de pago al cliente por WhatsApp con un click **para que** el cobro sea inmediato y sin fricción.

**Criterios de aceptación:**

- Botón "Enviar por WhatsApp" en la factura aprobada
- Modal con vista previa del mensaje que se enviará (editable)
- El mensaje incluye: saludo con nombre del cliente, número de factura, monto total, link de pago
- El número de WhatsApp del cliente se pre-carga del contacto
- El mensaje se envía desde el número compartido de NexoCRM
- La actividad "WhatsApp enviado" se registra en el timeline del contacto
- Si el cliente no tiene número de WhatsApp en su perfil, se pide antes de enviar

**Tareas técnicas:**

1. Integración con 360dialog API (endpoint `POST /messages` de WhatsApp Business)
2. Endpoint POST /invoices/:id/send-whatsapp con `{ phone: string, messageOverride?: string }`
3. Crear actividad tipo 'whatsapp' en el timeline del contacto al enviar exitosamente
4. Template de mensaje configurable por tenant (con variables `{{nombre}}`, `{{factura}}`, `{{monto}}`, `{{link}}`) almacenado en `tenant.config`
5. Tests: envío exitoso crea actividad, contacto sin WhatsApp devuelve error descriptivo, template con variables interpoladas correctamente

**Estimación:** 5 story points

---

### E-11: Catálogo de Productos (MVP básico)

---

#### Story E-11-S01: Catálogo básico de productos y servicios

**Como** vendedor, **quiero** mantener un catálogo de mis productos y servicios **para que** pueda agregarlos rápidamente a deals y facturas sin tener que escribirlos cada vez.

**Criterios de aceptación:**

- CRUD de productos con: nombre, SKU, descripción, precio (COP), costo, tarifa de IVA (0%/5%/19%), tipo (producto/servicio), unidad de medida
- Los productos del catálogo se pueden agregar a deals y facturas (búsqueda por nombre o SKU)
- Control de stock básico: el stock se descuenta cuando se emite una factura aprobada
- Alerta de stock mínimo configurable por producto

**Tareas técnicas:**

1. Endpoints POST/GET/PATCH/DELETE /products con búsqueda por nombre y SKU
2. Endpoint POST /products/:id/inventory — ajuste manual de stock (cantidad + tipo: 'adjustment' | 'return')
3. Listener del evento `invoice.approved` que descuenta el stock de cada item en la factura
4. Job periódico diario que verifica productos bajo stock mínimo y dispara alerta in-app al Owner
5. Tests: CRUD, búsqueda por SKU, descuento automático de stock al aprobar factura, alerta de stock mínimo

**Estimación:** 5 story points

---

### E-12: Notificaciones y Alertas

---

#### Story E-12-S01: Notificaciones in-app en tiempo real

**Como** usuario, **quiero** recibir notificaciones en tiempo real dentro de la app **para que** esté informado de lo que pasa en mi negocio sin tener que revisar cada sección.

**Criterios de aceptación:**

- Bell icon en el header con badge de conteo de notificaciones no leídas
- Las notificaciones llegan en tiempo real via WebSocket (sin recargar la página)
- Al hacer click en la notificación, navega a la entidad relevante (ej: clic en "Factura aprobada" → abre la factura)
- El usuario puede marcar todas como leídas
- Tipos de notificación del MVP: factura aprobada DIAN, factura rechazada DIAN, pago recibido, pago fallido, nuevo deal asignado

**Tareas técnicas:**

1. WebSocket gateway `NotificationsGateway` con rooms por `userId`
2. Endpoint GET /notifications?unread=true&page=1 (paginación cursor)
3. Endpoint PATCH /notifications/mark-all-read
4. Endpoint PATCH /notifications/:id/read
5. `NotificationsService.send(userId, event)` llamado desde `InvoicesService`, `PaymentsService`, `DealsService`
6. Tests: notificación in-app recibida via WS, mark as read actualiza badge, conteo de unread correcto

**Estimación:** 5 story points

---

### E-13: Dashboard y Métricas Básicas

---

#### Story E-13-S01: Dashboard principal con métricas del negocio

**Como** Owner o Manager, **quiero** ver un resumen del estado de mi negocio al entrar al CRM **para que** pueda tomar decisiones rápidas con la información correcta.

**Criterios de aceptación:**

- 4 cards métricas: Por cobrar (COP), Vencido (COP), Deals activos (cantidad y valor), Facturado este mes (COP)
- Widget de actividades de hoy: lista de actividades pendientes con due_date = hoy
- Widget de facturas vencidas: top 3 facturas más antiguas vencidas con botón de cobro rápido
- Widget de pipeline: resumen por stage (cantidad y valor)
- Las métricas se calculan en el servidor y se cachean en Redis (TTL 5 minutos)
- El dashboard es la primera pantalla después del login

**Tareas técnicas:**

1. Endpoint GET /dashboard/metrics — calcula las 4 métricas en el schema del tenant, cachea en Redis con key `dashboard:metrics:{tenantId}:{userId}` TTL 5min
2. Endpoint GET /dashboard/today-activities — actividades del usuario con `due_date::date = CURRENT_DATE`
3. Endpoint GET /dashboard/overdue-invoices?limit=3 — top 3 facturas más antiguas con status 'overdue'
4. Endpoint GET /dashboard/pipeline-summary — deals agrupados por stage con COUNT y SUM(value_cents)
5. Invalidación de cache: cuando se crea/actualiza factura o pago, invalida `dashboard:metrics:{tenantId}:*`
6. Tests: métricas correctas con datos reales, cache hit en segunda llamada, invalidación al crear una factura

**Estimación:** 5 story points

---

## Estimación Total del MVP

| Épica                                | Story Points |
| ------------------------------------ | ------------ |
| E-01: Fundación Multitenant          | 7            |
| E-02: Auth, Autorización y Audit Log | 18           |
| E-03: Onboarding + Config General    | 13           |
| E-04: Gestión de Contactos           | 16           |
| E-05: Gestión de Empresas            | 5            |
| E-06: Pipeline de Ventas             | 13           |
| E-07: Actividades                    | 5            |
| E-08: Facturación DIAN               | 21           |
| E-09: Pagos Wompi                    | 15           |
| E-10: WhatsApp Básico                | 5            |
| E-11: Catálogo de Productos          | 5            |
| E-12: Notificaciones                 | 5            |
| E-13: Dashboard                      | 5            |
| **TOTAL MVP**                        | **133 SP**   |

**Velocidad estimada:** 15-20 SP/semana para un dev solo.
**Duración estimada:** 8-9 semanas de desarrollo.
**Buffer de seguridad recomendado:** +20% → 11 semanas para lanzar beta con calidad.

**Path crítico:**

- Registrarse en MATIAS sandbox en **semana 1** (no esperar al Sprint 5)
- Registrarse en Wompi en **semana 1**
- Configurar 360dialog para WhatsApp en **semana 1**
- E-01 (multitenancy) debe completarse antes de cualquier otra épica
- E-02 (auth) debe completarse antes de E-04, E-05, E-06
- E-03-S02 (settings generales) debe completarse antes de E-08 (DIAN necesita NIT del negocio)
- E-08 (DIAN) y E-09 (Wompi) son las más complejas y las más críticas del negocio

---

## E-14: Import Masivo y Migración

**Objetivo:** Permitir que nuevos tenants importen su base de datos existente desde archivos CSV/Excel o directamente desde otros CRMs, para eliminar la fricción de migración que es la principal barrera de adopción.

**Criterio de aceptación épica:** Un negocio con 5.000 contactos en Excel puede importarlos a Nexo en menos de 10 minutos, con validación, mapeo de columnas y reporte de errores.

---

#### Story E-14-S01: Importador de contactos y empresas desde CSV/Excel

**Como** Owner del negocio, **quiero** importar mis contactos y empresas desde un archivo CSV o Excel **para que** pueda empezar a usar Nexo sin perder mi base de datos existente.

**Criterios de aceptación:**

- Soporte de archivos: CSV (separador coma o punto y coma), XLSX, XLS — máx 10MB / 50.000 filas
- Flujo de importación en 4 pasos:
  1. **Upload**: drag & drop o selector de archivo
  2. **Mapeo de columnas**: el usuario mapea columnas del archivo a campos de Nexo (estándar + campos custom). Nexo sugiere el mapeo automáticamente por nombre de columna similar
  3. **Preview + validación**: muestra las primeras 5 filas parseadas y resumen de errores encontrados (emails inválidos, NITs incorrectos, etc.)
  4. **Confirmación**: resumen de cuántos registros se importarán, cuántos se saltarán por errores
- La importación se procesa en background (job BullMQ) — el usuario recibe notificación al terminar
- Deduplicación automática: si existe un contacto con el mismo email/teléfono/documento, se actualiza (no duplica)
- Reporte de importación: descargable en CSV con el resultado fila por fila (importado / actualizado / error + motivo del error)
- Los campos custom del tenant aparecen disponibles en el mapeo de columnas

**Tareas técnicas:**

1. Endpoint POST /imports/contacts (multipart/form-data) — recibe el archivo y lo guarda en R2 temporalmente
2. Endpoint POST /imports/contacts/map — recibe el mapeo de columnas, devuelve preview de 5 filas + errores
3. Endpoint POST /imports/contacts/confirm — encola el job de importación
4. Job BullMQ `import-contacts` — parsea el archivo, aplica mapeo, llama a `ContactsService.upsert()` por lote de 100, guarda resultado en `tenant.imports` table
5. Tabla `tenant_{slug}.imports` con: id, type, status, total, success, errors, report_url, created_by, created_at
6. Mismo flujo para empresas: `POST /imports/companies`
7. Parser para CSV (papaparse) y XLSX (xlsx library)
8. Tests: CSV con errores parciales, deduplicación, importación de campos custom, notificación al completar

**Estimación:** 13 story points

---

#### Story E-14-S02: Migración asistida desde otros CRMs

**Como** negocio que viene de HubSpot o Pipedrive, **quiero** importar mis datos usando el formato de export de esa herramienta **para que** no tenga que re-formatear todo manualmente.

**Criterios de aceptación:**

- Templates de importación pre-configurados para: HubSpot Contacts export, Pipedrive Contacts export, Salesforce Contacts export (formato CSV estándar de cada plataforma)
- Al seleccionar "Vengo de HubSpot", el mapeo de columnas se pre-configura automáticamente
- Se importan: contactos, empresas y deals (con sus etapas mapeadas a los stages del pipeline del tenant)
- Guía visual en el paso de mapeo que muestra qué columna de HubSpot corresponde a qué campo de Nexo
- Las etapas del pipeline de origen se mapean a las etapas del tenant (el usuario puede ajustar el mapeo)

**Tareas técnicas:**

1. Archivo de configuración `migration-templates.ts` con los mapeos predefinidos por CRM de origen
2. Selector de "CRM de origen" en el primer paso del importador
3. Lógica de mapeo de stages: el usuario ve los stages del CRM origen y los mapea a sus stages de Nexo
4. Importación de deals: usar `DealsService.create()` con el stage mapeado
5. Tests: importación de export de HubSpot, mapeo de stages, deals importados con stage correcto

**Estimación:** 8 story points

**Total E-14: 21 story points**

---

## Épicas de Personalización Profunda (Post-MVP P1)

> Estas épicas son el **corazón diferenciador de Nexo**. Cada tenant debe sentir que tiene un CRM construido a su medida — no una herramienta genérica. Las épicas E-15A a E-15D se implementan en ese orden estricto ya que cada una depende de la anterior.
>
> **Dependencia compartida:** E-01-S01 debe haber incluido el campo `config JSONB` en `public.tenants` con la estructura completa. Si no fue así, el primer paso de E-15A es la migración de ese campo.

---

### E-15A: Theme Engine y Branding por Tenant

**Objetivo:** Que cada tenant pueda personalizar completamente la identidad visual de su instancia — colores, tipografía, iconografía, logo, favicon, login page, dark mode y dominio propio — con un editor visual en tiempo real, sin tocar código.

**Criterio de aceptación épica:** Un tenant entra a Settings → Apariencia, cambia su logo, colores primarios, tipografía y paquete de íconos, ve el resultado en vivo en el preview, guarda, y todos sus usuarios ven la interfaz con ese branding aplicado. Si el tenant configura un dominio propio, su equipo accede via `crm.suempresa.com`.

**Dependencias:** E-01-S01 (config JSONB), E-02-S03 (RBAC — solo Owner/Admin edita branding)

---

#### Story E-15A-S01: Modelo de datos tipado para configuración visual del tenant

**Como** sistema, **quiero** un modelo de configuración de tema tipado y versionado **para que** cualquier cambio de branding sea auditable y reversible.

**Criterios de aceptación:**

- El campo `config.theme JSONB` en `public.tenants` sigue esta estructura estricta:
  ```typescript
  type TenantTheme = {
    colors: {
      primary: string // HEX — botones, links, acciones primarias
      primaryForeground: string // HEX — texto sobre primary (debe cumplir WCAG AA)
      secondary: string // HEX — color secundario
      accent: string // HEX — hover, highlights
      sidebar: string // HEX — fondo del sidebar
      sidebarForeground: string // HEX — texto e íconos del sidebar
    }
    typography: {
      fontFamily: 'inter' | 'roboto' | 'poppins' | 'nunito' | 'system'
      borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
      density: 'compact' | 'comfortable' | 'spacious'
    }
    branding: {
      logoUrl: string | null // URL en Cloudflare R2
      faviconUrl: string | null // URL en Cloudflare R2
      loginBgUrl: string | null // URL en Cloudflare R2
      companyName: string // Nombre en el header
      loginTagline: string | null // Frase en la pantalla de login
    }
    iconPack: 'outline' | 'filled' | 'duotone' | 'rounded'
    darkModeDefault: 'light' | 'dark' | 'system'
  }
  ```
- Los valores por defecto corresponden al design system de Nexo (azul `#1B4FD8`, Inter, md radius, comfortable, outline icons)
- Cada cambio de tema crea un registro en `public.tenant_theme_history` (tenant_id, changed_by, previous_config JSONB, created_at) — máximo 30 versiones guardadas, FIFO
- `TenantConfigService.getTheme(tenantId)` cachea el resultado en Redis (TTL 10 minutos), invalidado al guardar
- Test: `getTheme('tenant-a')` nunca retorna datos de `tenant-b`

**Tareas técnicas:**

1. Migración: agregar/actualizar el campo `config.theme` en `public.tenants` con seed de defaults
2. Crear tabla `public.tenant_theme_history` con índice en `(tenant_id, created_at DESC)`
3. Implementar `TenantConfigService.getTheme()` con cache Redis
4. Implementar `TenantConfigService.updateTheme()` con escritura a BD + historia + invalidación de cache
5. Tests unitarios del servicio + test de aislamiento cross-tenant

**Estimación:** 3 story points

---

#### Story E-15A-S02: CSS variables dinámicas por tenant — runtime injection

**Como** sistema, **quiero** inyectar las CSS variables del tema del tenant en cada request **para que** el frontend aplique el branding correcto desde el primer render, sin flash visual.

**Criterios de aceptación:**

- Endpoint `GET /api/tenant/[slug]/theme.css` retorna CSS con las variables del tenant:
  ```css
  :root {
    --color-primary: #1b4fd8;
    --color-primary-foreground: #ffffff;
    --color-sidebar-bg: #0f172a;
    --color-sidebar-fg: #f8fafc;
    --font-family-brand: 'Poppins', sans-serif;
    --radius-base: 8px;
    --ui-density: comfortable;
    --icon-pack: outline;
  }
  ```
- Headers correctos: `Cache-Control: public, max-age=300, s-maxage=3600`
- Al guardar cambios de tema, se invalida la cache del CDN via Cloudflare Cache Tag `tenant-theme-{slug}`
- El `AppShell` de Next.js carga este CSS como el primer `<link>` en el `<head>`, antes de cualquier otro stylesheet (SSR)
- Fallback al tema Nexo por defecto si el tenant no tiene configuración
- No hay FOUC — el CSS se inyecta en el SSR del root layout
- Test: el CSS del slug `tenant-a` nunca se sirve al subdominio de `tenant-b`

**Tareas técnicas:**

1. Endpoint `GET /api/tenant/[slug]/theme.css` en Next.js API routes (Edge Runtime para latencia mínima)
2. Función pura `themeToCSS(theme: TenantTheme): string` — genera las variables CSS
3. Headers de cache + invalidación por Cloudflare Cache Tag al actualizar tema
4. Inyección en `app/layout.tsx` como `<link rel="stylesheet" href="/api/tenant/[slug]/theme.css">` con `fetchPriority="high"`
5. Mapeo de `borderRadius` → px: `none=0`, `sm=4`, `md=8`, `lg=12`, `full=9999`
6. Mapeo de `fontFamily` → Google Fonts URL (Inter, Roboto, Poppins, Nunito) — preload en el head
7. Tests: snapshot del CSS generado por tenant, test de no-cross-tenant

**Estimación:** 5 story points

---

#### Story E-15A-S03: Editor de tema visual con preview en tiempo real

**Como** Owner del tenant, **quiero** un editor visual de branding en Settings **para que** pueda personalizar mi CRM sin necesitar un diseñador.

**Criterios de aceptación:**

**Sección Identidad:**

- Upload de logo: PNG/SVG/WebP, máx 2MB, mínimo 100×100px, se convierte a WebP y se sube a Cloudflare R2
- Upload de favicon: PNG/ICO, 32×32px o 64×64px recomendado
- Upload de imagen de fondo del login: JPG/PNG/WebP, máx 5MB
- Campo editable para nombre de empresa (máx 50 caracteres)
- Campo para tagline de login (máx 80 caracteres)

**Sección Colores:**

- Color picker (hex + rgb + hsl) para: primario, secundario, acento, sidebar
- Al elegir el color primario, el sistema sugiere automáticamente `primaryForeground` con contraste WCAG AA (≥ 4.5:1). El usuario puede ignorar la sugerencia pero ve un warning si el contraste falla
- Paleta de colores predefinidas por industria (8 presets: Salud, Educación, Inmobiliaria, etc.)

**Sección Tipografía:**

- Selector de 5 fuentes con preview de texto de muestra en tiempo real
- Selector de border radius: Flat / Suave / Redondeado / Pill — mostrado como botones con preview visual del radio
- Selector de densidad: Compacto / Cómodo / Espacioso

**Sección Iconografía:**

- Selector de 4 packs de íconos: Outline / Filled / Duotone / Rounded
- Preview de 12 íconos representativos del CRM (contacto, empresa, deal, factura, WhatsApp, notificación, configuración, búsqueda, más, calendario, actividad, producto)
- Preview visual lado a lado de los 4 packs para que el usuario compare antes de elegir

**Panel de Preview:**

- El panel derecho (30% del ancho en desktop, tab en mobile) muestra un minipreview del sidebar + header + una card de contacto + un botón de acción, todo con los cambios aplicados en tiempo real (sin guardar)
- El preview no es la UI real — es un componente `ThemePreviewPanel` aislado que recibe el tema como props

**Guardado e historial:**

- Botón "Guardar cambios" — aplica el tema en vivo (invalida cache CDN, todos los usuarios ven el cambio en ≤5 minutos)
- Botón "Restaurar defaults Nexo" con modal de confirmación
- Sección "Historial" muestra las últimas 5 versiones con fecha, usuario que hizo el cambio y botón "Restaurar esta versión"

**Tareas técnicas:**

1. Página `app/(app)/settings/appearance/page.tsx` con `ThemeEditor` como componente principal
2. Hook `useThemePreview(theme: Partial<TenantTheme>)` — aplica CSS variables temporales vía `document.documentElement.style.setProperty` sin persistir
3. Componente `ThemePreviewPanel` — sidebar simulado + header + card + botón, todo con CSS variables
4. Función `checkContrastRatio(fg: string, bg: string): number` implementando el algoritmo WCAG 2.1 (luminancia relativa)
5. Servicio de upload a R2 con resize automático (sharp) y retorno de URL pública
6. Endpoint `PATCH /api/settings/theme` (RBAC: role Owner o Admin)
7. Endpoint `GET /api/settings/theme/history` — últimas 5 versiones
8. Endpoint `POST /api/settings/theme/restore/:historyId`
9. Tests: contrast checker unitario, upload validation, preview sin mutación del estado global, RBAC en el PATCH

**Estimación:** 8 story points

---

#### Story E-15A-S04: Login page branded por tenant

**Como** usuario final del tenant, **quiero** ver una pantalla de login con el branding de mi empresa **para que** la experiencia sea coherente con la marca que uso todos los días.

**Criterios de aceptación:**

- `miempresa.nexocrm.co/login` muestra: logo del tenant, colores primarios, tagline (si configurado), imagen de fondo (si configurada)
- Si el tenant no tiene logo configurado, se muestra el logo de Nexo como fallback
- En mobile (< 480px): formulario ocupa 100% del ancho, logo centrado, imagen de fondo con `object-fit: cover` y overlay semitransparente para asegurar legibilidad
- La página tiene meta OG tags con el logo y nombre del tenant (para links compartidos)
- El campo de email tiene `autocomplete="email"` correcto — no bloquea gestores de contraseñas
- El branding del login se carga desde el endpoint público `GET /api/tenant/[slug]/branding` (sin auth — solo devuelve logo, tagline, colores, NO datos sensibles)

**Tareas técnicas:**

1. Modificar `app/(auth)/login/page.tsx` — Server Component que resuelve el tenant por subdominio
2. Componente `BrandedLoginShell` que recibe `{ logoUrl, companyName, tagline, loginBgUrl, colors }` y renderiza el layout
3. Endpoint público `GET /api/tenant/[slug]/branding` — cacheable, sin datos sensibles
4. Generación dinámica de metadata OG en el Server Component
5. Test: login de tenant A no muestra branding de tenant B

**Estimación:** 3 story points

---

#### Story E-15A-S05: Dark mode por usuario + toggle global

**Como** usuario, **quiero** poder usar el CRM en modo oscuro **para que** pueda trabajar cómodamente en entornos con poca luz sin forzar mi vista.

**Criterios de aceptación:**

- Toggle de dark mode accesible desde el header (ícono de luna/sol) en todo momento
- 3 opciones: Claro / Oscuro / Sistema (sigue la preferencia del OS del usuario)
- La preferencia del usuario es personal — no la del tenant. Cada usuario puede tener su propio modo independientemente del `darkModeDefault` del tenant
- Si el tenant define `darkModeDefault: 'dark'`, es el valor por defecto para usuarios nuevos — pero cada usuario puede cambiarlo
- El tema dark adapta los colores del tenant: el color `primary` del tenant se mantiene en dark mode, pero el sidebar, fondos y textos usan la paleta oscura de Nexo
- La transición entre modos usa `transition: colors 200ms ease`
- La preferencia se persiste en `localStorage` (no en BD — para evitar un request extra en cada carga)
- Sin FOUC: el modo se aplica antes del primer render via script inline en el `<head>`

**Tareas técnicas:**

1. Script inline en `app/layout.tsx` `<head>` que lee localStorage y aplica `class="dark"` al `<html>` antes del primer paint
2. Hook `useDarkMode()` que expone `{ mode, setMode, resolvedMode }` y sincroniza con localStorage
3. Componente `DarkModeToggle` en el header con 3 opciones (dropdown: Claro / Oscuro / Sistema)
4. Extensión del sistema de CSS variables de E-15A-S02 para incluir variables dark: `--color-bg-dark`, `--color-text-dark`, `--color-sidebar-bg-dark`
5. El `config.theme.darkModeDefault` del tenant se expone via `TenantContext` para inicializar el default de usuarios nuevos
6. Tests: toggle persiste en localStorage, sin FOUC al recargar, default del tenant aplicado en primer login

**Estimación:** 5 story points

---

#### Story E-15A-S06: Dominio personalizado y email con dominio propio

**Como** Owner del tenant, **quiero** que mis usuarios accedan al CRM desde mi propio dominio y que los emails del sistema se envíen desde mi dirección **para que** toda la experiencia sea 100% de mi marca.

**Criterios de aceptación:**

**Dominio personalizado (`crm.miempresa.com`):**

- En Settings → Dominio, el Owner puede ingresar su dominio personalizado
- El sistema muestra los registros DNS que debe configurar (CNAME `crm.miempresa.com → tenantslug.nexocrm.co`, más TXT de verificación)
- Botón "Verificar dominio" hace un DNS lookup para confirmar que el CNAME está configurado
- Una vez verificado, el CRM es accesible desde ambos dominios (el subdominio de Nexo y el dominio propio)
- Certificado TLS: provisioning automático via Let's Encrypt (usando Cloudflare para DNS challenge)
- Si el dominio personalizado falla (DNS eliminado), el sistema cae al subdominio de Nexo automáticamente

**Email con dominio propio (`facturas@miempresa.com`):**

- El Owner puede configurar el dominio de email saliente
- El sistema muestra los registros DNS de autenticación: SPF, DKIM, DMARC
- Botón "Verificar autenticación de email" comprueba los registros DNS
- Una vez configurado, todos los emails del tenant (notificaciones, facturas, invitaciones) se envían desde el dominio propio via SendGrid domain authentication
- Fallback a `noreply@nexocrm.co` si el dominio propio no está configurado o falla

**Tareas técnicas:**

1. Tabla `public.tenant_domains` (tenant_id, custom_domain, verification_token, verified_at, email_domain, email_verified_at)
2. Endpoint POST /settings/domain — registra el dominio y genera el token de verificación
3. Endpoint POST /settings/domain/verify — hace DNS lookup del CNAME + TXT, marca como verified
4. Integración con Cloudflare API para provisioning de TLS cert en el dominio custom
5. Integración con SendGrid Domain Authentication API para configurar email con dominio propio
6. Endpoint POST /settings/domain/email — registra el dominio de email y genera los registros DNS
7. Endpoint POST /settings/domain/email/verify — verifica SPF/DKIM/DMARC
8. Tests: flujo de verificación, fallback a dominio Nexo si DNS falla, email enviado con dominio propio

**Estimación:** 8 story points

**Total E-15A: 32 story points**

---

### E-15B: Nomenclatura y Navegación Configurable

**Objetivo:** Que cada tenant pueda renombrar las entidades del sistema, reorganizar el sidebar, activar/desactivar módulos, cambiar íconos individuales — y que esos cambios se propaguen a TODA la UI: breadcrumbs, notificaciones, emails automáticos, tooltips, empty states, botones de acción.

**Criterio de aceptación épica:** Una clínica puede llamar "Pacientes" a sus contactos y "Citas" a sus deals, y esos términos aparecen en absolutamente todos los textos del sistema. Un restaurante puede desactivar el módulo "Pipeline" y no aparece en ningún lugar de la interfaz ni en la API.

**Dependencias:** E-15A-S01 (config JSONB con `nomenclature` y `sidebarConfig`), E-02-S03 (RBAC)

---

#### Story E-15B-S01: Modelo de nomenclatura por tenant y hook universal

**Como** sistema, **quiero** un sistema de nomenclatura configurable por tenant que reemplace todos los textos hardcodeados de entidades **para que** el idioma del CRM refleje el vocabulario de cada negocio.

**Criterios de aceptación:**

- La estructura `config.nomenclature` en el JSONB del tenant:
  ```typescript
  type TenantNomenclature = {
    contact: { singular: string; plural: string } // "Paciente" / "Pacientes"
    company: { singular: string; plural: string } // "Clínica" / "Clínicas"
    deal: { singular: string; plural: string } // "Cita" / "Citas"
    activity: { singular: string; plural: string } // "Seguimiento" / "Seguimientos"
    // Facturas/Invoice NO es renombrable — término legal DIAN
  }
  ```
- El hook `useEntityName(entity: EntityKey, count?: number): string` en el frontend retorna el nombre correcto (singular si count===1, plural en otros casos)
- El hook consume el `TenantContext` — no hace fetch propio
- El `TenantContext` (React Context) provee la nomenclatura del tenant actual al cargar el `AppShell`
- La misma nomenclatura se usa en los templates de email y notificaciones como variable interpolada: `{{entity.contact.plural}}`
- Longitud máxima: 30 caracteres por término
- Valores por defecto: Contacto/Contactos, Empresa/Empresas, Deal/Deals, Actividad/Actividades

**Tareas técnicas:**

1. Actualizar `TenantContext` para exponer `nomenclature` con tipado completo
2. Implementar hook `useEntityName(entity, count?)` en `packages/shared-utils`
3. Reemplazar TODOS los strings hardcodeados de "Contactos", "Deals", "Empresas", "Actividades" en la UI por el hook — audit completo de la codebase
4. Actualizar el sistema de templates de email para interpolar las variables de nomenclatura
5. Endpoint `PATCH /api/settings/nomenclature` (RBAC: Owner/Admin)
6. Tests: cambiar "Contactos" → "Pacientes" → verificar sidebar, breadcrumb, botón de creación, empty state y texto de notificación

**Estimación:** 8 story points

---

#### Story E-15B-S02: Settings de nomenclatura — UI de configuración

**Como** Owner del tenant, **quiero** un panel en Settings para renombrar las entidades del CRM **para que** mi equipo trabaje con la terminología correcta de nuestro negocio.

**Criterios de aceptación:**

- Sección Settings → Nomenclatura con un formulario de 4 filas (una por entidad renombrable)
- Cada fila muestra: nombre de entidad original (gris, no editable), campo de singular y campo de plural
- Preview en tiempo real: al escribir en el campo, el sidebar y el breadcrumb del preview de la derecha se actualizan
- Al guardar, aparece un toast: "La nomenclatura se actualizó. Tu equipo verá los cambios al recargar la página"
- Botón "Restablecer defaults" por entidad individual (ícono de reset junto a cada campo)
- Los cambios se propagan a todos los usuarios conectados via WebSocket (invalidación del TenantContext en el cliente)

**Tareas técnicas:**

1. Página `app/(app)/settings/nomenclature/page.tsx`
2. Componente `NomenclatureEditor` con estado local + preview del sidebar
3. WebSocket event `tenant:config:updated` emitido al guardar — los clientes conectados invalidan su TenantContext cache y lo recargan
4. Tests: flujo completo de cambio + verificación de propagación WebSocket

**Estimación:** 5 story points

---

#### Story E-15B-S03: Sidebar configurable — activar, desactivar y reordenar módulos

**Como** Owner del tenant, **quiero** controlar qué módulos aparecen en el sidebar y en qué orden **para que** mi equipo vea únicamente lo relevante para su trabajo.

**Criterios de aceptación:**

- Settings → Navegación muestra la lista de todos los módulos con:
  - Toggle de activar/desactivar (switch)
  - Drag & drop para reordenar (usando `@dnd-kit/sortable`)
  - Nombre del módulo (editable, máx 20 caracteres)
  - Preview del ícono correspondiente al icon pack activo del tenant
- Módulos que **no** se pueden desactivar: Dashboard, Configuración
- Los módulos desactivados no aparecen en el sidebar de ningún usuario del tenant
- Si un usuario intenta acceder directamente por URL a un módulo desactivado, recibe 403 con mensaje "Este módulo no está habilitado para tu organización"
- Los cambios se propagan a todos los usuarios conectados via WebSocket (sin re-login)
- En mobile, el sidebar se convierte en bottom navigation bar con máximo 5 módulos; el resto va al menú "Más"

**Tareas técnicas:**

1. Estructura `config.sidebarConfig.modules: { key, label, icon, enabled, order }[]` en el JSONB del tenant
2. Componente `SidebarConfigEditor` con `@dnd-kit/sortable`
3. Guard `ModuleEnabledGuard` en NestJS — verifica `tenant.config.modules[moduleKey] === true` antes de procesar requests del módulo
4. El `AppShell` construye el sidebar dinámicamente desde `useTenantConfig().sidebarConfig`
5. WebSocket event `tenant:sidebar:updated` — todos los clientes conectados refrescan el sidebar sin recargar
6. Tests: módulo desactivado → 403 en API endpoint + no aparece en sidebar + aparece en Settings como toggle off

**Estimación:** 8 story points

---

#### Story E-15B-S04: Iconografía custom — packs de íconos y uploads SVG por módulo

**Como** Owner del tenant, **quiero** que los íconos del CRM tengan el estilo visual de mi marca, o poder subir íconos propios **para que** la experiencia sea completamente coherente con nuestra identidad.

**Criterios de aceptación:**

- 4 packs de íconos globales disponibles: Outline (default), Filled, Duotone, Rounded
- Todos los packs están basados en el mismo set de íconos (mismos nombres, distinto estilo visual), distribuidos como SVG sprites por pack
- El pack activo se selecciona en Settings → Apariencia → Íconos
- El ícono activo para cada módulo del sidebar es configurable individualmente: el usuario puede mantener el ícono por defecto del pack, o **subir un SVG custom para ese módulo específico**
- Los SVG custom se validan: máx 24×24px viewBox, sin scripts embebidos (sanitización con DOMPurify server-side), máx 15KB
- Preview de los 4 packs con 12 íconos representativos antes de aplicar
- Presets de íconos por industria (ej: Salud → estetoscopio para Contactos, calendario para Actividades)
- Los íconos custom subidos por el tenant se almacenan en Cloudflare R2 y se sirven con cache CDN

**Tareas técnicas:**

1. Generar 4 SVG sprites (outline, filled, duotone, rounded) a partir de un set base (Heroicons o Lucide como base)
2. Componente `<NexoIcon name="contacts" />` — lee el pack activo del TenantContext y renderiza el sprite correcto; si hay custom SVG para ese ícono, lo usa en su lugar
3. Estructura `config.sidebarConfig.modules[].customIconUrl` para íconos SVG custom por módulo
4. Endpoint `POST /api/settings/icons/upload` con validación MIME + sanitización DOMPurify server-side + upload a R2
5. Seed de presets de íconos por industria (8 industrias × íconos por módulo)
6. Tests: sanitización de SVG malicioso rechazado, carga del pack correcto por tenant, ícono custom override funciona, fallback al pack si el custom es inválido

**Estimación:** 8 story points

---

#### Story E-15B-S05: Permisos a nivel de campo (field-level RBAC)

**Como** Owner del negocio, **quiero** controlar qué campos puede ver o editar cada rol **para que** información sensible como comisiones, costos o márgenes no sea visible para todos los usuarios.

**Criterios de aceptación:**

- En Settings → Campos → [entidad] → [campo], el Owner puede configurar:
  - **Visibilidad**: qué roles pueden VER el campo (opciones: todos, Owner+Admin, Manager+, Sales Rep+)
  - **Edición**: qué roles pueden EDITAR el campo (opciones: todos, Owner+Admin, Manager+, no editable)
- Los campos estándar del sistema también son configurables (ej: "Valor del deal" visible solo para Manager+)
- Un campo marcado como "no visible" para un rol:
  - No aparece en el formulario de creación/edición para ese rol
  - No aparece en la vista de detalle para ese rol
  - No se devuelve en la respuesta de la API para ese rol
- Los campos custom heredan la configuración de visibilidad definida en E-15C-S01, pero se puede sobreescribir aquí
- La configuración de field-level RBAC se almacena en `config.fieldPermissions JSONB` en el tenant

**Tareas técnicas:**

1. Estructura `config.fieldPermissions: { [entityType]: { [fieldKey]: { visibility: RoleLevel, editable: RoleLevel } } }` en el JSONB del tenant
2. Interceptor `FieldPermissionsInterceptor` en NestJS — filtra los campos de la respuesta según el rol del usuario autenticado
3. Hook `useFieldPermissions(entity, field)` en el frontend — devuelve `{ canView, canEdit }` para el usuario actual
4. Modificar todos los formularios para renderizar/ocultar campos según `useFieldPermissions`
5. Endpoint `PATCH /api/settings/field-permissions` (RBAC: Owner only)
6. Tests: Sales Rep no ve campo "Comisión", Manager lo ve, Sales Rep no puede editar "Valor del deal", respuesta de API filtrada por rol

**Estimación:** 8 story points

**Total E-15B: 37 story points**

---

### E-15C: Campos Custom, Vistas y Formularios

**Objetivo:** Que cada tenant pueda extender el modelo de datos del CRM con sus propios campos, definir qué vistas usa para ver su información (kanban, tabla, lista, mapa), y crear formularios públicos que alimenten el CRM automáticamente.

**Criterio de aceptación épica:** Una inmobiliaria puede agregar el campo "Tipo de inmueble" (select) y "Área en m²" (número) a sus contactos, crear una vista de mapa de todos sus inmuebles, y publicar un formulario web que cuando alguien lo llena, crea un contacto nuevo con esos campos custom ya poblados.

**Dependencias:** E-15A-S01 (config JSONB), E-04 (modelo de contactos), E-15B-S01 (nomenclatura)

---

#### Story E-15C-S01: Motor de campos custom — definición y almacenamiento

**Como** Owner del tenant, **quiero** definir campos adicionales para contactos, empresas y deals **para que** el CRM almacene la información específica de mi negocio.

**Criterios de aceptación:**

- Tipos de campo soportados:
  - `text` — texto libre (máx 255 caracteres)
  - `textarea` — texto largo (máx 5.000 caracteres)
  - `number` — número decimal o entero, con mínimo/máximo opcional
  - `currency` — monto usando la moneda del tenant (de `config.i18n.currency`)
  - `date` — fecha (usando el formato de `config.i18n.dateFormat`)
  - `datetime` — fecha y hora con timezone de `config.i18n.timezone`
  - `select` — lista desplegable con opciones definidas por el tenant
  - `multiselect` — selección múltiple de opciones
  - `boolean` — sí/no, checkbox
  - `url` — URL con validación de formato
  - `phone` — teléfono con validación configurable por país del tenant
  - `email` — email con validación de formato
  - `file` — archivo adjunto (PDF/imagen, máx 10MB, almacenado en R2)
  - `relation` — relación a otra entidad del tenant (contacto, empresa, deal, producto)
  - `formula` — campo calculado en base a otros campos (ej: `{precio} * {cantidad}`) — read-only
  - `geolocation` — latitud + longitud con selector de mapa o dirección texto (para negocios con equipos de campo)
- Cada entidad puede tener hasta 50 campos custom (límite ajustable por plan)
- Los campos custom se almacenan en la columna `custom_fields JSONB` de la tabla correspondiente
- La definición de los campos (schema) se almacena en `config.customFields JSONB` en el tenant
- Los campos custom se pueden marcar como: requeridos, únicos, con valor por defecto
- Los campos se pueden reordenar (drag & drop) en el formulario de creación/edición
- Al eliminar un campo custom, los datos históricos se preservan en el JSONB pero el campo deja de mostrarse

**Tareas técnicas:**

1. Estructura `config.customFields: { contacts: FieldDef[], companies: FieldDef[], deals: FieldDef[] }` en el JSONB del tenant
2. Tipo `FieldDef` con todas las propiedades según los tipos de campo (incluyendo `geolocation`)
3. Componente genérico `<CustomFieldRenderer field={FieldDef} value={any} onChange={fn} />` — renderiza el input correcto según el tipo
4. Para `geolocation`: componente `<GeoLocationPicker>` con búsqueda de dirección (Nominatim/OpenStreetMap) y mini-mapa Leaflet para confirmar el pin
5. Validación server-side de campos custom en los endpoints de creación/edición de entidades
6. Index GIN en `custom_fields JSONB` para búsqueda por campos custom
7. Endpoint `GET|POST|PATCH|DELETE /api/settings/custom-fields/:entity` (RBAC: Owner/Admin)
8. Tests: todos los tipos de campo, validación requerido/único, campo geolocation guarda lat/lng, preservación de datos al eliminar campo

**Estimación:** 13 story points

---

#### Story E-15C-S02: UI de gestión de campos custom

**Como** Owner del tenant, **quiero** una interfaz para crear y gestionar mis campos custom **para que** pueda configurar el modelo de datos sin necesidad de soporte técnico.

**Criterios de aceptación:**

- Settings → Campos Custom con tabs por entidad (Contactos | Empresas | Deals)
- Lista de campos custom del tenant con: nombre, tipo (ícono), requerido (badge), orden
- Botón "Agregar campo" abre un drawer lateral con el formulario de creación
- Drag & drop para reordenar los campos (el orden se respeta en los formularios de creación/edición)
- Al hacer click en un campo existente, se abre el drawer en modo edición
- Eliminar campo muestra modal de confirmación con advertencia: "Los datos históricos se conservarán pero el campo no se mostrará en nuevos registros"
- Contador de campos usados vs límite del plan (ej: "12 / 50 campos")

**Tareas técnicas:**

1. Página `app/(app)/settings/custom-fields/page.tsx`
2. Componente `CustomFieldEditor` (drawer) con formulario dinámico según el tipo de campo seleccionado
3. Componente `FieldTypeSelector` con íconos y descripción de cada tipo
4. Integración de `@dnd-kit/sortable` para reordenamiento
5. Tests: flujo completo de creación, edición, reorden y eliminación

**Estimación:** 5 story points

---

#### Story E-15C-S03: Campos custom en formularios de creación y detalle de entidades

**Como** usuario del tenant, **quiero** ver y editar los campos custom de mi organización en los formularios de contactos, empresas y deals **para que** pueda capturar la información específica de mi negocio.

**Criterios de aceptación:**

- Los campos custom aparecen en una sección "Información adicional" en el formulario de creación de la entidad, debajo de los campos estándar
- Los campos custom requeridos bloquean el guardado si están vacíos (validación client-side + server-side)
- En la vista de detalle del registro, los campos custom aparecen en una card "Información adicional" con edición inline
- Las búsquedas de contactos/empresas/deals incluyen los campos custom de tipo `text`, `select` y `email` en el full-text search
- Los campos custom de tipo `relation` muestran un selector de búsqueda (igual que el selector de contacto en un deal)
- Los campos custom de tipo `file` permiten drag & drop del archivo directamente en el formulario
- Los campos custom de tipo `formula` se calculan en tiempo real al cambiar los campos de los que dependen
- Los campos custom de tipo `geolocation` muestran un mini-mapa con el pin en la vista de detalle

**Tareas técnicas:**

1. Modificar `ContactForm`, `CompanyForm`, `DealForm` para incluir el renderizador de campos custom
2. Modificar los endpoints de creación/edición de cada entidad para procesar y validar `custom_fields`
3. Actualizar el índice de búsqueda full-text para incluir campos custom indexables
4. Implementar motor de fórmulas básicas (evaluador de expresiones con los campos de la entidad como variables)
5. Tests: campos requeridos, búsqueda en campos custom, evaluación de fórmulas, geolocation muestra mapa

**Estimación:** 8 story points

---

#### Story E-15C-S04: Auditoría de cambios de campos custom por registro

**Como** Manager, **quiero** ver quién cambió el valor de un campo en un contacto o deal **para que** pueda auditar cambios en información sensible como precios, estados o datos de contacto.

**Criterios de aceptación:**

- En la vista de detalle de contacto, empresa o deal, hay una sección "Historial de cambios" (collapsable)
- El historial muestra: campo modificado, valor anterior, valor nuevo, usuario que hizo el cambio, fecha/hora
- Los campos custom y los campos estándar se registran igual
- Solo se auditan las mutaciones (creación y actualización) — no las lecturas
- El historial usa la tabla `audit_log` existente del schema del tenant
- Se puede filtrar por campo específico (ej: "mostrar solo cambios al campo Valor del Deal")
- Los campos de tipo `file` muestran el nombre del archivo (no la URL) en el historial

**Tareas técnicas:**

1. `FieldAuditService.logChange(entityType, entityId, userId, changes: FieldChange[])` — compara el objeto anterior con el nuevo y registra cada campo modificado en `audit_log`
2. Middleware/interceptor que captura el estado anterior antes de cada PATCH y el nuevo estado después, y llama a `FieldAuditService`
3. Endpoint GET /[entity]/:id/field-history?field= — retorna el historial de cambios del registro desde audit_log
4. Componente `FieldHistoryPanel` (collapsable) en la vista de detalle
5. Tests: cambio de campo registrado correctamente, valor anterior y nuevo correctos, filtro por campo, archivos muestran nombre

**Estimación:** 5 story points

---

#### Story E-15C-S05: Vistas configurables — lista, tabla, kanban, mapa

**Como** usuario del tenant, **quiero** elegir cómo ver mis contactos y deals **para que** pueda trabajar de la forma más eficiente según el contexto.

**Criterios de aceptación:**

- Para Contactos: vistas disponibles — Lista (cards), Tabla (columnas configurables), Mapa (pin en municipio de Colombia)
- Para Deals: vistas disponibles — Kanban (existente en MVP), Lista, Tabla, Forecast (barras de cierre estimado por mes)
- El tenant puede elegir qué vistas están disponibles para su equipo (Settings → Vistas)
- Cada usuario recuerda su última vista seleccionada por módulo (persistida en localStorage)
- En la vista Tabla, las columnas son configurables: agregar/quitar campos (incluyendo custom), reordenar y ajustar ancho
- La configuración de columnas de la tabla se persiste por usuario (no por tenant — es personal)
- La vista Mapa: pines en el mapa de Colombia (o coordenadas del campo `geolocation` si el tenant lo usa) agrupados por municipio. Usa Leaflet.js con tiles de OpenStreetMap
- La vista Mapa soporta campos custom de tipo `geolocation` — si el contacto tiene coordenadas exactas, el pin usa esas coordenadas en vez del centroide del municipio

**Tareas técnicas:**

1. Componente `ViewSelector` (toggle de íconos) en el header de cada módulo
2. Vista `TableView` genérica con columnas configurables (TanStack Table)
3. Vista `MapView` con Leaflet.js — geocodificación de municipios desde `shared-utils/colombia-geo.ts`; pines exactos para campos geolocation
4. Vista `ForecastView` para Deals — Chart.js con barras por mes
5. Endpoint `PATCH /api/users/preferences/views` — guarda configuración de columnas por usuario
6. Tests: switch entre vistas, persistencia de columnas, mapa con múltiples pines, pin exacto vs centroide

**Estimación:** 13 story points

---

#### Story E-15C-S06: Nexo Forms — formularios públicos que alimentan el CRM

**Como** Owner del tenant, **quiero** crear formularios públicos con un constructor drag & drop **para que** los leads que los llenan entren automáticamente al CRM como contactos.

**Criterios de aceptación:**

- Constructor drag & drop de formularios con los mismos tipos de campo de los campos custom
- El formulario puede incluir: campos estándar del CRM (nombre, email, teléfono) + campos custom del tenant
- Lógica condicional: mostrar/ocultar campos según el valor de otro campo
- Cada formulario tiene una URL pública: `{slug}.nexocrm.co/forms/{form-slug}`
- El formulario puede tener dominio personalizado del tenant si está configurado (E-15A-S06)
- Al enviarse, crea un contacto nuevo en el CRM (o actualiza uno existente si el email ya existe)
- Los campos del formulario se mapean a campos del contacto (mapeo configurable en el builder)
- El formulario puede asignar automáticamente el contacto creado a un vendedor (round-robin o fijo)
- El formulario puede agregar automáticamente el contacto a un pipeline
- Diseño del formulario branded: usa los colores y logo del tenant automáticamente (CSS variables de E-15A-S02)
- El Owner ve estadísticas básicas del formulario: vistas, envíos, tasa de conversión

**Tareas técnicas:**

1. Tabla `tenant_{slug}.forms` con: id, name, slug, fields JSONB, settings JSONB, active boolean
2. Tabla `tenant_{slug}.form_submissions` con: id, form_id, data JSONB, contact_id (FK), ip, created_at
3. Constructor drag & drop en Settings → Formularios (componente `FormBuilder`)
4. Motor de lógica condicional client-side en el formulario público
5. Endpoint público `POST /forms/{form-slug}/submit` — sin auth, con rate limiting por IP (máx 5 envíos/hora por IP)
6. Lógica "find or create" contact al recibir un envío
7. Página pública `app/forms/[tenant-slug]/[form-slug]/page.tsx` — Server Component + branding del tenant via CSS variables
8. Tests: submit crea contacto, submit con email existente actualiza contacto, rate limiting, lógica condicional

**Estimación:** 13 story points

**Total E-15C: 57 story points**

---

### E-15D: Dashboard Configurable y Reportes Custom

**Objetivo:** Que cada tenant pueda armar su propio dashboard con widgets drag & drop y crear reportes a medida con las métricas que importan para su negocio, incluyendo sus campos custom. Los reportes se pueden programar para envío automático.

**Criterio de aceptación épica:** El dueño de una clínica puede tener un dashboard con: "Pacientes nuevos esta semana", "Citas pendientes hoy" y "Ingresos por médico" — métricas personalizadas usando su propia nomenclatura y campos custom. Además, recibe ese mismo reporte automáticamente cada lunes por email.

**Dependencias:** E-13 (dashboard base), E-15B-S01 (nomenclatura), E-15C-S01 (campos custom)

---

#### Story E-15D-S01: Motor de widgets — definición y registro

**Como** sistema, **quiero** un motor de widgets registrables que pueda combinar datos del CRM con la configuración del tenant **para que** el dashboard sea completamente extensible.

**Criterios de aceptación:**

- Catálogo de widgets disponibles:
  - `metric-card` — un número con label, tendencia y período
  - `pipeline-summary` — tabla/barras de deals por stage
  - `activity-list` — lista de actividades pendientes
  - `overdue-invoices` — facturas vencidas con botón de acción
  - `revenue-chart` — gráfica de ingresos por período (línea o barras)
  - `contacts-by-status` — donut chart de contactos por estado
  - `deals-forecast` — forecast de cierre por mes
  - `leaderboard` — ranking de vendedores por deals cerrados o valor facturado
  - `custom-metric` — el tenant define la query con filtros + campo + agregación
- Cada widget tiene: id, type, title (editable), size (1×1, 2×1, 2×2), configuración específica por tipo
- Los widgets se registran en las preferencias del usuario (cada usuario tiene su propio layout)
- La configuración del dashboard es personal, no compartida entre usuarios

**Tareas técnicas:**

1. Estructura `dashboardLayout: { widgets: WidgetConfig[] }` en las preferencias del usuario (tabla `tenant_{slug}.user_preferences`)
2. Tipo `WidgetConfig` con `id`, `type`, `position: {x, y, w, h}`, `settings JSONB`
3. Servicio `DashboardDataService` que resuelve los datos de cada widget con la nomenclatura del tenant
4. Endpoint `GET /api/dashboard/widgets-data` — recibe la lista de widget types y devuelve todos los datos en una sola query batched
5. Cache por usuario en Redis (TTL 5 minutos por widget, invalidado cuando hay cambios relevantes)
6. Tests: datos del widget aislados por tenant, cache correcta, invalidación de cache

**Estimación:** 8 story points

---

#### Story E-15D-S02: Dashboard drag & drop con widget picker

**Como** usuario del tenant, **quiero** personalizar mi dashboard con drag & drop **para que** las métricas que más importan estén siempre visibles al entrar al CRM.

**Criterios de aceptación:**

- Botón "Personalizar dashboard" activa el modo edición
- En modo edición: los widgets muestran una barra de drag y un botón de eliminar
- Drag & drop de widgets para reposicionar (grid de 4 columnas, con snapping a la grilla)
- Botón "Agregar widget" abre un panel lateral con el catálogo de widgets disponibles
- Al agregar un widget configurable, se abre un mini-formulario de configuración antes de añadirlo
- Botón "Guardar" confirma; botón "Cancelar" descarta sin persistir
- Botón "Restaurar dashboard por defecto" con confirmación
- El dashboard mínimo tiene 2 widgets fijos no removibles: `metric-card` de Por cobrar y `activity-list`

**Tareas técnicas:**

1. Librería `react-grid-layout` para el grid drag & drop con snapping
2. Componente `WidgetPicker` (drawer) con catálogo y preview
3. Componente `WidgetConfigForm` — formulario específico por tipo de widget
4. Endpoint `PUT /api/users/preferences/dashboard-layout`
5. Modo edición: estado local que no persiste hasta hacer "Guardar"
6. Tests: drag & drop persiste posiciones, widgets fijos no se pueden eliminar

**Estimación:** 8 story points

---

#### Story E-15D-S03: Constructor de reportes custom

**Como** Owner o Manager del tenant, **quiero** crear reportes personalizados con mis propias métricas **para que** pueda analizar mi negocio desde la perspectiva correcta para mi industria.

**Criterios de aceptación:**

- Sección Reports con tab "Mis reportes" (custom) + tab "Reportes estándar" (pre-construidos)
- Constructor de reportes low-code con 5 pasos:
  1. Fuente de datos (Contactos, Empresas, Deals, Facturas, Pagos, Actividades)
  2. Filtros (campo + operador + valor — campos estándar + campos custom)
  3. Agrupación (agrupar por vendedor, stage, mes, estado, campo custom select)
  4. Métricas (contar, sumar, promediar, máximo, mínimo)
  5. Visualización (tabla, barra, línea, donut, número único)
- Preview del reporte en tiempo real al configurar cada paso
- El reporte usa la nomenclatura del tenant
- Los reportes custom se pueden guardar, editar y eliminar
- Los reportes guardados se pueden agregar al dashboard como widget tipo `custom-report`
- Exportar reporte a CSV o PDF con logo y nombre del tenant en el encabezado

**Tareas técnicas:**

1. Tabla `tenant_{slug}.saved_reports` con: id, name, config JSONB, created_by, created_at
2. Servicio `ReportQueryBuilder` — construye SQL de forma segura (prepared statements + whitelist de campos)
3. Endpoint `POST /api/reports/preview` — ejecuta la query y devuelve primeros 100 resultados
4. Endpoint `GET|POST|PATCH|DELETE /api/reports` (RBAC: Owner/Manager)
5. Generación de PDF con logo del tenant (@react-pdf/renderer)
6. Exportación CSV
7. Tests: query builder con campos custom, whitelist de campos (nunca campos de otro tenant), export CSV y PDF

**Estimación:** 13 story points

---

#### Story E-15D-S04: Reportes programados y compartidos

**Como** Owner o Manager, **quiero** programar el envío automático de mis reportes y compartirlos con mi equipo **para que** las métricas clave lleguen proactivamente sin que nadie tenga que acordarse de consultarlas.

**Criterios de aceptación:**

**Reportes programados:**

- Al guardar un reporte, el usuario puede activar un schedule: frecuencia (diaria, semanal, mensual) + día y hora de envío
- El reporte se envía por email a los destinatarios configurados (usuarios del mismo tenant o emails externos)
- El email incluye el reporte como imagen inline (chart) + tabla de datos + link al reporte en vivo en Nexo
- El usuario puede ver la lista de reportes programados activos y pausarlos o eliminarlos
- El historial de envíos muestra los últimos 10 envíos con estado (enviado / fallido)

**Reportes compartidos:**

- El Owner/Manager puede compartir un reporte guardado con otros usuarios del tenant (por rol o usuario específico)
- Los usuarios con acceso al reporte compartido lo ven en su tab "Reportes compartidos"
- Los reportes compartidos son de solo lectura para quienes no son el creador
- El creador puede revocar el acceso en cualquier momento

**Tareas técnicas:**

1. Columnas adicionales en `saved_reports`: `schedule JSONB` (frecuencia, día, hora, recipients), `shared_with JSONB` (lista de userId o roles)
2. Job BullMQ cron `scheduled-report` — se registra dinámicamente al activar el schedule de un reporte
3. Servicio de envío de reporte por email: genera el chart como imagen (puppeteer headless screenshot del widget) + tabla CSV + PDF
4. Endpoint `PATCH /api/reports/:id/schedule` — activa/pausa el schedule
5. Endpoint `PATCH /api/reports/:id/share` — configura quiénes tienen acceso (RBAC: solo el creador)
6. Endpoint `GET /api/reports/shared` — reportes compartidos con el usuario autenticado
7. Tests: job cron se registra al activar schedule, email enviado con el reporte correcto, usuario sin acceso no ve el reporte compartido

**Estimación:** 8 story points

**Total E-15D: 37 story points**

---

## Estimación Total Personalización

| Épica                                                | Story Points | Semanas estimadas |
| ---------------------------------------------------- | ------------ | ----------------- |
| E-15A: Theme Engine, Branding, Dark Mode, Dominio    | 32 SP        | ~2.5 semanas      |
| E-15B: Nomenclatura, Navegación, Íconos, Field RBAC  | 37 SP        | ~2.5 semanas      |
| E-15C: Campos Custom, Vistas, Formularios, Auditoría | 57 SP        | ~4 semanas        |
| E-15D: Dashboard, Reportes, Programación, Sharing    | 37 SP        | ~2.5 semanas      |
| **TOTAL PERSONALIZACIÓN**                            | **163 SP**   | **~11.5 semanas** |

> **Orden de implementación obligatorio:** E-15A → E-15B → E-15C → E-15D.
>
> **Nota crítica:** El campo `config JSONB` con la estructura completa debe crearse en E-01-S01. Esto evita una migración costosa de todos los tenants existentes cuando se implementen estas épicas. Si E-01-S01 ya fue implementado sin este campo, la primera tarea de E-15A-S01 es ejecutar la migración.

---

## Backlog Post-MVP

| Epic ID | Nombre                                                | Prioridad | Depende de                |
| ------- | ----------------------------------------------------- | --------- | ------------------------- |
| E-16    | WhatsApp bidireccional + Inbox completo               | P1        | E-10                      |
| E-17    | Bot IA en WhatsApp                                    | P1        | E-16, E-20                |
| E-18    | Nexo Flow — Motor de automatización visual            | P1        | E-04, E-06, E-08          |
| E-19    | Workflows pre-armados (5 templates por industria)     | P1        | E-18                      |
| E-20    | Chat Asistente IA con RAG (contexto del tenant)       | P1        | E-04, E-15C               |
| E-21    | Lead Scoring automático con IA                        | P2        | E-20                      |
| E-22    | Control de inventario completo                        | P1        | E-11                      |
| E-23    | MFA con TOTP                                          | P2        | E-02                      |
| E-24    | SSO / SAML para tenants enterprise                    | P2        | E-02                      |
| E-25    | Múltiples pipelines                                   | P2        | E-06                      |
| E-26    | API pública + webhooks outgoing                       | P2        | E-01, E-15C               |
| E-27    | Integraciones Meta (Instagram/Facebook)               | P2        | E-16                      |
| E-28    | Apple Pay via Wompi                                   | P2        | E-09                      |
| E-29    | Landing page y marketing site                         | P1        | —                         |
| E-30    | Portal del cliente (ver cotizaciones/facturas/pagar)  | P2        | E-08, E-15A               |
| E-31    | Geolocalización de equipo de campo + rutas            | P3        | E-15C (campo geolocation) |
| E-32    | NPS y encuestas automáticas post-venta                | P2        | E-15C (Nexo Forms)        |
| E-33    | Marketplace de integraciones (Shopify, Siigo, Alegra) | P3        | E-26                      |
| E-34    | White-label / modo reseller                           | P2        | E-15A, E-15B              |
| E-35    | Email marketing con editor drag & drop                | P2        | E-04                      |

---

## Resumen Ejecutivo del Roadmap

```
SEMANAS 1-11:   MVP (133 SP)         — La base funcional del CRM colombiano
                   ↓
SEMANAS 12-14:  E-14 Import (21 SP)  — Eliminar la barrera de migración
                   ↓
SEMANAS 15-26:  Personalización (163 SP) — El diferenciador de mercado global
                   ↓
SEMANAS 27+:    Post-MVP escalado    — WhatsApp avanzado, IA, automatización, marketplace
```

| Fase                                           | Story Points | Duración estimada |
| ---------------------------------------------- | ------------ | ----------------- |
| MVP (E-01 a E-13)                              | 133 SP       | ~11 semanas       |
| Import & migración (E-14)                      | 21 SP        | ~1.5 semanas      |
| Personalización profunda (E-15A–D)             | 163 SP       | ~11.5 semanas     |
| **TOTAL hasta lanzamiento comercial completo** | **317 SP**   | **~24 semanas**   |

**Nota:** Velocidad asumida de 15-20 SP/semana para un dev solo. Con un equipo de 2 devs, las fases de personalización se pueden paralelizar parcialmente.

---

_Documento v3.0 — NexoCRM | BMad Enterprise Track_
_Generado por: PM John + Architect Winston | Actualizado: Marzo 2026_

**Cambios v3.0:**

- E-02: Agregada story E-02-S04 (Audit Log UI) — 5 SP
- E-03: Agregada story E-03-S02 (Configuración General del negocio) — 5 SP. Búsqueda full-text desacoplada del idioma hardcodeado
- E-04 a E-13: Tareas técnicas completadas en las 13 stories que las tenían pendientes
- E-04-S02: Índice de búsqueda full-text configurable por idioma del tenant (no hardcodeado a 'spanish')
- E-14: Import masivo y migración detallado completamente (21 SP)
- E-15A: Agregadas stories E-15A-S05 (Dark mode) y E-15A-S06 (Dominio personalizado + email con dominio propio)
- E-15B: Agregada story E-15B-S05 (Permisos a nivel de campo / field-level RBAC)
- E-15C: Agregado tipo de campo `geolocation` en E-15C-S01. Agregada story E-15C-S04 (Auditoría de cambios de campos custom). Vista Mapa soporta coordenadas exactas de campo geolocation
- E-15D: Agregada story E-15D-S04 (Reportes programados y compartidos)
- Backlog: Agregadas E-24 (SSO/SAML), E-34 (White-label/reseller), E-35 (Email marketing)
- Estimaciones totales actualizadas: MVP 133 SP, Personalización 163 SP, Total 317 SP
