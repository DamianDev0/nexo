# NexoCRM — Épicas y Stories (MVP + Personalización)

**BMad Enterprise Track | Agente: PM John + Architect Winston**

> Versión: 2.0 | Marzo 2026
> Alcance: MVP (12 semanas) — Épicas E-01 a E-13
> Personalización profunda: E-15A, E-15B, E-15C, E-15D (Post-MVP P1 — corazón del producto)
> Backlog restante: E-14, E-16 a E-28

---

## Índice

- [Épicas del MVP](#épicas-del-mvp)
  - [E-01: Fundación Multitenant](#e-01-fundación-multitenant)
  - [E-02: Autenticación y Autorización](#e-02-autenticación-y-autorización)
  - [E-03: Onboarding Wizard](#e-03-onboarding-wizard)
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
- [Épicas de Personalización Profunda](#épicas-de-personalización-profunda-post-mvp-p1)
  - [E-15A: Theme Engine y Branding](#e-15a-theme-engine-y-branding-por-tenant)
  - [E-15B: Nomenclatura y Navegación Configurable](#e-15b-nomenclatura-y-navegación-configurable)
  - [E-15C: Campos Custom, Vistas y Formularios](#e-15c-campos-custom-vistas-y-formularios)
  - [E-15D: Dashboard Configurable y Reportes](#e-15d-dashboard-configurable-y-reportes-custom)
- [Estimación Total Personalización](#estimación-total-personalización)
- [Backlog Post-MVP](#backlog-post-mvp)

---

## Épicas del MVP

### E-01: Fundación Multitenant

**Objetivo:** Configurar el sistema base de multitenancy con schema-per-tenant en PostgreSQL, resolución de subdominio y provisioning de nuevos tenants.

**Criterio de aceptación épica:** Un nuevo tenant puede registrarse, se crea su schema aislado, y sus datos nunca son visibles desde otro tenant.

> **Nota v2.0:** El modelo `public.tenants` debe incluir desde el día 1 el campo `config JSONB` con la subestructura `theme`, `nomenclature`, `sidebarConfig` y `modules` — aunque vacíos, para evitar migraciones costosas cuando se implemente E-15A/B/C/D.

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
    "theme": { "colors": {}, "typography": {}, "branding": {}, "iconPack": "outline", "darkModeDefault": "system" },
    "nomenclature": { "contact": { "singular": "Contacto", "plural": "Contactos" }, "company": { "singular": "Empresa", "plural": "Empresas" }, "deal": { "singular": "Deal", "plural": "Deals" }, "activity": { "singular": "Actividad", "plural": "Actividades" } },
    "sidebarConfig": { "modules": [] },
    "modules": { "contacts": true, "companies": true, "deals": true, "invoices": true, "payments": true, "whatsapp": true, "products": true, "reports": true }
  }
  ```
- Test: un request autenticado como tenant A que intenta acceder a datos de tenant B recibe 404

**Tareas técnicas:**
1. Crear tabla `public.tenants` con campo `config JSONB` con el schema tipado arriba
2. Crear tabla `public.plans` con seed de planes
3. Implementar `TenantProvisioningService` con la función `createTenantSchema(slug)`
4. Crear el SQL de todas las tablas del tenant como template
5. Implementar `TenantMiddleware` (subdominio → lookup en public.tenants → inyectar en request)
6. Cache del tenant lookup en Redis (TTL 5 minutos), incluyendo el campo `config`
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

**Objetivo:** Sistema completo de autenticación con Google OAuth, JWT RS256, refresh tokens y RBAC granular.

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

### E-03: Onboarding Wizard

**Objetivo:** Flujo de registro de 4 pasos que lleva a un nuevo tenant desde cero hasta el dashboard con su primer contacto en menos de 5 minutos.

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
- En el paso 2, al seleccionar el sector, se aplica automáticamente un **preset de nomenclatura e íconos** para esa industria (ej: "Salud" → contactos = Pacientes, deals = Citas; "Educación" → contactos = Alumnos, deals = Matrículas). Esto pre-llena el campo `nomenclature` y `iconPack` en `tenant.config`
- El preset de sector queda guardado pero es editable más adelante en Settings → Apariencia

**Tareas técnicas:**
1. Página /onboarding con stepper y estado persistido en localStorage
2. Selector de sector con íconos (8 sectores: Salud, Educación, Inmobiliaria, Comercio, Servicios, Restaurante, Tecnología, Construcción)
3. Componente InputNIT con validación de DV en tiempo real
4. Seed de presets por sector: pipeline stages + nomenclatura + icon pack por defecto
5. Al completar el wizard, `TenantProvisioningService.applyIndustryCPreset(tenantId, sector)` guarda el preset en `tenant.config`
6. Empty state del dashboard con 4 CTAs contextuales post-onboarding

**Estimación:** 8 story points

---

### E-04: Gestión de Contactos

**Objetivo:** CRUD completo de contactos con campos Colombia-específicos, búsqueda full-text, deduplicación y timeline.

---

#### Story E-04-S01: CRUD de contactos con campos colombianos

**Criterios de aceptación:**
- Crear contacto con: nombre, apellido, email, teléfono, WhatsApp, tipo de documento (CC/NIT/CE/PP/TI), número de documento, ciudad/municipio, departamento, estado, fuente, tags, vendedor asignado
- El selector de municipio tiene los 1.122 municipios de Colombia (searchable)
- La deduplicación detecta en tiempo real si ya existe un contacto con el mismo email, teléfono o número de documento y muestra sugerencia
- El estado del contacto es: Nuevo, En contacto, Calificado, Cliente, Inactivo, Perdido
- Soft delete (is_active = false) — el contacto no aparece en listas pero sus datos persisten
- Vista de lista y vista de tabla con columnas configurables

**Estimación:** 8 story points

---

#### Story E-04-S02: Búsqueda full-text de contactos

**Criterios de aceptación:**
- Búsqueda en: nombre, apellido, email, teléfono, nombre de empresa, número de documento, tags
- Resultados en menos de 300ms con hasta 10.000 contactos
- Búsqueda parcial funciona: "carlos" encuentra "Carlos Martínez"
- El buscador es el mismo campo en el header — no abre una página nueva

**Tareas técnicas:**
1. Índice GIN con tsvector en español en la tabla contacts
2. Endpoint GET /contacts?q=term usando to_tsquery('spanish', term)
3. Debounce de 300ms en el frontend antes de disparar la query

**Estimación:** 3 story points

---

#### Story E-04-S03: Timeline de contacto

**Criterios de aceptación:**
- El timeline muestra todos los eventos del contacto en orden cronológico inverso
- Tipos de eventos en el timeline: actividad, nota, mensaje WhatsApp, factura emitida, pago recibido, deal creado/movido, cambio de estado
- El timeline se actualiza en tiempo real (WebSocket) cuando hay eventos nuevos
- El usuario puede agregar notas directamente desde el timeline

**Estimación:** 5 story points

---

### E-05: Gestión de Empresas

**Objetivo:** CRUD de empresas con validación de NIT colombiano e información fiscal para DIAN.

---

#### Story E-05-S01: CRUD de empresas con NIT colombiano

**Criterios de aceptación:**
- Crear empresa con: nombre, NIT (con validación DV automática), régimen tributario, tamaño de empresa, sector CIIU, website, teléfono, dirección
- El régimen tributario es: Responsable de IVA, No responsable, Gran contribuyente, Régimen simple de tributación
- Relación 1:N empresa → contactos (asignar contactos existentes a la empresa)
- Vista de empresa muestra: datos fiscales, todos sus contactos, deals activos, facturas emitidas, total facturado, deuda vigente

**Estimación:** 5 story points

---

### E-06: Pipeline de Ventas (Deals)

**Objetivo:** Pipeline visual kanban con deals, drag & drop y vista de forecast.

---

#### Story E-06-S01: Pipeline kanban con drag & drop

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

**Criterios de aceptación:**
- Crear deal con: título, contacto (búsqueda), empresa (auto-cargada del contacto), valor en COP, fecha estimada de cierre, vendedor asignado
- Los items del deal (productos/servicios) se pueden agregar desde el catálogo o como texto libre
- El deal tiene su propio timeline de actividades
- Botón "Crear factura" en el deal que pre-carga los items en el formulario de factura

**Estimación:** 5 story points

---

### E-07: Actividades

---

#### Story E-07-S01: Registro de actividades y recordatorios

**Criterios de aceptación:**
- Crear actividades de tipo: llamada, reunión, email, tarea, nota, WhatsApp
- Cada actividad se puede asociar a un contacto, empresa o deal
- Recordatorio configurable: X minutos/horas/días antes
- Al enviar un WhatsApp desde el CRM, se crea automáticamente una actividad de tipo WhatsApp
- Vista de calendario con actividades del usuario logueado (vista diaria y semanal)
- Filtros: por tipo, por assignee, por entidad asociada, por estado (pendiente/completada)

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

**Estimación:** 13 story points *(el más complejo del MVP)*

---

#### Story E-08-S03: Nota crédito (anulación de factura)

**Criterios de aceptación:**
- Solo se pueden anular facturas con estado "Aprobada" o "Pagada"
- Se requiere seleccionar motivo de anulación (lista predefinida)
- Se genera automáticamente una Nota Crédito ante la DIAN por el monto total
- La factura original queda con estado "Anulada" — nunca se elimina
- Si la factura estaba pagada, el pago queda como crédito a favor del cliente

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

**Estimación:** 5 story points

---

#### Story E-09-S02: Webhook de Wompi y conciliación automática

**Criterios de aceptación:**
- El webhook de Wompi actualiza la factura a estado "Pagada" automáticamente
- La verificación de firma del webhook es obligatoria (rechazar si no coincide)
- El handler es idempotente (procesar el mismo webhook dos veces no duplica el pago)
- Una notificación in-app y por email se envía al Owner cuando se recibe un pago
- El dashboard de cartera se actualiza en tiempo real via WebSocket

**Estimación:** 5 story points

---

#### Story E-09-S03: Dashboard de cartera

**Criterios de aceptación:**
- Dashboard en /payments con tabs: Por cobrar / Vencidas / Pagadas
- Las facturas vencidas se muestran ordenadas por días de mora (más antiguas primero)
- Los totales (por cobrar, vencido, pagado del mes) se muestran en cards métricas
- El usuario puede enviar un recordatorio de cobro desde el dashboard (abre el template de WhatsApp)
- Filtros por período y por cliente

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
- El mensaje se envía desde el número compartido de NexoCRM (Opción A del análisis de WhatsApp)
- La actividad "WhatsApp enviado" se registra en el timeline del contacto
- Si el cliente no tiene número de WhatsApp en su perfil, se pide antes de enviar

**Estimación:** 5 story points

---

### E-11: Catálogo de Productos (MVP básico)

---

#### Story E-11-S01: Catálogo básico de productos y servicios

**Criterios de aceptación:**
- CRUD de productos con: nombre, SKU, descripción, precio (COP), costo, tarifa de IVA (0%/5%/19%), tipo (producto/servicio), unidad de medida
- Los productos del catálogo se pueden agregar a deals y facturas (búsqueda por nombre o SKU)
- Control de stock básico: el stock se descuenta cuando se emite una factura aprobada
- Alerta de stock mínimo configurable por producto

**Estimación:** 5 story points

---

### E-12: Notificaciones y Alertas

---

#### Story E-12-S01: Notificaciones in-app en tiempo real

**Criterios de aceptación:**
- Bell icon en el header con badge de conteo de notificaciones no leídas
- Las notificaciones llegan en tiempo real via WebSocket (sin recargar la página)
- Al hacer click en la notificación, navega a la entidad relevante (ej: clic en "Factura aprobada" → abre la factura)
- El usuario puede marcar todas como leídas
- Tipos de notificación del MVP: factura aprobada DIAN, factura rechazada DIAN, pago recibido, pago fallido, nuevo deal asignado

**Estimación:** 5 story points

---

### E-13: Dashboard y Métricas Básicas

---

#### Story E-13-S01: Dashboard principal con métricas del negocio

**Criterios de aceptación:**
- 4 cards métricas: Por cobrar (COP), Vencido (COP), Deals activos (cantidad y valor), Facturado este mes (COP)
- Widget de actividades de hoy: lista de actividades pendientes con due_date = hoy
- Widget de facturas vencidas: top 3 facturas más antiguas vencidas con botón de cobro rápido
- Widget de pipeline: resumen por stage (cantidad y valor)
- Las métricas se calculan en el servidor y se cachean en Redis (TTL 5 minutos)
- El dashboard es la primera pantalla después del login

**Estimación:** 5 story points

---

## Estimación Total del MVP

| Épica | Story Points |
|-------|-------------|
| E-01: Fundación Multitenant | 7 |
| E-02: Auth y Autorización | 13 |
| E-03: Onboarding Wizard | 8 |
| E-04: Gestión de Contactos | 16 |
| E-05: Gestión de Empresas | 5 |
| E-06: Pipeline de Ventas | 13 |
| E-07: Actividades | 5 |
| E-08: Facturación DIAN | 21 |
| E-09: Pagos Wompi | 15 |
| E-10: WhatsApp Básico | 5 |
| E-11: Catálogo de Productos | 5 |
| E-12: Notificaciones | 5 |
| E-13: Dashboard | 5 |
| **TOTAL MVP** | **123 SP** |

**Velocidad estimada:** 15-20 SP/semana para un dev solo.
**Duración estimada:** 7-8 semanas de desarrollo.
**Buffer de seguridad recomendado:** +20% → 10 semanas para lanzar beta con calidad.

**Path crítico:**
- Registrarse en MATIAS sandbox en **semana 1** (no esperar al Sprint 5)
- Registrarse en Wompi en **semana 1**
- Configurar 360dialog para WhatsApp en **semana 1**
- E-01 (multitenancy) debe completarse antes de cualquier otra épica
- E-02 (auth) debe completarse antes de E-04, E-05, E-06
- E-08 (DIAN) y E-09 (Wompi) son las más complejas y las más críticas del negocio

---

## Épicas de Personalización Profunda (Post-MVP P1)

> Estas épicas son el **corazón diferenciador de Nexo**. Cada tenant debe sentir que tiene un CRM construido a su medida — no una herramienta genérica. Las épicas E-15A a E-15D se implementan en ese orden estricto ya que cada una depende de la anterior.
>
> **Dependencia compartida:** E-01-S01 debe haber incluido el campo `config JSONB` en `public.tenants` con la estructura completa. Si no fue así, el primer paso de E-15A es la migración de ese campo.

---

### E-15A: Theme Engine y Branding por Tenant

**Objetivo:** Que cada tenant pueda personalizar completamente la identidad visual de su instancia — colores, tipografía, iconografía, logo, favicon y login page — con un editor visual en tiempo real, sin tocar código.

**Criterio de aceptación épica:** Un tenant entra a Settings → Apariencia, cambia su logo, colores primarios y tipografía, ve el resultado en vivo en el preview, guarda, y todos sus usuarios ven la interfaz con ese branding aplicado — no el branding por defecto de Nexo.

**Dependencias:** E-01-S01 (config JSONB), E-02-S03 (RBAC — solo Owner/Admin edita branding)

---

#### Story E-15A-S01: Modelo de datos tipado para configuración visual del tenant

**Como** sistema, **quiero** un modelo de configuración de tema tipado y versionado **para que** cualquier cambio de branding sea auditable y reversible.

**Criterios de aceptación:**
- El campo `config.theme JSONB` en `public.tenants` sigue esta estructura estricta:
  ```typescript
  type TenantTheme = {
    colors: {
      primary: string;             // HEX — botones, links, acciones primarias
      primaryForeground: string;   // HEX — texto sobre primary (debe cumplir WCAG AA)
      secondary: string;           // HEX — color secundario
      accent: string;              // HEX — hover, highlights
      sidebar: string;             // HEX — fondo del sidebar
      sidebarForeground: string;   // HEX — texto e íconos del sidebar
    };
    typography: {
      fontFamily: 'inter' | 'roboto' | 'poppins' | 'nunito' | 'system';
      borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
      density: 'compact' | 'comfortable' | 'spacious';
    };
    branding: {
      logoUrl: string | null;       // URL en Cloudflare R2
      faviconUrl: string | null;    // URL en Cloudflare R2
      loginBgUrl: string | null;    // URL en Cloudflare R2
      companyName: string;          // Nombre en el header
      loginTagline: string | null;  // Frase en la pantalla de login
    };
    iconPack: 'outline' | 'filled' | 'duotone' | 'rounded';
    darkModeDefault: 'light' | 'dark' | 'system';
  };
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
    --color-primary: #1B4FD8;
    --color-primary-foreground: #FFFFFF;
    --color-sidebar-bg: #0F172A;
    --color-sidebar-fg: #F8FAFC;
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

**Total E-15A: 19 story points**

---

### E-15B: Nomenclatura y Navegación Configurable

**Objetivo:** Que cada tenant pueda renombrar las entidades del sistema, reorganizar el sidebar, y activar o desactivar módulos — y que esos cambios se propaguen a TODA la UI: breadcrumbs, notificaciones, emails automáticos, tooltips, empty states, botones de acción.

**Criterio de aceptación épica:** Una clínica puede llamar "Pacientes" a sus contactos y "Citas" a sus deals, y esos términos aparecen en absolutamente todos los textos del sistema. Un restaurante puede desactivar el módulo "Pipeline" y no aparece en ningún lugar de la interfaz ni en la API.

**Dependencias:** E-15A-S01 (config JSONB con `nomenclature` y `sidebarConfig`), E-02-S03 (RBAC)

---

#### Story E-15B-S01: Modelo de nomenclatura por tenant y hook universal

**Como** sistema, **quiero** un sistema de nomenclatura configurable por tenant que reemplace todos los textos hardcodeados de entidades **para que** el idioma del CRM refleje el vocabulario de cada negocio.

**Criterios de aceptación:**
- La estructura `config.nomenclature` en el JSONB del tenant:
  ```typescript
  type TenantNomenclature = {
    contact:  { singular: string; plural: string }; // "Paciente" / "Pacientes"
    company:  { singular: string; plural: string }; // "Clínica" / "Clínicas"
    deal:     { singular: string; plural: string }; // "Cita" / "Citas"
    activity: { singular: string; plural: string }; // "Seguimiento" / "Seguimientos"
    // Facturas/Invoice NO es renombrable — término legal DIAN
  };
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

#### Story E-15B-S04: Iconografía custom — packs de íconos y uploads SVG

**Como** Owner del tenant, **quiero** que los íconos del CRM tengan el estilo visual de mi marca, o poder subir íconos propios **para que** la experiencia sea completamente coherente con nuestra identidad.

**Criterios de aceptación:**
- 4 packs de íconos globales disponibles: Outline (default), Filled, Duotone, Rounded
- Todos los packs están basados en el mismo set de íconos (mismos nombres, distinto estilo visual), distribuidos como SVG sprites por pack
- El pack activo se selecciona en Settings → Apariencia → Íconos
- El ícono activo para cada módulo del sidebar es configurable individualmente: el usuario puede mantener el ícono por defecto del pack, o subir un SVG custom para ese módulo específico
- Los SVG custom se validan: máx 24×24px viewBox, sin scripts embebidos (sanitización con DOMPurify server-side), máx 15KB
- Presets de íconos por industria: al seleccionar un sector en onboarding o en Settings, se aplica un preset que asigna los íconos más apropiados para esa industria (ej: Salud → ícono de estetoscopio para Contactos)
- Preview de los 4 packs con 12 íconos representativos antes de aplicar

**Tareas técnicas:**
1. Generar 4 SVG sprites (outline, filled, duotone, rounded) a partir de un set base (Heroicons o Lucide como base)
2. Componente `<NexoIcon name="contacts" />` — lee el pack activo del TenantContext y renderiza el sprite correcto
3. Estructura `config.sidebarConfig.modules[].customIconUrl` para íconos SVG custom por módulo
4. Endpoint `POST /api/settings/icons/upload` con validación y sanitización DOMPurify server-side
5. Seed de presets de íconos por industria (8 industrias × íconos por módulo)
6. Tests: sanitización de SVG malicioso, carga del pack correcto por tenant, fallback al pack default si el custom es inválido

**Estimación:** 8 story points

**Total E-15B: 29 story points**

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
  - `currency` — monto en COP (entero en centavos internamente)
  - `date` — fecha (formato DD/MM/AAAA en UI, ISO 8601 en BD)
  - `datetime` — fecha y hora con timezone America/Bogota
  - `select` — lista desplegable con opciones definidas por el tenant
  - `multiselect` — selección múltiple de opciones
  - `boolean` — sí/no, checkbox
  - `url` — URL con validación de formato
  - `phone` — teléfono con validación de formato colombiano
  - `email` — email con validación de formato
  - `file` — archivo adjunto (PDF/imagen, máx 10MB, almacenado en R2)
  - `relation` — relación a otra entidad del tenant (contacto, empresa, deal, producto)
  - `formula` — campo calculado en base a otros campos (ej: `{precio} * {cantidad}`) — read-only
- Cada entidad puede tener hasta 50 campos custom (límite por plan)
- Los campos custom se almacenan en la columna `custom_fields JSONB` de la tabla correspondiente
- La definición de los campos (schema) se almacena en `config.customFields JSONB` en el tenant
- Los campos custom se pueden marcar como: requeridos, únicos, con valor por defecto
- Los campos se pueden reordenar (drag & drop) en el formulario de creación/edición
- Al eliminar un campo custom, los datos históricos se preservan en el JSONB pero el campo deja de mostrarse

**Tareas técnicas:**
1. Estructura `config.customFields: { contacts: FieldDef[], companies: FieldDef[], deals: FieldDef[] }` en el JSONB del tenant
2. Tipo `FieldDef` con todas las propiedades según los tipos de campo
3. Componente genérico `<CustomFieldRenderer field={FieldDef} value={any} onChange={fn} />` — renderiza el input correcto según el tipo
4. Validación server-side de campos custom en los endpoints de creación/edición de entidades (los requeridos y únicos se validan en el servidor)
5. Index GIN en `custom_fields JSONB` para búsqueda por campos custom
6. Endpoint `GET|POST|PATCH|DELETE /api/settings/custom-fields/:entity` (RBAC: Owner/Admin)
7. Tests: todos los tipos de campo, validación requerido/único, preservación de datos al eliminar campo

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

**Tareas técnicas:**
1. Modificar `ContactForm`, `CompanyForm`, `DealForm` para incluir el renderizador de campos custom
2. Modificar los endpoints de creación/edición de cada entidad para procesar y validar `custom_fields`
3. Actualizar el índice de búsqueda full-text para incluir campos custom indexables
4. Implementar motor de fórmulas básicas (evaluador de expresiones con los campos de la entidad como variables)
5. Tests: campos requeridos, búsqueda en campos custom, evaluación de fórmulas

**Estimación:** 8 story points

---

#### Story E-15C-S04: Vistas configurables — lista, tabla, kanban, mapa

**Como** usuario del tenant, **quiero** elegir cómo ver mis contactos y deals **para que** pueda trabajar de la forma más eficiente según el contexto.

**Criterios de aceptación:**
- Para Contactos: vistas disponibles — Lista (cards), Tabla (columnas configurables), Mapa (pin en municipio de Colombia)
- Para Deals: vistas disponibles — Kanban (existente en MVP), Lista, Tabla, Forecast (barras de cierre estimado por mes)
- El tenant puede elegir qué vistas están disponibles para su equipo (Settings → Vistas)
- Cada usuario recuerda su última vista seleccionada por módulo (persistida en localStorage)
- En la vista Tabla, las columnas son configurables: el usuario puede agregar/quitar campos (incluyendo campos custom), reordenar columnas y ajustar el ancho
- La configuración de columnas de la tabla se persiste por usuario (no por tenant — es personal)
- La vista Mapa de contactos: pines en el mapa de Colombia agrupados por municipio. Al hacer click en un pin, aparece un popup con la lista de contactos en ese municipio. Usa Leaflet.js con tiles de OpenStreetMap (sin costo)

**Tareas técnicas:**
1. Componente `ViewSelector` (toggle de íconos) en el header de cada módulo
2. Vista `TableView` genérica con columnas configurables (react-table / TanStack Table)
3. Vista `MapView` con Leaflet.js — geocodificación de municipios desde la lista de los 1.122 municipios de Colombia (coordenadas ya disponibles en `shared-utils/colombia-geo.ts`)
4. Vista `ForecastView` para Deals — Chart.js con barras por mes
5. Endpoint `PATCH /api/users/preferences/views` — guarda configuración de columnas por usuario
6. Tests: switch entre vistas, persistencia de columnas, mapa con múltiples pines en el mismo municipio

**Estimación:** 13 story points

---

#### Story E-15C-S05: Nexo Forms — formularios públicos que alimentan el CRM

**Como** Owner del tenant, **quiero** crear formularios públicos con un constructor drag & drop **para que** los leads que los llenan entren automáticamente al CRM como contactos.

**Criterios de aceptación:**
- Constructor drag & drop de formularios con los mismos tipos de campo de los campos custom
- El formulario puede incluir: campos estándar del CRM (nombre, email, teléfono) + campos custom del tenant
- Lógica condicional: mostrar/ocultar campos según el valor de otro campo (ej: si "¿Es empresa?" = Sí, mostrar campo NIT)
- Cada formulario tiene una URL pública: `{slug}.nexocrm.co/forms/{form-slug}`
- El formulario puede tener dominio personalizado del tenant si está configurado
- Al enviarse, crea un contacto nuevo en el CRM (o actualiza uno existente si el email ya existe)
- Los campos del formulario se mapean a campos del contacto (mapeo configurable en el builder)
- El formulario puede asignar automáticamente el contacto creado a un vendedor (round-robin o fijo)
- El formulario puede agregar automáticamente el contacto a un pipeline (configurable)
- Diseño del formulario branded: usa los colores y logo del tenant automáticamente
- El Owner ve estadísticas básicas del formulario: vistas, envíos, tasa de conversión

**Tareas técnicas:**
1. Tabla `tenant_{slug}.forms` con: id, name, slug, fields JSONB, settings JSONB, active boolean
2. Tabla `tenant_{slug}.form_submissions` con: id, form_id, data JSONB, contact_id (FK), ip, created_at
3. Constructor drag & drop en Settings → Formularios (componente `FormBuilder`)
4. Motor de lógica condicional client-side en el formulario público
5. Endpoint público `POST /forms/{form-slug}/submit` — sin auth, con rate limiting por IP (máx 5 envíos/hora por IP)
6. Lógica "find or create" contact al recibir un envío
7. Página pública `app/forms/[tenant-slug]/[form-slug]/page.tsx` — Server Component + branding del tenant
8. Tests: submit crea contacto, submit con email existente actualiza contacto, rate limiting, lógica condicional, mapeo de campos

**Estimación:** 13 story points

**Total E-15C: 52 story points**

---

### E-15D: Dashboard Configurable y Reportes Custom

**Objetivo:** Que cada tenant pueda armar su propio dashboard con widgets drag & drop y crear reportes a medida con las métricas que importan para su negocio, incluyendo sus campos custom.

**Criterio de aceptación épica:** El dueño de una clínica puede tener un dashboard con: "Pacientes nuevos esta semana", "Citas pendientes hoy" y "Ingresos por médico" — métricas totalmente personalizadas usando su propia nomenclatura y campos custom.

**Dependencias:** E-13 (dashboard base), E-15B-S01 (nomenclatura), E-15C-S01 (campos custom)

---

#### Story E-15D-S01: Motor de widgets — definición y registro

**Como** sistema, **quiero** un motor de widgets registrables que pueda combinar datos del CRM con la configuración del tenant **para que** el dashboard sea completamente extensible.

**Criterios de aceptación:**
- Catálogo de widgets disponibles en el MVP de personalización:
  - `metric-card` — un número con label, tendencia y período (ej: "Contactos nuevos este mes")
  - `pipeline-summary` — tabla/barras de deals por stage
  - `activity-list` — lista de actividades pendientes
  - `overdue-invoices` — facturas vencidas con botón de acción
  - `revenue-chart` — gráfica de ingresos por período (línea o barras)
  - `contacts-by-status` — donut chart de contactos por estado
  - `deals-forecast` — forecast de cierre por mes
  - `leaderboard` — ranking de vendedores por deals cerrados o valor facturado
  - `custom-metric` — el tenant define la query en lenguaje simple (filtros + campo + agregación)
- Cada widget tiene: id, type, title (editable), size (1×1, 2×1, 2×2), configuración específica por tipo
- Los widgets se registran en `config.dashboardLayout JSONB` en el tenant
- La configuración del dashboard es por usuario (cada usuario tiene su propio layout — no compartido)

**Tareas técnicas:**
1. Estructura `dashboardLayout: { widgets: WidgetConfig[] }` en las preferencias del usuario (no del tenant)
2. Tipo `WidgetConfig` con `id`, `type`, `position: {x, y, w, h}`, `settings JSONB`
3. Servicio `DashboardDataService` que resuelve los datos de cada widget (usa el TenantContext para aplicar nomenclatura)
4. Endpoint `GET /api/dashboard/widgets-data` — recibe la lista de widget types del usuario y devuelve todos los datos en una sola query batched
5. Cache por usuario en Redis (TTL 5 minutos por widget, invalidado cuando hay cambios en los datos relevantes)
6. Tests: datos del widget aislados por tenant, cache correcta, invalidación de cache

**Estimación:** 8 story points

---

#### Story E-15D-S02: Dashboard drag & drop con widget picker

**Como** usuario del tenant, **quiero** personalizar mi dashboard con drag & drop **para que** las métricas que más importan estén siempre visibles al entrar al CRM.

**Criterios de aceptación:**
- Botón "Personalizar dashboard" en la esquina superior del dashboard — activa el modo edición
- En modo edición: los widgets muestran una barra de drag y un botón de eliminar
- Drag & drop de widgets para reposicionar (grid de 4 columnas, con snapping a la grilla)
- Botón "Agregar widget" abre un panel lateral (drawer) con el catálogo de widgets disponibles
- Cada widget en el catálogo muestra: nombre, preview de cómo se ve y descripción
- Al agregar un widget configurable (ej: `metric-card`), se abre un mini-formulario de configuración antes de añadirlo al dashboard
- Botón "Guardar" confirma los cambios; botón "Cancelar" descarta los cambios sin persistirlos
- Botón "Restaurar dashboard por defecto" con confirmación — vuelve al layout de 4 métricas del MVP
- El dashboard mínimo tiene 2 widgets fijos no removibles: `metric-card` de Por cobrar y `activity-list`

**Tareas técnicas:**
1. Librería `react-grid-layout` para el grid drag & drop con snapping
2. Componente `WidgetPicker` (drawer) con catálogo y preview
3. Componente `WidgetConfigForm` — formulario específico por tipo de widget
4. Endpoint `PUT /api/users/preferences/dashboard-layout` — guarda el layout del usuario
5. Modo edición: estado local que no persiste hasta hacer "Guardar"
6. Tests: drag & drop persiste posiciones, widget no configurable se agrega directamente, mínimo de widgets fijos

**Estimación:** 8 story points

---

#### Story E-15D-S03: Constructor de reportes custom

**Como** Owner o Manager del tenant, **quiero** crear reportes personalizados con mis propias métricas **para que** pueda analizar mi negocio desde la perspectiva correcta para mi industria.

**Criterios de aceptación:**
- Sección Reports con tab "Mis reportes" (reportes custom creados por el tenant) + tab "Reportes estándar" (los pre-construidos del sistema)
- Constructor de reportes con interfaz low-code:
  - Paso 1: Fuente de datos (Contactos, Empresas, Deals, Facturas, Pagos, Actividades)
  - Paso 2: Filtros (campo + operador + valor). Soporta campos estándar + campos custom del tenant
  - Paso 3: Agrupación (ej: agrupar deals por vendedor asignado, por stage, por mes de creación)
  - Paso 4: Métricas (contar registros, sumar campo numérico, promediar campo numérico, máximo/mínimo)
  - Paso 5: Visualización (tabla, barra, línea, donut, número único)
- Preview del reporte en tiempo real al configurar cada paso
- El reporte generado usa la nomenclatura del tenant (muestra "Pacientes" si así está configurado)
- Los reportes custom se pueden guardar, editar y eliminar
- Los reportes guardados se pueden agregar al dashboard como widget tipo `custom-report`
- Exportar reporte a CSV o PDF con el logo y nombre del tenant en el encabezado

**Tareas técnicas:**
1. Tabla `tenant_{slug}.saved_reports` con: id, name, config JSONB (steps 1-5), created_by, created_at
2. Servicio `ReportQueryBuilder` — construye la SQL query de forma segura a partir de la config del reporte (nunca interpolación directa de strings — usar prepared statements y whitelist de campos)
3. Endpoint `POST /api/reports/preview` — ejecuta la query en el tenant schema y devuelve los primeros 100 resultados
4. Endpoint `GET|POST|PATCH|DELETE /api/reports` — CRUD de reportes guardados (RBAC: Owner/Manager)
5. Generación de PDF de reporte con logo del tenant (Puppeteer headless o @react-pdf/renderer)
6. Exportación CSV simple
7. Tests: query builder con campos custom, filtros múltiples, whitelist de campos (ningún campo de otro tenant puede filtrarse), export CSV y PDF

**Estimación:** 13 story points

**Total E-15D: 29 story points**

---

## Estimación Total Personalización

| Épica | Story Points | Sprints estimados |
|-------|-------------|-------------------|
| E-15A: Theme Engine y Branding | 19 SP | 1.5 semanas |
| E-15B: Nomenclatura y Navegación | 29 SP | 2 semanas |
| E-15C: Campos Custom, Vistas y Formularios | 52 SP | 3.5 semanas |
| E-15D: Dashboard y Reportes Custom | 29 SP | 2 semanas |
| **TOTAL PERSONALIZACIÓN** | **129 SP** | **~9 semanas** |

> **Orden de implementación obligatorio:** E-15A → E-15B → E-15C → E-15D. No paralelizable porque cada épica usa la infraestructura de la anterior.
>
> **Nota sobre E-01:** El campo `config JSONB` con la estructura completa (theme, nomenclature, sidebarConfig, modules, customFields, dashboardLayout) debe crearse en E-01-S01, aunque vacío. Esto evita una migración costosa de todos los tenants existentes cuando se implementen estas épicas.

---

## Backlog Post-MVP

| Epic ID | Nombre | Prioridad | Depende de |
|---------|--------|-----------|------------|
| E-14 | Import masivo CSV/Excel | P1 | E-04, E-15C (campos custom) |
| E-15A | Theme Engine y Branding | P1 *(ver arriba)* | E-01 |
| E-15B | Nomenclatura y Navegación | P1 *(ver arriba)* | E-15A |
| E-15C | Campos Custom, Vistas, Formularios | P1 *(ver arriba)* | E-15B |
| E-15D | Dashboard y Reportes Custom | P1 *(ver arriba)* | E-15C, E-13 |
| E-16 | WhatsApp bidireccional + Inbox completo | P1 | E-10 |
| E-17 | Bot IA en WhatsApp | P1 | E-16, E-20 |
| E-18 | Motor de Automatización visual (Nexo Flow) | P1 | E-04, E-06, E-08 |
| E-19 | Workflows pre-armados (5 templates por industria) | P1 | E-18 |
| E-20 | Chat Asistente IA con RAG (contexto del tenant) | P1 | E-04, E-15C |
| E-21 | Lead Scoring automático con IA | P2 | E-20 |
| E-22 | Control de inventario completo | P1 | E-11 |
| E-23 | MFA con TOTP | P2 | E-02 |
| E-24 | Múltiples pipelines | P2 | E-06 |
| E-25 | API pública + webhooks outgoing | P2 | E-01, E-15C |
| E-26 | Integraciones Meta (Instagram/Facebook) | P2 | E-16 |
| E-27 | Apple Pay via Wompi | P2 | E-09 |
| E-28 | Landing page y marketing site | P1 | — |
| E-29 | Portal del cliente (ver cotizaciones/facturas) | P2 | E-08, E-15A |
| E-30 | Geolocalización de equipo de campo | P3 | E-15C (vista mapa) |
| E-31 | NPS y encuestas automáticas post-venta | P2 | E-15C (Nexo Forms) |
| E-32 | Marketplace de integraciones (Shopify, Siigo, Alegra) | P3 | E-25 |

---

## Resumen Ejecutivo del Roadmap

```
SEMANAS 1-10:  MVP (123 SP) — La base funcional del CRM colombiano
               ↓
SEMANAS 11-19: Personalización Profunda (129 SP) — El diferenciador de mercado
               ↓
SEMANAS 20+:   Post-MVP escalado — WhatsApp avanzado, IA, automatización, marketplace
```

**Total acumulado hasta lanzamiento comercial completo:** 252 SP (~19 semanas dev solo con buffer)

---

*Documento v2.0 — NexoCRM | BMad Enterprise Track*
*Generado por: PM John + Architect Winston | Actualizado: Marzo 2026*
*Cambios v2.0: Épicas E-15A, E-15B, E-15C, E-15D expandidas completamente. E-01-S01 y E-03-S01 actualizados para soportar personalización desde el día 1. Backlog extendido con E-29 a E-32.*
