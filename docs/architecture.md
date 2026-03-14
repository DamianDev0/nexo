# NexoCRM — Architecture Document

**BMad Enterprise Track | Agente: Architect Winston**

> Versión: 1.0 | Marzo 2026  
> Estado: Draft  
> Prerrequisitos completados: PRD.md ✅ | ux-design.md ✅  
> Siguiente: security.md + devops.md

---

## Índice

1. [Resumen de Decisiones Arquitectónicas](#1-resumen-de-decisiones-arquitectónicas)
2. [Patrón Arquitectónico](#2-patrón-arquitectónico)
3. [Stack Tecnológico Definitivo](#3-stack-tecnológico-definitivo)
4. [Estructura del Monorepo](#4-estructura-del-monorepo)
5. [Multitenancy — Schema-per-Tenant](#5-multitenancy--schema-per-tenant)
6. [Backend — Módulos NestJS](#6-backend--módulos-nestjs)
7. [Frontend — Next.js App Router](#7-frontend--nextjs-app-router)
8. [Base de Datos](#8-base-de-datos)
9. [Colas y Jobs Asíncronos](#9-colas-y-jobs-asíncronos)
10. [Real-time y WebSockets](#10-real-time-y-websockets)
11. [Integraciones Externas](#11-integraciones-externas)
12. [Módulo de IA y RAG](#12-módulo-de-ia-y-rag)
13. [Seguridad — Vista Arquitectónica](#13-seguridad--vista-arquitectónica)
14. [ADRs — Architectural Decision Records](#14-adrs--architectural-decision-records)
15. [Diagramas de Flujo Críticos](#15-diagramas-de-flujo-críticos)
16. [Estrategia de Testing](#16-estrategia-de-testing)

---

## 1. Resumen de Decisiones Arquitectónicas

| Decisión | Elección | Alternativa descartada | Razón |
|----------|----------|------------------------|-------|
| Patrón backend | Modular Monolith | Microservicios desde día 1 | Velocidad de desarrollo para MVP; módulos ya preparados para extracción |
| Multitenancy | Schema-per-tenant PostgreSQL | Row-level security (RLS) | Aislamiento total, facilidad de backup y migración por tenant |
| ORM | Prisma + raw SQL para JSONB | TypeORM, Sequelize | Type-safety, migraciones robustas, pero raw SQL para queries JSONB complejos |
| API contract | tRPC (frontend↔backend) | REST puro / GraphQL | Type-safety de extremo a extremo sin código generado |
| Estado cliente | Zustand + TanStack Query | Redux, Jotai | Mínimo boilerplate, cache automático de server state |
| Autenticación | JWT RS256 + refresh tokens | Sessions con cookies | Stateless, compatible con edge functions futuras |
| Queue | BullMQ sobre Redis | AWS SQS, RabbitMQ | Simplicidad de stack, misma infra de Redis para cache |
| Real-time | Socket.io | Server-Sent Events | Bidireccional, rooms por tenant, fallback automático a polling |
| File storage | Cloudflare R2 | AWS S3 | Costo (sin egress fees), API S3-compatible |
| Email | Resend | AWS SES, SendGrid | DX superior, TypeScript SDK, menor config para MVP |
| DIAN (MVP) | MATIAS API | Integración directa DIAN | Complejidad UBL 2.1 + XAdES-EPES es excesiva para MVP |
| Pagos | Wompi | Stripe, PayU | Cobertura total del ecosistema colombiano en 1 API |
| WhatsApp BSP | 360dialog | Twilio, Meta directo | Mejor precio ($5 USD/mes), API directa a Meta |
| Infra MVP | Railway | Render, Fly.io | PostgreSQL managed incluido, deploy con 1 click, Redis addon |
| Monitoreo | Sentry + Prometheus | Datadog, New Relic | Sentry gratis tier generoso, Prometheus nativo en Railway |

---

## 2. Patrón Arquitectónico

### 2.1 Modular Monolith con Bounded Contexts

NexoCRM usa un **modular monolith** para el MVP. Cada módulo tiene sus propias capas (controller, service, repository) y no accede directamente a las capas internas de otros módulos — solo se comunican a través de interfaces definidas.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                      │
│              Next.js 14 App Router (PWA)                            │
│         [SSR landing] [RSC dashboard] [Client components]           │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ tRPC over HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / BFF                                 │
│               Next.js API Routes + tRPC Router                      │
│          Tenant resolution │ Auth middleware │ Rate limiting         │
└────────┬─────────┬─────────┴──────┬──────────┬──────────┬──────────┘
         │         │                │          │          │
         ▼         ▼                ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│  AUTH    │ │   CRM    │ │ BILLING  │ │ PAYMENTS │ │  WHATSAPP    │
│ MODULE   │ │ MODULE   │ │ MODULE   │ │ MODULE   │ │  MODULE      │
│ NestJS   │ │ NestJS   │ │ NestJS   │ │ NestJS   │ │  NestJS      │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│AUTOMATION│ │INVENTORY │ │    AI    │ │NOTIFICAT.│ │   TENANT     │
│ MODULE   │ │ MODULE   │ │ MODULE   │ │ MODULE   │ │  MODULE      │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘
         │         │                │          │          │
         └─────────┴────────────────┴──────────┴──────────┘
                          │
                ┌─────────┴─────────┐
                │   SHARED KERNEL   │
                │ - TenantContext   │
                │ - EventBus        │
                │ - Logger          │
                │ - ConfigService   │
                └─────────┬─────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL  │  │    Redis 7   │  │ Cloudflare R2│
│ (schema-per │  │ Cache+Queue  │  │ File Storage │
│  tenant)    │  │ BullMQ+WS   │  │ PDFs,adjuntos│
└─────────────┘  └──────────────┘  └──────────────┘
```

### 2.2 Comunicación entre módulos

```typescript
// Los módulos NO se llaman directamente entre sí.
// Usan eventos a través del EventBus interno.

// MAL — acoplamiento directo:
class InvoiceService {
  constructor(private whatsappService: WhatsappService) {} // ❌
}

// BIEN — comunicación por eventos:
class InvoiceService {
  constructor(private eventBus: EventBus) {}

  async approvedByDIAN(invoice: Invoice) {
    // Emite evento — WhatsApp y Notifications escuchan
    await this.eventBus.emit('invoice.approved_dian', {
      tenantId: invoice.tenantId,
      invoiceId: invoice.id,
      contactId: invoice.contactId,
      totalCents: invoice.totalCents,
    });
  }
}
```

---

## 3. Stack Tecnológico Definitivo

### 3.1 Frontend

```
NEXT.JS 14 (App Router)
─────────────────────────────────────────────────────
Versión:        14.x (latest stable)
Router:         App Router (no Pages Router)
Rendering:
  - Landing/marketing: SSR + ISR para SEO
  - Dashboard app:     RSC (React Server Components) + Client Components
  - Formularios:       Client Components con react-hook-form + zod
  - Real-time:         Client Components con useSocket hook

UI STACK
─────────────────────────────────────────────────────
shadcn/ui:      Componentes base (Button, Input, Modal, Table, etc.)
                Instalar solo los componentes necesarios (no todo el paquete)
Tailwind CSS:   v3.x con configuración custom
Lucide Icons:   Incluido con shadcn/ui
Framer Motion:  Solo para animaciones de entrada/salida de modales y páginas
@dnd-kit:       Drag & drop para el kanban del pipeline

STATE MANAGEMENT
─────────────────────────────────────────────────────
TanStack Query: Server state (fetching, caching, invalidation)
Zustand:        Client state (UI state, selecciones, preferencias del usuario)
                NO usar Zustand para server data — eso es de TanStack Query

FORMS
─────────────────────────────────────────────────────
react-hook-form + zod: Validación sincronizada con el backend
                        Los schemas Zod se comparten entre frontend y backend

INTERNACIONALIZACIÓN
─────────────────────────────────────────────────────
date-fns:       Con locale es-CO para formateo de fechas
Intl API:       Para formateo de moneda (COP)
next-intl:      Si se necesita i18n (futura expansión LATAM)
```

### 3.2 Backend

```
NESTJS (TypeScript)
─────────────────────────────────────────────────────
Versión:        10.x (latest stable)
Patrón:         Modular con DI nativo de NestJS
Transporte API: HTTP REST + tRPC para endpoints tipados
                WebSocket para real-time (Socket.io adapter)
Validación:     class-validator + class-transformer en DTOs
                Zod para schemas compartidos con el frontend

PRISMA ORM
─────────────────────────────────────────────────────
Versión:        5.x
Uso:            Queries tipadas para tablas estándar
Raw SQL:        Para queries JSONB complejos, búsqueda full-text tsvector,
                y operaciones sobre múltiples schemas (multitenancy)
Migrations:     Prisma Migrate con scripts custom para schema-per-tenant

AUTENTICACIÓN
─────────────────────────────────────────────────────
Passport.js:    Strategies: JWT, Google OAuth2
JWT:            RS256 (asimétrico) — private key en backend, public key en BFF
                Access token: 1 hora
                Refresh token: 30 días, rotación en cada uso
                Almacenado en: httpOnly cookie (refresh) + memory (access)
```

### 3.3 Infraestructura

```
DESARROLLO LOCAL
─────────────────────────────────────────────────────
Docker Compose:  PostgreSQL 16, Redis 7, MinIO (S3 local)
.env files:      Por entorno (.env.local, .env.test, .env.production)
Turborepo:       Para el monorepo (tasks paralelas, cache de builds)

PRODUCCIÓN (MVP)
─────────────────────────────────────────────────────
Railway:         Servidor Node.js (NestJS) + Next.js
                 PostgreSQL managed (Railway Postgres)
                 Redis managed (Railway Redis)
                 Deploy automático desde main branch
                 Variables de entorno encriptadas
Cloudflare R2:   File storage (PDFs, adjuntos)
Cloudflare:      CDN + DNS + DDoS protection
Resend:          Email transaccional

PRODUCCIÓN (Escala — >500 tenants)
─────────────────────────────────────────────────────
AWS ECS Fargate: Backend NestJS (horizontal scaling)
AWS RDS:         PostgreSQL 16 (Multi-AZ, read replicas)
AWS ElastiCache: Redis (cluster mode)
AWS CloudFront:  CDN para el frontend
AWS S3:          File storage (migración desde R2)
```

---

## 4. Estructura del Monorepo

```
nexo-crm/
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/               # Route group — sin sidebar
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── onboarding/
│   │   │   ├── (app)/                # Route group — con sidebar
│   │   │   │   ├── dashboard/
│   │   │   │   ├── contacts/
│   │   │   │   │   ├── page.tsx      # Lista RSC
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx  # Perfil RSC
│   │   │   │   │   └── new/
│   │   │   │   ├── deals/
│   │   │   │   ├── invoices/
│   │   │   │   ├── payments/
│   │   │   │   ├── whatsapp/
│   │   │   │   ├── automations/
│   │   │   │   ├── products/
│   │   │   │   ├── reports/
│   │   │   │   └── settings/
│   │   │   └── api/                  # Next.js API routes (BFF + tRPC)
│   │   │       └── trpc/
│   │   │           └── [trpc]/
│   │   │               └── route.ts
│   │   ├── components/               # Componentes de UI compartidos
│   │   │   ├── ui/                   # shadcn/ui base components
│   │   │   ├── layout/               # AppShell, Sidebar, Header
│   │   │   └── shared/               # Componentes específicos del negocio
│   │   ├── features/                 # Feature-based components
│   │   │   ├── contacts/
│   │   │   ├── invoices/
│   │   │   ├── pipeline/
│   │   │   └── ...
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities, formatters, clients
│   │   └── store/                    # Zustand stores
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── main.ts               # Bootstrap de la app
│       │   ├── app.module.ts         # Root module
│       │   ├── modules/              # Feature modules
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── strategies/
│       │   │   │   │   ├── jwt.strategy.ts
│       │   │   │   │   └── google.strategy.ts
│       │   │   │   └── guards/
│       │   │   ├── tenants/
│       │   │   ├── contacts/
│       │   │   ├── companies/
│       │   │   ├── deals/
│       │   │   ├── activities/
│       │   │   ├── invoices/
│       │   │   │   ├── invoices.module.ts
│       │   │   │   ├── invoices.service.ts
│       │   │   │   ├── dian/
│       │   │   │   │   ├── matias.client.ts    # MATIAS API client
│       │   │   │   │   └── dian.service.ts
│       │   │   │   └── ...
│       │   │   ├── payments/
│       │   │   │   ├── wompi.client.ts         # Wompi API client
│       │   │   │   └── ...
│       │   │   ├── whatsapp/
│       │   │   │   ├── dialog360.client.ts     # 360dialog client
│       │   │   │   └── ...
│       │   │   ├── automation/
│       │   │   ├── notifications/
│       │   │   ├── inventory/
│       │   │   └── ai/
│       │   │       ├── claude.client.ts
│       │   │       ├── embeddings.service.ts
│       │   │       └── rag.service.ts
│       │   ├── shared/               # Shared kernel
│       │   │   ├── tenant/
│       │   │   │   ├── tenant.context.ts
│       │   │   │   └── tenant.middleware.ts
│       │   │   ├── events/
│       │   │   │   └── event-bus.service.ts
│       │   │   ├── database/
│       │   │   │   ├── prisma.service.ts
│       │   │   │   └── tenant-db.service.ts   # Schema switching
│       │   │   ├── queue/
│       │   │   │   └── bull.config.ts
│       │   │   └── logger/
│       │   ├── trpc/                 # tRPC routers
│       │   │   ├── router.ts
│       │   │   └── routers/
│       │   │       ├── contacts.router.ts
│       │   │       ├── invoices.router.ts
│       │   │       └── ...
│       │   └── websocket/
│       │       └── notifications.gateway.ts
│       └── prisma/
│           ├── schema.prisma         # Schema del schema público
│           ├── tenant-schema.prisma  # Schema del tenant (referencia)
│           └── migrations/
│
├── packages/
│   ├── shared-types/                 # Types compartidos (DTOs, enums)
│   ├── shared-validators/            # Schemas Zod compartidos
│   ├── shared-utils/                 # Utilidades comunes
│   │   ├── currency.ts               # Formateo COP
│   │   ├── nit-validator.ts          # Validación NIT colombiano
│   │   └── date-co.ts               # Manejo de fechas Colombia
│   └── ui-primitives/               # Componentes UI base si se comparten
│
├── _bmad-output/                    # BMad artifacts
│   ├── planning-artifacts/
│   │   ├── PRD.md
│   │   ├── ux-design.md
│   │   ├── architecture.md
│   │   ├── security.md
│   │   ├── devops.md
│   │   ├── project-context.md
│   │   └── epics/
│   └── implementation-artifacts/
│       └── sprint-status.yaml
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json (workspaces)
├── .env.example
└── docker-compose.yml               # Dev environment
```

---

## 5. Multitenancy — Schema-per-Tenant

### 5.1 Estrategia y justificación

Cada tenant tiene un schema PostgreSQL independiente. El schema `public` contiene solo la data de la plataforma (tenants, planes, billing).

```sql
-- Schema público (plataforma)
public.tenants (id, slug, name, plan_id, schema_name, config JSONB)
public.plans (id, name, limits JSONB, price_cop)
public.platform_billing (tenant_id, period, amount_cents, status)
public.tenant_wa_numbers (tenant_id, phone_number_id, waba_token_encrypted)

-- Schema por tenant (ejemplo)
tenant_acme.users
tenant_acme.contacts
tenant_acme.companies
tenant_acme.deals
tenant_acme.pipelines
tenant_acme.activities
tenant_acme.invoices
tenant_acme.invoice_resolutions
tenant_acme.payments
tenant_acme.payment_sources
tenant_acme.products
tenant_acme.inventory_movements
tenant_acme.whatsapp_conversations
tenant_acme.whatsapp_messages
tenant_acme.workflows
tenant_acme.workflow_executions
tenant_acme.notifications
tenant_acme.notification_preferences
tenant_acme.ai_embeddings
```

### 5.2 Resolución del tenant

```typescript
// apps/api/src/shared/tenant/tenant.middleware.ts

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Extraer subdominio
    const host = req.headers.host; // ej: "acme.nexocrm.co"
    const subdomain = host.split('.')[0]; // "acme"

    if (!subdomain || subdomain === 'www' || subdomain === 'api') {
      return next(); // Landing o API sin tenant
    }

    // 2. Lookup con cache (Redis, TTL 5 minutos)
    const cacheKey = `tenant:slug:${subdomain}`;
    let tenant = await this.cache.get(cacheKey);

    if (!tenant) {
      tenant = await this.prisma.tenant.findUnique({
        where: { slug: subdomain },
        select: { id: true, schemaName: true, plan: true, config: true },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant no encontrado');
      }

      await this.cache.set(cacheKey, tenant, 300); // 5 min
    }

    // 3. Inyectar en el request context
    req['tenantContext'] = {
      tenantId: tenant.id,
      schemaName: tenant.schemaName, // "tenant_acme"
      plan: tenant.plan,
      config: tenant.config,
    };

    next();
  }
}
```

### 5.3 Switching de schema en queries

```typescript
// apps/api/src/shared/database/tenant-db.service.ts

@Injectable()
export class TenantDbService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ejecuta una query en el schema correcto del tenant.
   * SIEMPRE usar este método para queries dentro del tenant.
   */
  async query<T>(
    schemaName: string,
    fn: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    // Establecer search_path al schema del tenant
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET search_path TO ${schemaName}, public`);
      return fn(tx as unknown as PrismaClient);
    });
  }
}

// Uso en un servicio:
@Injectable()
export class ContactsService {
  constructor(
    private tenantDb: TenantDbService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async findAll(filters: ContactFiltersDto) {
    const { schemaName } = this.request['tenantContext'];

    return this.tenantDb.query(schemaName, async (db) => {
      return db.contact.findMany({
        where: buildContactFilters(filters),
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
```

### 5.4 Migration runner para todos los tenants

```typescript
// apps/api/scripts/migrate-all-tenants.ts
// Se ejecuta como parte del pipeline CI/CD para aplicar migraciones

import { PrismaClient } from '@prisma/client';

async function migrateAllTenants() {
  const prisma = new PrismaClient();

  const tenants = await prisma.tenant.findMany({
    select: { id: true, slug: true, schemaName: true },
  });

  console.log(`Migrando ${tenants.length} tenants...`);

  for (const tenant of tenants) {
    try {
      // Ejecutar la migración SQL en el schema del tenant
      await prisma.$executeRawUnsafe(
        `SET search_path TO ${tenant.schemaName}`
      );
      // Aplicar el SQL de migración aquí
      await prisma.$executeRawUnsafe(MIGRATION_SQL);

      console.log(`✓ ${tenant.slug} migrado`);
    } catch (error) {
      console.error(`✗ Error en ${tenant.slug}:`, error.message);
      // No detener el proceso — continuar con el siguiente
      // Pero registrar para revisión manual
    }
  }

  console.log('Migración completada.');
}
```

---

## 6. Backend — Módulos NestJS

### 6.1 Módulo Auth

```typescript
// Responsabilidades:
// - Registro de tenants y usuarios
// - Login email/password + Google OAuth
// - JWT issuance y refresh
// - Guards de autenticación y autorización RBAC
// - Rate limiting de endpoints de auth

// Endpoints:
// POST /auth/register        → Crear tenant + primer usuario (Owner)
// POST /auth/login           → Login con email/password
// GET  /auth/google          → Iniciar OAuth Google
// GET  /auth/google/callback → Callback de Google
// POST /auth/refresh         → Renovar access token
// POST /auth/logout          → Invalidar refresh token
// POST /auth/forgot-password → Solicitar reset de password
// POST /auth/reset-password  → Completar reset

// Guard de autorización RBAC:
@Injectable()
export class RBACGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user, tenantContext } = context.switchToHttp().getRequest();
    const required = this.reflector.get<Permission>('permission', context.getHandler());

    if (!required) return true; // No se requiere permiso específico

    return hasPermission(user.role, required.resource, required.action);
  }
}

// Uso en controller:
@Get(':id')
@RequirePermission({ resource: 'contacts', action: 'read' })
findOne(@Param('id') id: string) { ... }
```

### 6.2 Módulo Invoices (DIAN)

```typescript
// Responsabilidades:
// - CRUD de facturas
// - Integración con MATIAS API
// - Manejo de estados DIAN
// - Generación de links de pago
// - Conciliación con pagos

// Flujo crítico — emitir factura:
@Injectable()
export class InvoicesService {
  async emit(tenantId: string, createDto: CreateInvoiceDto): Promise<Invoice> {
    // 1. Validar datos tributarios
    await this.validateTaxData(createDto);

    // 2. Asignar consecutivo de la resolución activa
    const resolution = await this.getActiveResolution(tenantId);
    const consecutive = await this.getNextConsecutive(resolution);

    // 3. Crear en BD como "pending_dian"
    const invoice = await this.createInvoice({
      ...createDto,
      status: 'pending_dian',
      invoiceNumber: `${resolution.prefix}-${consecutive}`,
    });

    // 4. Encolar para procesamiento DIAN (asíncrono)
    await this.queue.add('emit-dian', {
      tenantId,
      invoiceId: invoice.id,
    });

    return invoice;
  }
}

// Job processor en BullMQ:
@Processor('invoices')
export class InvoiceProcessor {
  @Process('emit-dian')
  async processDianEmission(job: Job<{ tenantId: string; invoiceId: string }>) {
    const { tenantId, invoiceId } = job.data;

    // 1. Obtener factura
    const invoice = await this.invoicesService.findOne(tenantId, invoiceId);

    // 2. Enviar a MATIAS API
    const matiasResponse = await this.matiasClient.emitInvoice({
      // mapear campos de NexoCRM a formato MATIAS
    });

    if (matiasResponse.status === 'APPROVED') {
      // 3. Actualizar con CUFE y PDF
      await this.invoicesService.markApproved(invoiceId, {
        cufe: matiasResponse.cufe,
        pdfUrl: matiasResponse.pdfUrl,
        xmlUrl: matiasResponse.xmlUrl,
        dianValidatedAt: new Date(),
      });

      // 4. Emitir evento (WhatsApp + Notificaciones escuchan)
      await this.eventBus.emit('invoice.approved_dian', { tenantId, invoiceId });

    } else {
      await this.invoicesService.markRejected(invoiceId, {
        dianResponse: matiasResponse,
      });
      await this.eventBus.emit('invoice.rejected_dian', { tenantId, invoiceId });
    }
  }
}
```

### 6.3 Módulo Payments (Wompi)

```typescript
// Cliente Wompi tipado:
@Injectable()
export class WompiClient {
  private readonly baseUrl = 'https://production.wompi.co/v1';

  async createTransaction(data: CreateTransactionDto): Promise<WompiTransaction> {
    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.publicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_in_cents: data.amountCents,
        currency: 'COP',
        customer_email: data.customerEmail,
        payment_method: data.paymentMethod, // { type: 'NEQUI', phone_number: '...' }
        reference: data.reference,
        customer_data: data.customerData,
        redirect_url: data.redirectUrl,
      }),
    });

    if (!response.ok) {
      throw new WompiException(await response.json());
    }

    return response.json();
  }

  async createPaymentLink(data: CreatePaymentLinkDto): Promise<string> {
    // Implementación de payment links de Wompi
  }
}

// Webhook handler (idempotente):
@Post('webhooks/wompi')
async handleWompiWebhook(@Body() body: WompiWebhookDto, @Headers() headers: any) {
  // 1. Verificar firma del webhook
  const isValid = this.wompiService.verifySignature(body, headers['x-event-checksum']);
  if (!isValid) throw new UnauthorizedException('Firma inválida');

  // 2. Idempotencia — verificar si ya procesamos este evento
  const eventKey = `wompi:event:${body.data.transaction.id}`;
  const alreadyProcessed = await this.cache.get(eventKey);
  if (alreadyProcessed) return { ok: true }; // Silently skip

  // 3. Procesar según el estado
  const { transaction } = body.data;
  if (transaction.status === 'APPROVED') {
    await this.paymentsService.markPaid(transaction.reference, transaction);
    await this.cache.set(eventKey, true, 86400); // 24h TTL
  }

  return { ok: true };
}
```

### 6.4 Módulo WhatsApp

```typescript
// Cliente 360dialog:
@Injectable()
export class Dialog360Client {
  async sendMessage(params: {
    wabaToken: string;
    to: string;
    message: WhatsAppMessage;
  }): Promise<void> {
    await fetch('https://waba.360dialog.io/v1/messages', {
      method: 'POST',
      headers: {
        'D360-API-KEY': params.wabaToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to,
        type: params.message.type,
        ...params.message.content,
      }),
    });
  }
}

// Webhook handler con routing por tenant:
@Post('webhooks/whatsapp')
async handleWhatsAppWebhook(@Body() body: WAWebhookDto) {
  // Verificación del webhook de Meta
  const phoneNumberId = body.entry[0]?.changes[0]?.value?.metadata?.phone_number_id;

  // Lookup del tenant por phone_number_id
  const tenantConfig = await this.whatsappService.getTenantByPhoneNumberId(phoneNumberId);

  if (!tenantConfig) {
    // Mensaje al número compartido de la plataforma
    await this.sharedWaHandler.handle(body);
    return;
  }

  // Enrutar al schema del tenant correcto
  await this.queue.add('process-wa-message', {
    tenantId: tenantConfig.tenantId,
    schemaName: tenantConfig.schemaName,
    webhookBody: body,
  });
}
```

---

## 7. Frontend — Next.js App Router

### 7.1 Estructura de rutas y rendering

```typescript
// App Router — carpeta app/

// (app)/layout.tsx — Layout con sidebar (RSC)
export default async function AppLayout({ children }) {
  const session = await getServerSession(); // Verifica JWT en servidor
  if (!session) redirect('/login');

  return (
    <AppShell session={session}>
      {children}
    </AppShell>
  );
}

// (app)/contacts/page.tsx — Server Component
export default async function ContactsPage({ searchParams }) {
  // Data fetching en el servidor — sin loading states iniciales
  const contacts = await api.contacts.list(searchParams);

  return (
    <>
      <PageHeader title="Contactos" count={contacts.total} />
      <ContactsList initialData={contacts} /> {/* Client Component */}
    </>
  );
}

// features/contacts/components/ContactsList.tsx — Client Component
'use client';
export function ContactsList({ initialData }) {
  // TanStack Query hidrata con initialData del servidor
  const { data, isLoading } = useContacts({ initialData });

  // Maneja actualizaciones en tiempo real, filtros, sorting, etc.
  return <DataTable data={data.items} columns={contactColumns} />;
}
```

### 7.2 tRPC setup

```typescript
// apps/web/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@api/trpc/router';

export const trpc = createTRPCReact<AppRouter>();

// apps/api/src/trpc/routers/contacts.router.ts
export const contactsRouter = router({
  list: protectedProcedure
    .input(contactFiltersSchema)
    .query(async ({ ctx, input }) => {
      return ctx.contactsService.findAll(ctx.tenant.schemaName, input);
    }),

  create: protectedProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.contactsService.create(ctx.tenant.schemaName, input);
    }),

  // ...
});
```

---

## 8. Base de Datos

### 8.1 Schema público (plataforma)

```sql
-- Tablas del schema público

CREATE TABLE public.tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(63) UNIQUE NOT NULL,  -- subdominio: "acme"
    name        VARCHAR(300) NOT NULL,
    plan_id     UUID REFERENCES public.plans(id),
    schema_name VARCHAR(100) NOT NULL,        -- "tenant_acme"
    config      JSONB DEFAULT '{}',
    -- config contiene: timezone, currency, locale, limits_override
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.plans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL,         -- 'free', 'starter', 'pro', 'business'
    price_cop   INTEGER NOT NULL DEFAULT 0,   -- en centavos COP
    limits      JSONB NOT NULL
    -- {
    --   "users": 1,
    --   "contacts": 100,
    --   "invoices_per_month": 10,
    --   "workflows": 1,
    --   "whatsapp": "manual_only",
    --   "ai": false,
    --   "api_access": false,
    --   "requests_per_minute": 100
    -- }
);

CREATE TABLE public.tenant_wa_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID REFERENCES public.tenants(id) UNIQUE,
    phone_number_id     VARCHAR(100),         -- ID del número en Meta
    waba_id             VARCHAR(100),         -- WhatsApp Business Account ID
    access_token_enc    TEXT,                 -- AES-256 encrypted
    is_shared           BOOLEAN DEFAULT true, -- true = usa número compartido NexoCRM
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2 Schema por tenant (tablas core)

El esquema completo está en `apps/api/prisma/tenant-schema.prisma`. Las tablas más críticas:

```sql
-- Búsqueda full-text (crítico para UX)
CREATE INDEX idx_contacts_fts ON tenant_xxx.contacts
    USING GIN (
        to_tsvector('spanish',
            coalesce(first_name, '') || ' ' ||
            coalesce(last_name, '') || ' ' ||
            coalesce(email, '') || ' ' ||
            coalesce(document_number, '') || ' ' ||
            coalesce(phone, '')
        )
    );

-- Búsqueda en campos custom (JSONB)
CREATE INDEX idx_contacts_custom_fields ON tenant_xxx.contacts
    USING GIN (custom_fields jsonb_path_ops);

-- Búsqueda de contactos por tags
CREATE INDEX idx_contacts_tags ON tenant_xxx.contacts USING GIN (tags);

-- Embeddings de IA (pgvector)
CREATE TABLE tenant_xxx.ai_embeddings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(30) NOT NULL,   -- 'contact', 'deal', 'invoice', 'product'
    entity_id   UUID NOT NULL,
    content     TEXT NOT NULL,          -- Texto que fue embebido
    embedding   vector(1536),           -- Dimensión de text-embedding-3-small
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_entity ON tenant_xxx.ai_embeddings (entity_type, entity_id);
CREATE INDEX idx_embeddings_vector ON tenant_xxx.ai_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 8.3 Convenciones de datos colombianos

```typescript
// packages/shared-utils/currency.ts

// REGLA: Todos los montos en la BD son CENTAVOS de COP (INTEGER)
// NUNCA usar DECIMAL o FLOAT para moneda

// $100.000 COP = 10_000_000 centavos en la BD
const CENTAVOS_PER_PESO = 100;

export function toDisplayCOP(centavos: number): string {
  const pesos = centavos / CENTAVOS_PER_PESO;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pesos);
  // → "$100.000"
}

export function parseCOPInput(input: string): number {
  // El usuario escribe "100.000" o "100000" → 10_000_000 centavos
  const cleaned = input.replace(/[.$\s]/g, '');
  const pesos = parseInt(cleaned, 10);
  return pesos * CENTAVOS_PER_PESO;
}

// packages/shared-utils/nit-validator.ts
export function validateNIT(nit: string): { valid: boolean; dv: number } {
  const digits = nit.replace(/[^0-9]/g, '');
  const nitBase = digits.slice(0, -1);
  const dvProvided = parseInt(digits.slice(-1), 10);

  // Algoritmo módulo 11 de la DIAN
  const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;
  for (let i = 0; i < nitBase.length; i++) {
    sum += parseInt(nitBase[nitBase.length - 1 - i]) * primes[i];
  }
  const remainder = sum % 11;
  const dv = remainder < 2 ? remainder : 11 - remainder;

  return { valid: dv === dvProvided, dv };
}
```

---

## 9. Colas y Jobs Asíncronos

### 9.1 Configuración de colas BullMQ

```typescript
// apps/api/src/shared/queue/bull.config.ts

export const QUEUES = {
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  WHATSAPP: 'whatsapp',
  NOTIFICATIONS: 'notifications',
  AI: 'ai',
  WORKFLOWS: 'workflows',
} as const;

// Configuración de retry y backoff
export const queueOptions: QueueOptions = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: { count: 100 }, // Mantener últimos 100 jobs exitosos
    removeOnFail: { count: 500 },     // Mantener últimos 500 fallidos para debug
  },
};
```

### 9.2 Jobs críticos y sus prioridades

```
COLA: invoices
─────────────────────────────────────────────────────────────────────
emit-dian          priority: 1 (alta)   Emitir factura a DIAN
retry-dian         priority: 2          Reintento de factura rechazada
send-pdf-email     priority: 3          Enviar PDF al cliente por email
generate-pdf       priority: 5          Generar PDF local (si MATIAS no lo devuelve)

COLA: payments
─────────────────────────────────────────────────────────────────────
process-webhook    priority: 1 (alta)   Procesar webhook de Wompi
send-payment-link  priority: 3          Generar y enviar link de pago
check-pending      priority: 10         Verificar pagos pendientes (polling)

COLA: whatsapp
─────────────────────────────────────────────────────────────────────
process-inbound    priority: 1          Procesar mensaje entrante
send-message       priority: 2          Enviar mensaje saliente
send-template      priority: 2          Enviar template de cobro/factura
ai-classify        priority: 5          Clasificar intención del mensaje con IA

COLA: notifications
─────────────────────────────────────────────────────────────────────
in-app             priority: 1          Notificación WebSocket in-app
email              priority: 3          Email transaccional
push               priority: 5          Web push notification

COLA: workflows
─────────────────────────────────────────────────────────────────────
trigger-check      priority: 2          Verificar si un evento dispara workflows
execute-node       priority: 3          Ejecutar un nodo del workflow
schedule-delay     priority: 10         Programar ejecución después de un delay

COLA: ai
─────────────────────────────────────────────────────────────────────
generate-embedding priority: 5          Generar embedding de un registro nuevo
lead-score         priority: 10         Recalcular score de lead
generate-summary   priority: 5          Generar resumen de contacto pre-llamada
```

---

## 10. Real-time y WebSockets

### 10.1 Socket.io Gateway

```typescript
// apps/api/src/websocket/notifications.gateway.ts

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  transports: ['websocket', 'polling'], // Fallback a polling si WS falla
})
export class NotificationsGateway {

  @WebSocketServer()
  server: Server;

  // Al conectar, el cliente se une a su room de tenant
  @SubscribeMessage('join-tenant')
  async handleJoinTenant(client: Socket, payload: { token: string }) {
    const user = await this.authService.verifyToken(payload.token);
    const tenantRoom = `tenant:${user.tenantId}`;
    const userRoom = `user:${user.id}`;

    client.join(tenantRoom);
    client.join(userRoom);

    // Enviar notificaciones no leídas al conectar
    const unread = await this.notificationsService.getUnread(user.id);
    client.emit('notifications:unread', unread);
  }

  // Método llamado desde otros servicios para emitir eventos
  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}

// Eventos emitidos en tiempo real:
// 'notification:new'          → Nueva notificación para el usuario
// 'invoice:status-changed'    → Estado de factura cambió (aprobada/rechazada DIAN)
// 'payment:received'          → Pago recibido vía Wompi
// 'deal:moved'                → Deal movido en el pipeline (actualizar kanban)
// 'whatsapp:new-message'      → Nuevo mensaje entrante de WhatsApp
// 'contact:lead-score-updated'→ Score de lead actualizado por IA
```

---

## 11. Integraciones Externas

### 11.1 MATIAS API (DIAN)

```typescript
// apps/api/src/modules/invoices/dian/matias.client.ts

interface MatiasEmitRequest {
  // Datos del emisor (el tenant)
  issuer: {
    nit: string;
    name: string;
    taxRegime: 'RESPONSABLE_IVA' | 'NO_RESPONSABLE' | 'GRAN_CONTRIBUYENTE';
    address: string;
    city: string;
    department: string;
  };
  // Datos del receptor (el cliente)
  receiver: { ... };
  // Resolución activa
  resolution: {
    number: string;
    date: string;
    prefix: string;
    rangeFrom: number;
    rangeTo: number;
    technicalKey: string;
  };
  // Datos de la factura
  invoice: {
    number: string;
    date: string;
    dueDate: string;
    currency: 'COP';
    items: MatiasItem[];
    totals: MatiasTotals;
    paymentMethod: string;
  };
}

@Injectable()
export class MatiasClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  async emitInvoice(data: MatiasEmitRequest): Promise<MatiasResponse> {
    const response = await fetch(`${this.baseUrl}/invoices/emit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new DIANException(result.error, result.dianErrors);
    }

    return {
      status: result.status,  // 'APPROVED' | 'REJECTED'
      cufe: result.cufe,
      pdfUrl: result.pdf_url,
      xmlUrl: result.xml_url,
      dianResponse: result.dian_response,
    };
  }
}
```

### 11.2 Mapa de integraciones y sus contratos

```
INTEGRACIÓN    DIRECCIÓN    AUTENTICACIÓN     FORMATO      RETRY
─────────────────────────────────────────────────────────────────────
MATIAS (DIAN)  Outbound     API Key Bearer    JSON→XML     3x exp backoff
Wompi          Bidireccional Public/Private Key  JSON      3x exp backoff
               (webhook inbound)
360dialog WA   Bidireccional D360-API-KEY     JSON         3x exp backoff
               (webhook inbound)
Google OAuth   Outbound     OAuth 2.0 PKCE    JSON         No retry (user action)
Claude API     Outbound     API Key Bearer    JSON stream  2x (no exp — rate limits)
Resend (email) Outbound     API Key Bearer    JSON         3x exp backoff
Cloudflare R2  Outbound     AWS S3 compatible Binary/JSON  2x
```

---

## 12. Módulo de IA y RAG

### 12.1 Arquitectura RAG

```
GENERACIÓN DE EMBEDDINGS (background job)
─────────────────────────────────────────────────────────────────────
Cuando se crea/actualiza un contacto, deal, factura, producto:
  1. Job 'generate-embedding' se encola
  2. Se construye el texto descriptivo del registro:
     ej. "Contacto: Carlos Martínez. Empresa: Distribuidora ABC.
          Deal activo: Renovación 2026 por $8.500.000.
          Última actividad: llamada hace 3 días. Score: 82."
  3. Se llama a OpenAI text-embedding-3-small (1536 dims)
  4. El vector se guarda en tenant_xxx.ai_embeddings

QUERY RAG (en tiempo real para el chat asistente)
─────────────────────────────────────────────────────────────────────
Usuario pregunta: "¿Cuánto me debe Distribuidora ABC?"
  1. Se genera embedding de la pregunta
  2. similarity search en pgvector (cosine):
     SELECT entity_id, content, 1 - (embedding <=> query_vector) as similarity
     FROM ai_embeddings
     WHERE entity_type IN ('contact', 'invoice', 'payment')
     ORDER BY similarity DESC
     LIMIT 5;
  3. Los 5 resultados más relevantes se inyectan como contexto al LLM
  4. Claude responde con datos reales del tenant
```

### 12.2 Cliente Claude API

```typescript
// apps/api/src/modules/ai/claude.client.ts

@Injectable()
export class ClaudeClient {
  private readonly anthropic: Anthropic;

  async chat(params: {
    systemPrompt: string;
    userMessage: string;
    context: string[];  // Resultados del RAG
    stream?: boolean;
  }): Promise<string | ReadableStream> {

    const contextText = params.context
      .map((c, i) => `[Dato ${i + 1}]: ${c}`)
      .join('\n\n');

    const messages = [
      {
        role: 'user' as const,
        content: `${params.userMessage}\n\nInformación relevante de tu negocio:\n${contextText}`,
      },
    ];

    if (params.stream) {
      return this.anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: params.systemPrompt,
        messages,
      });
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: params.systemPrompt,
      messages,
    });

    return response.content[0].type === 'text'
      ? response.content[0].text
      : '';
  }
}
```

---

## 13. Seguridad — Vista Arquitectónica

Ver documento completo en `security.md`. Resumen de puntos clave arquitectónicos:

- **Aislamiento de tenants:** el `TenantMiddleware` garantiza que cada request solo accede al schema correcto. Tests automatizados verifican que un token de tenant A no puede acceder a datos de tenant B.
- **Tokens de terceros:** los tokens de Wompi, 360dialog y MATIAS se almacenan encriptados con AES-256. La clave maestra está en variables de entorno, nunca en el código.
- **Webhooks:** todos los webhooks verifican la firma del proveedor antes de procesar. Son idempotentes.
- **Rate limiting:** por tenant en Redis. No por IP (las IPs de las pymes pueden ser compartidas en NAT).
- **Logs:** nunca logear datos sensibles (NITs, números de cuenta, tokens). Los logs contienen IDs, no valores.

---

## 14. ADRs — Architectural Decision Records

### ADR-001: Schema-per-tenant vs. Row Level Security

**Fecha:** Marzo 2026  
**Estado:** Aprobado

**Contexto:** NexoCRM necesita aislar los datos de cada tenant. Las dos opciones principales son schema-per-tenant y Row Level Security (RLS) de PostgreSQL.

**Decisión:** Schema-per-tenant.

**Razones:**
- Aislamiento total sin riesgo de fugas por bugs en la cláusula WHERE
- Backup y restauración individual por tenant sin afectar a otros
- Posibilidad de escalar un tenant específico a su propia instancia de BD en el futuro
- Más fácil de auditar — un `SELECT * FROM contacts` en el schema incorrecto simplemente no existe

**Trade-offs aceptados:**
- Las migraciones requieren un runner que itere todos los tenants (mitigado con el script `migrate-all-tenants.ts`)
- Con > 1000 tenants, el número de schemas puede impactar el rendimiento del planner de PostgreSQL (mitigado por el límite de la infra)

---

### ADR-002: tRPC vs. REST puro vs. GraphQL

**Fecha:** Marzo 2026  
**Estado:** Aprobado

**Contexto:** El frontend Next.js necesita comunicarse con el backend NestJS. Opciones: REST, GraphQL, tRPC.

**Decisión:** tRPC para la comunicación interna Next.js ↔ NestJS, con REST para webhooks y API pública del tenant.

**Razones:**
- tRPC ofrece type-safety de extremo a extremo sin generación de código (OpenAPI, GraphQL schema, etc.)
- El refactoring es más seguro — si cambias el tipo en el backend, TypeScript te avisa en el frontend
- Para los webhooks de Wompi, DIAN y WhatsApp se usan endpoints REST estándar (los proveedores no saben de tRPC)
- La API pública para tenants (RF-12.13) usa REST con documentación OpenAPI

**Trade-offs aceptados:**
- tRPC requiere que frontend y backend estén en el mismo monorepo (o con acceso al mismo paquete de tipos) — resuelto con Turborepo

---

### ADR-003: BullMQ vs. AWS SQS para colas

**Fecha:** Marzo 2026  
**Estado:** Aprobado

**Contexto:** Los jobs asíncronos (DIAN, WhatsApp, emails) necesitan una solución de cola confiable.

**Decisión:** BullMQ sobre Redis para el MVP.

**Razones:**
- El mismo Redis ya se usa para caché y sesiones — sin infra adicional
- BullMQ tiene DX excelente con TypeScript y NestJS
- Retry automático con backoff exponencial out-of-the-box
- Dashboard de monitoreo (Bull Board) para debug en desarrollo
- Migración a SQS es posible si se necesita en escala (abstraer detrás de una interfaz `QueueService`)

---

### ADR-004: JWT RS256 vs. HS256

**Fecha:** Marzo 2026  
**Estado:** Aprobado

**Decisión:** RS256 (asimétrico) para los JWTs.

**Razones:**
- La private key solo existe en el backend — el frontend Next.js no puede firmar tokens falsos aunque sea comprometido
- En una arquitectura de microservicios futura, los servicios pueden verificar tokens con la public key sin necesitar la private key
- Railway soporta variables de entorno con pares de claves RSA sin problemas

---

### ADR-005: Modular Monolith primero, microservicios después

**Fecha:** Marzo 2026  
**Estado:** Aprobado

**Decisión:** MVP como modular monolith. Los módulos se extraen a microservicios solo cuando el volumen justifique el overhead operacional.

**Criterios de extracción:**
- El módulo de WhatsApp se extrae cuando supere 100.000 mensajes/día
- El módulo de Invoices se extrae cuando supere 50.000 facturas/mes
- El módulo de AI se extrae cuando el tiempo de procesamiento afecte el rendimiento del API principal

**Por qué no microservicios desde el inicio:**
- Overhead de red, deployments, service discovery, distributed tracing — innecesario para el MVP
- Los bounded contexts están claros desde el diseño — la extracción es mecánica cuando se necesite

---

## 15. Diagramas de Flujo Críticos

### 15.1 Flujo de autenticación con JWT

```
Cliente                    Next.js BFF              NestJS API           PostgreSQL
   │                           │                        │                     │
   │──POST /auth/login──────▶  │                        │                     │
   │                           │──validateCredentials──▶│                     │
   │                           │                        │──SELECT user────▶   │
   │                           │                        │◀─user data──────    │
   │                           │                        │──bcrypt.compare()   │
   │                           │                        │──generateTokens()   │
   │                           │◀─{accessToken,─────────│
   │                           │   refreshToken}        │                     │
   │◀─Set-Cookie: refresh_tok──│                        │                     │
   │  (httpOnly, secure)       │                        │                     │
   │◀─{accessToken}────────────│                        │                     │
   │  (stored in memory)       │                        │                     │
```

### 15.2 Flujo de facturación DIAN

```
Usuario    Frontend    API NestJS     BullMQ      MATIAS API     DIAN
  │           │             │            │              │           │
  │─[emit]──▶ │             │            │              │           │
  │           │─POST─────▶  │            │              │           │
  │           │             │─validate───│              │           │
  │           │             │─create DB──│              │           │
  │           │             │─enqueue────▶              │           │
  │           │◀─{invoice}──│            │              │           │
  │◀─[UI: Pendiente DIAN]───│            │              │           │
  │           │             │            │──process────▶│           │
  │           │             │            │              │─POST UBL──▶
  │           │             │            │              │◀─CUFE─────│
  │           │             │            │◀─{approved}──│           │
  │           │             │◀─update DB─│              │           │
  │           │             │─WebSocket──▶              │           │
  │◀─[WS: Factura aprobada]─│            │              │           │
```

---

## 16. Estrategia de Testing

Ver documento completo en `test-strategy.md`. Puntos clave:

```
PIRÁMIDE DE TESTS
─────────────────────────────────────────────────────────────────────
E2E (Playwright)        5%   → Flujos críticos: registro, emitir factura, pagar
Integration Tests       25%  → Módulos NestJS con BD real (Docker)
Unit Tests              70%  → Services, validators, utilities

TESTS OBLIGATORIOS ANTES DE MERGE A MAIN
─────────────────────────────────────────────────────────────────────
- Tests de aislamiento de tenants (que tenant A no acceda a datos de tenant B)
- Tests del calculador de impuestos colombianos (IVA, retenciones, ICA)
- Tests del validador de NIT con módulo 11
- Tests de idempotencia de webhooks (Wompi, DIAN, WhatsApp)
- Tests de manejo de errores DIAN (respuestas mock de MATIAS)
```

---

**Próximos documentos:**
- `security.md` — Modelo de amenazas, compliance Ley 1581, seguridad de pagos
- `devops.md` — CI/CD, infraestructura Railway, monitoreo

**Agente:** Architect Winston (`bmad-architect`)

---

*Documento generado por Architect Winston — BMad Enterprise Track | NexoCRM v1.0*
