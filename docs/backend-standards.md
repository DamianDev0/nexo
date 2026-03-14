# Backend Standards — NexoCRM (NestJS)
# BMad Implementation Guide | Dev Agent: Amelia

> Versión: 1.0 | Marzo 2026
> Stack: NestJS 10 · TypeScript strict · Prisma · PostgreSQL · BullMQ · Socket.io

---

## 1. Arquitectura de Módulos — DDD + Clean Architecture

```
apps/api/src/
├── main.ts                     # Bootstrap SOLO — sin lógica
├── app.module.ts               # Root module — solo imports de módulos
│
├── modules/                    # DOMINIOS DE NEGOCIO
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Orquestador — sin lógica de dominio
│   │   │   ├── token.service.ts      # JWT creation/verification
│   │   │   └── password.service.ts   # bcrypt operations
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   └── interfaces/
│   │       ├── jwt-payload.interface.ts
│   │       └── auth-tokens.interface.ts
│   │
│   ├── contacts/
│   │   ├── contacts.module.ts
│   │   ├── controllers/
│   │   │   └── contacts.controller.ts
│   │   ├── services/
│   │   │   ├── contacts.service.ts       # Orquestador
│   │   │   ├── contacts-query.service.ts # Lecturas complejas
│   │   │   └── contacts-search.service.ts # Full-text search
│   │   ├── repositories/
│   │   │   └── contacts.repository.ts    # Abstracción de BD
│   │   ├── dto/
│   │   │   ├── create-contact.dto.ts
│   │   │   ├── update-contact.dto.ts
│   │   │   ├── contact-filters.dto.ts
│   │   │   └── contact-response.dto.ts
│   │   ├── entities/
│   │   │   └── contact.entity.ts         # Tipo de dominio
│   │   └── interfaces/
│   │       └── contact-repository.interface.ts
│   │
│   ├── invoices/
│   │   ├── invoices.module.ts
│   │   ├── controllers/
│   │   │   └── invoices.controller.ts
│   │   ├── services/
│   │   │   ├── invoices.service.ts           # Orquestador
│   │   │   ├── invoice-emission.service.ts   # Lógica de emisión DIAN
│   │   │   ├── invoice-tax.service.ts        # Cálculos tributarios CO
│   │   │   └── invoice-numbering.service.ts  # Numeración y resoluciones
│   │   ├── repositories/
│   │   │   └── invoices.repository.ts
│   │   ├── processors/
│   │   │   └── invoice.processor.ts          # BullMQ job processor
│   │   ├── clients/
│   │   │   └── factius.client.ts             # Client Factius API (DIAN)
│   │   ├── dto/
│   │   ├── entities/
│   │   └── interfaces/
│   │       └── dian-response.interface.ts
│   │
│   ├── payments/
│   ├── whatsapp/
│   ├── deals/
│   ├── companies/
│   ├── activities/
│   ├── notifications/
│   ├── automation/
│   └── tenants/
│
├── shared/                     # CÓDIGO COMPARTIDO — sin lógica de negocio
│   ├── tenant/
│   │   ├── tenant.middleware.ts
│   │   ├── tenant.context.ts         # AsyncLocalStorage context
│   │   └── tenant-db.service.ts      # Schema switching
│   │
│   ├── database/
│   │   └── prisma.service.ts
│   │
│   ├── guards/                       # Guards GENÉRICOS reutilizables
│   │   ├── jwt-auth.guard.ts
│   │   ├── rbac.guard.ts
│   │   └── plan-limit.guard.ts       # Verifica límites del plan
│   │
│   ├── decorators/                   # Decoradores GENÉRICOS reutilizables
│   │   ├── current-user.decorator.ts
│   │   ├── tenant-context.decorator.ts
│   │   ├── require-permission.decorator.ts
│   │   ├── require-plan.decorator.ts  # @RequirePlan('pro')
│   │   └── public.decorator.ts        # @Public() — excluye del JWT guard
│   │
│   ├── pipes/                        # Pipes GENÉRICOS reutilizables
│   │   ├── parse-uuid.pipe.ts
│   │   ├── parse-cop-cents.pipe.ts   # Convierte pesos → centavos
│   │   └── validate-nit.pipe.ts      # Valida NIT colombiano
│   │
│   ├── filters/                      # Exception filters globales
│   │   ├── http-exception.filter.ts
│   │   ├── prisma-exception.filter.ts
│   │   └── dian-exception.filter.ts
│   │
│   ├── interceptors/
│   │   ├── logging.interceptor.ts    # Log de requests
│   │   ├── timeout.interceptor.ts    # Timeout por endpoint
│   │   └── transform.interceptor.ts  # Envelope de respuestas
│   │
│   ├── events/
│   │   └── event-bus.service.ts
│   │
│   ├── queue/
│   │   ├── bull.config.ts
│   │   └── queue-names.enum.ts
│   │
│   ├── cache/
│   │   └── cache.service.ts          # Wrapper de Redis con tipos
│   │
│   └── interfaces/                   # Interfaces GLOBALES
│       ├── paginated-response.interface.ts
│       ├── tenant-context.interface.ts
│       └── authenticated-request.interface.ts
│
├── config/                     # Configuración tipada
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── redis.config.ts
│
└── trpc/                       # tRPC routers (si se usa)
    ├── router.ts
    └── routers/
        ├── contacts.router.ts
        └── invoices.router.ts
```

---

## 2. Reglas de Módulos — Sin Redundancia

### 2.1 Qué va en cada capa

```
CONTROLLER
─────────────────────────────────────────────────────────────────────
✓ Maneja el request HTTP y el response
✓ Aplica guards, pipes, interceptors VÍA DECORADORES
✓ Valida el DTO de entrada
✓ Llama AL SERVICE — nunca a repositorios ni clientes externos
✓ Devuelve el DTO de response
✗ NUNCA contiene lógica de negocio
✗ NUNCA tiene ifs de reglas de negocio
✗ NUNCA llama a múltiples servicios para orquestar

SERVICE (orquestador)
─────────────────────────────────────────────────────────────────────
✓ Orquesta la lógica del caso de uso
✓ Llama a repositorios, servicios de dominio y clientes externos
✓ Emite eventos al EventBus
✓ Encola jobs en BullMQ
✗ NUNCA tiene queries SQL directas (eso es del Repository)
✗ Si tiene más de ~100 líneas, extraer en servicios más pequeños

SERVICE ESPECIALIZADO
─────────────────────────────────────────────────────────────────────
invoice-tax.service.ts    → Solo cálculos de impuestos colombianos
invoice-numbering.service.ts → Solo lógica de numeración DIAN
contacts-search.service.ts → Solo búsqueda full-text

REPOSITORY
─────────────────────────────────────────────────────────────────────
✓ Única capa que accede a Prisma/BD directamente
✓ Métodos claros: findById, findAll, create, update, softDelete
✓ Maneja el switch de schema del tenant (via TenantDbService)
✗ NUNCA tiene lógica de negocio
✗ NUNCA llama a servicios externos
```

### 2.2 Estructura de un módulo (plantilla)

```typescript
// modules/contacts/contacts.module.ts

import { Module } from '@nestjs/common'
import { ContactsController } from './controllers/contacts.controller'
import { ContactsService } from './services/contacts.service'
import { ContactsQueryService } from './services/contacts-query.service'
import { ContactsSearchService } from './services/contacts-search.service'
import { ContactsRepository } from './repositories/contacts.repository'
import { SharedModule } from '@/shared/shared.module'

@Module({
  imports: [
    SharedModule, // Importar siempre SharedModule para TenantDb, Cache, EventBus
  ],
  controllers: [ContactsController],
  providers: [
    ContactsService,
    ContactsQueryService,
    ContactsSearchService,
    ContactsRepository,
  ],
  exports: [ContactsService], // Exportar solo lo que otros módulos necesitan
})
export class ContactsModule {}
```

---

## 3. Controllers — Finos y Declarativos

```typescript
// modules/contacts/controllers/contacts.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard'
import { RBACGuard } from '@/shared/guards/rbac.guard'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { RequirePermission } from '@/shared/decorators/require-permission.decorator'
import { ParseUUIDPipe } from '@/shared/pipes/parse-uuid.pipe'

import { ContactsService } from '../services/contacts.service'
import { CreateContactDto } from '../dto/create-contact.dto'
import { UpdateContactDto } from '../dto/update-contact.dto'
import { ContactFiltersDto } from '../dto/contact-filters.dto'
import { ContactResponseDto } from '../dto/contact-response.dto'
import type { AuthenticatedUser } from '@/shared/interfaces/authenticated-request.interface'
import type { TenantContext } from '@/shared/interfaces/tenant-context.interface'

@ApiTags('contacts')
@UseGuards(JwtAuthGuard, RBACGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequirePermission('contacts', 'read')
  @ApiOperation({ summary: 'Listar contactos con filtros y paginación' })
  findAll(
    @Query() filters: ContactFiltersDto,
    @TenantCtx() tenant: TenantContext,
  ): Promise<ContactResponseDto[]> {
    return this.contactsService.findAll(tenant.schemaName, filters)
  }

  @Get(':id')
  @RequirePermission('contacts', 'read')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() tenant: TenantContext,
  ): Promise<ContactResponseDto> {
    return this.contactsService.findOne(tenant.schemaName, id)
  }

  @Post()
  @RequirePermission('contacts', 'create')
  create(
    @Body() dto: CreateContactDto,
    @TenantCtx() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactResponseDto> {
    return this.contactsService.create(tenant.schemaName, dto, user.id)
  }

  @Patch(':id')
  @RequirePermission('contacts', 'update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @TenantCtx() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactResponseDto> {
    return this.contactsService.update(tenant.schemaName, id, dto, user.id)
  }

  @Delete(':id')
  @RequirePermission('contacts', 'delete')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() tenant: TenantContext,
  ): Promise<void> {
    return this.contactsService.softDelete(tenant.schemaName, id)
  }
}
```

---

## 4. Services — Claros, Pequeños, Sin Lógica Mezclada

```typescript
// modules/contacts/services/contacts.service.ts
// ORQUESTADOR — conecta las piezas, no implementa la lógica

import { Injectable, NotFoundException } from '@nestjs/common'

import { EventBus } from '@/shared/events/event-bus.service'
import { AuditService } from '@/shared/audit/audit.service'

import { ContactsRepository } from '../repositories/contacts.repository'
import type { CreateContactDto } from '../dto/create-contact.dto'
import type { UpdateContactDto } from '../dto/update-contact.dto'
import type { ContactFiltersDto } from '../dto/contact-filters.dto'
import type { ContactResponseDto } from '../dto/contact-response.dto'
import type { Contact } from '../entities/contact.entity'

@Injectable()
export class ContactsService {
  constructor(
    private readonly repo: ContactsRepository,
    private readonly eventBus: EventBus,
    private readonly audit: AuditService,
  ) {}

  async findAll(schemaName: string, filters: ContactFiltersDto): Promise<ContactResponseDto[]> {
    const contacts = await this.repo.findAll(schemaName, filters)
    return contacts.map(ContactResponseDto.fromEntity)
  }

  async findOne(schemaName: string, id: string): Promise<ContactResponseDto> {
    const contact = await this.repo.findById(schemaName, id)

    if (!contact) {
      throw new NotFoundException(`Contacto ${id} no encontrado`)
    }

    return ContactResponseDto.fromEntity(contact)
  }

  async create(
    schemaName: string,
    dto: CreateContactDto,
    createdBy: string,
  ): Promise<ContactResponseDto> {
    const contact = await this.repo.create(schemaName, { ...dto, createdBy })

    // Emitir evento — otros módulos reaccionan sin acoplamiento
    await this.eventBus.emit('contact.created', {
      schemaName,
      contactId: contact.id,
      createdBy,
    })

    await this.audit.log(schemaName, {
      action: 'contact.created',
      entityType: 'contact',
      entityId: contact.id,
      userId: createdBy,
    })

    return ContactResponseDto.fromEntity(contact)
  }

  async update(
    schemaName: string,
    id: string,
    dto: UpdateContactDto,
    updatedBy: string,
  ): Promise<ContactResponseDto> {
    const existing = await this.repo.findById(schemaName, id)
    if (!existing) throw new NotFoundException(`Contacto ${id} no encontrado`)

    const updated = await this.repo.update(schemaName, id, dto)

    await this.eventBus.emit('contact.updated', {
      schemaName,
      contactId: id,
      changes: dto,
    })

    await this.audit.log(schemaName, {
      action: 'contact.updated',
      entityType: 'contact',
      entityId: id,
      userId: updatedBy,
      oldValue: existing,
      newValue: dto,
    })

    return ContactResponseDto.fromEntity(updated)
  }

  async softDelete(schemaName: string, id: string): Promise<void> {
    const existing = await this.repo.findById(schemaName, id)
    if (!existing) throw new NotFoundException(`Contacto ${id} no encontrado`)

    await this.repo.softDelete(schemaName, id)
    await this.eventBus.emit('contact.deleted', { schemaName, contactId: id })
  }
}
```

---

## 5. Repositories — Única Capa que Toca la BD

```typescript
// modules/contacts/repositories/contacts.repository.ts

import { Injectable } from '@nestjs/common'

import { TenantDbService } from '@/shared/tenant/tenant-db.service'
import type { ContactFiltersDto } from '../dto/contact-filters.dto'
import type { Contact } from '../entities/contact.entity'

@Injectable()
export class ContactsRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(schemaName: string, filters: ContactFiltersDto): Promise<Contact[]> {
    return this.tenantDb.query(schemaName, async (db) => {
      return db.contact.findMany({
        where: this.buildWhereClause(filters),
        orderBy: [{ createdAt: 'desc' }],
        take: filters.limit ?? 50,
        skip: filters.offset ?? 0,
        include: {
          company: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      })
    })
  }

  async findById(schemaName: string, id: string): Promise<Contact | null> {
    return this.tenantDb.query(schemaName, (db) =>
      db.contact.findUnique({
        where: { id, isActive: true },
        include: {
          company: true,
          assignedTo: { select: { id: true, fullName: true } },
        },
      }),
    )
  }

  async create(schemaName: string, data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    return this.tenantDb.query(schemaName, (db) =>
      db.contact.create({ data }),
    )
  }

  async update(schemaName: string, id: string, data: Partial<Contact>): Promise<Contact> {
    return this.tenantDb.query(schemaName, (db) =>
      db.contact.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      }),
    )
  }

  async softDelete(schemaName: string, id: string): Promise<void> {
    await this.tenantDb.query(schemaName, (db) =>
      db.contact.update({
        where: { id },
        data: { isActive: false, updatedAt: new Date() },
      }),
    )
  }

  // Método privado — solo usado internamente
  private buildWhereClause(filters: ContactFiltersDto) {
    return {
      isActive: true,
      ...(filters.status && { status: filters.status }),
      ...(filters.tags?.length && { tags: { hasSome: filters.tags } }),
      ...(filters.assignedTo && { assignedToId: filters.assignedTo }),
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' as const } },
          { lastName: { contains: filters.search, mode: 'insensitive' as const } },
          { email: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    }
  }
}
```

---

## 6. DTOs — Validación y Transformación

```typescript
// modules/contacts/dto/create-contact.dto.ts
// REGLA: DTO = contrato de entrada — validación + documentación

import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

import { DocumentType } from '../entities/contact.entity'

export class CreateContactDto {
  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @Length(1, 100)
  firstName: string

  @ApiPropertyOptional({ example: 'Martínez' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string

  @ApiPropertyOptional({ example: 'carlos@distribuidoraabc.co' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email?: string

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @Matches(/^\d{10,11}$/, { message: 'El teléfono debe tener 10 u 11 dígitos' })
  phone?: string

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @Matches(/^\d{10,11}$/, { message: 'El WhatsApp debe tener 10 u 11 dígitos' })
  whatsapp?: string

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  documentNumber?: string

  @ApiPropertyOptional({ example: '05001' })  // Código DANE de Medellín
  @IsOptional()
  @IsString()
  @Length(5, 5)
  municipioCode?: string
}
```

```typescript
// modules/contacts/dto/contact-response.dto.ts
// REGLA: Response DTO = contrato de salida — transforma la entidad

import type { Contact } from '../entities/contact.entity'

export class ContactResponseDto {
  id: string
  firstName: string
  lastName: string | null
  fullName: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  status: string
  leadScore: number
  tags: string[]
  company: { id: string; name: string } | null
  assignedTo: { id: string; fullName: string; avatarUrl: string | null } | null
  createdAt: Date

  // Factory method — transforma entity → DTO
  static fromEntity(contact: Contact): ContactResponseDto {
    return {
      id: contact.id,
      firstName: contact.firstName ?? '',
      lastName: contact.lastName ?? null,
      fullName: [contact.firstName, contact.lastName].filter(Boolean).join(' '),
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      whatsapp: contact.whatsapp ?? null,
      status: contact.status,
      leadScore: contact.leadScore ?? 0,
      tags: contact.tags ?? [],
      company: contact.company ?? null,
      assignedTo: contact.assignedTo ?? null,
      createdAt: contact.createdAt,
    }
  }
}
```

---

## 7. Decoradores Genéricos — Reutilizables en toda la app

```typescript
// shared/decorators/current-user.decorator.ts
import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { AuthenticatedUser } from '../interfaces/authenticated-request.interface'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>()
    return request.user
  },
)

// shared/decorators/tenant-context.decorator.ts
import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { TenantContext } from '../interfaces/tenant-context.interface'

export const TenantCtx = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<{ tenantContext: TenantContext }>()
    return request.tenantContext
  },
)

// shared/decorators/require-permission.decorator.ts
import { SetMetadata } from '@nestjs/common'

export interface PermissionMetadata {
  resource: string
  action: 'read' | 'create' | 'update' | 'delete'
}

export const PERMISSION_KEY = 'required_permission'
export const RequirePermission = (resource: string, action: PermissionMetadata['action']) =>
  SetMetadata(PERMISSION_KEY, { resource, action })

// shared/decorators/require-plan.decorator.ts
import { SetMetadata } from '@nestjs/common'

export type PlanName = 'free' | 'starter' | 'pro' | 'business'
export const PLAN_KEY = 'required_plan'
export const RequirePlan = (...plans: PlanName[]) => SetMetadata(PLAN_KEY, plans)

// shared/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common'
export const IS_PUBLIC_KEY = 'is_public'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
```

---

## 8. Guards Genéricos — Reutilizables

```typescript
// shared/guards/rbac.guard.ts

import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { PERMISSION_KEY, type PermissionMetadata } from '../decorators/require-permission.decorator'
import { RBAC_MATRIX } from '../constants/rbac.constants'
import type { AuthenticatedUser } from '../interfaces/authenticated-request.interface'

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionMetadata | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    )

    // Si no hay permiso requerido, solo hace falta estar autenticado
    if (!required) return true

    const { user } = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>()

    return this.hasPermission(user.role, required.resource, required.action)
  }

  private hasPermission(role: string, resource: string, action: string): boolean {
    return RBAC_MATRIX[role]?.[resource]?.includes(action) ?? false
  }
}

// shared/guards/plan-limit.guard.ts

import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { PLAN_KEY, type PlanName } from '../decorators/require-plan.decorator'
import type { TenantContext } from '../interfaces/tenant-context.interface'

const PLAN_HIERARCHY: Record<PlanName, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
}

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.getAllAndOverride<PlanName[] | undefined>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPlans?.length) return true

    const request = context.switchToHttp().getRequest<{ tenantContext: TenantContext }>()
    const { plan } = request.tenantContext

    const tenantLevel = PLAN_HIERARCHY[plan as PlanName] ?? 0
    const minRequired = Math.min(...requiredPlans.map((p) => PLAN_HIERARCHY[p]))

    if (tenantLevel < minRequired) {
      throw new ForbiddenException(
        `Esta función requiere el plan ${requiredPlans.join(' o ')}. Tu plan actual es ${plan}.`,
      )
    }

    return true
  }
}
```

---

## 9. Pipes Genéricos

```typescript
// shared/pipes/parse-uuid.pipe.ts
import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common'
import { isUUID } from 'class-validator'

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException(`El ID "${value}" no tiene un formato válido`)
    }
    return value
  }
}

// shared/pipes/parse-cop-cents.pipe.ts
import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common'

@Injectable()
export class ParseCOPCentsPipe implements PipeTransform<string | number, number> {
  transform(value: string | number): number {
    const num = typeof value === 'string' ? Number.parseInt(value.replace(/[^0-9]/g, ''), 10) : value

    if (Number.isNaN(num) || num < 0) {
      throw new BadRequestException('El monto debe ser un número positivo en centavos COP')
    }

    return num
  }
}
```

---

## 10. Exception Filters — Respuestas de error estandarizadas

```typescript
// shared/filters/http-exception.filter.ts

import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

interface ErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
  path: string
  requestId?: string
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as { message: string | string[] }).message
          : exception.message,
      error:
        typeof exceptionResponse === 'object' && 'error' in exceptionResponse
          ? String((exceptionResponse as { error: string }).error)
          : HttpStatus[status] ?? 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    // No loguear 4xx como errores — son comportamiento esperado
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception.stack,
      )
    }

    response.status(status).json(errorResponse)
  }
}

// shared/filters/prisma-exception.filter.ts
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()

    const statusMap: Record<string, number> = {
      P2002: HttpStatus.CONFLICT,          // Unique constraint violation
      P2025: HttpStatus.NOT_FOUND,         // Record not found
      P2003: HttpStatus.BAD_REQUEST,       // Foreign key constraint
    }

    const messageMap: Record<string, string> = {
      P2002: 'Ya existe un registro con esos datos',
      P2025: 'El registro no fue encontrado',
      P2003: 'Error de referencia — el registro relacionado no existe',
    }

    const status = statusMap[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR
    const message = messageMap[exception.code] ?? 'Error de base de datos'

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    })
  }
}
```

---

## 11. Interceptors Genéricos

```typescript
// shared/interceptors/transform.interceptor.ts
// Envuelve TODAS las respuestas en { data, meta }

import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ResponseEnvelope<T> {
  data: T
  meta: {
    timestamp: string
    requestId?: string
  }
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
      })),
    )
  }
}

// shared/interceptors/timeout.interceptor.ts
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs: number = 30_000) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('La operación tardó demasiado'))
        }
        return throwError(() => err)
      }),
    )
  }
}
```

---

## 12. Configuración Global del App (main.ts limpio)

```typescript
// main.ts — SOLO bootstrap, sin lógica

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter'
import { TransformInterceptor } from './shared/interceptors/transform.interceptor'
import { TimeoutInterceptor } from './shared/interceptors/timeout.interceptor'
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Prefijo global de API
  app.setGlobalPrefix('api/v1')

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Elimina propiedades no en el DTO
      forbidNonWhitelisted: true, // Error si vienen propiedades extra
      transform: true,        // Transforma tipos automáticamente
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Filters globales
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter())

  // Interceptors globales
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new TransformInterceptor(),
  )

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })

  // Swagger (solo en development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NexoCRM API')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))
  }

  await app.listen(process.env.PORT ?? 3001)
}

void bootstrap()
```

---

## 13. Checklist de Code Review Backend

```
ANTES DE ABRIR UN PR
─────────────────────────────────────────────────────────────────────
□ El controller no tiene lógica de negocio (solo routing + decoradores)
□ Los servicios tienen máximo ~80 líneas — si más, extraer
□ El repository es la ÚNICA capa que toca Prisma
□ Los DTOs tienen validaciones completas con class-validator
□ Los response DTOs tienen factory method fromEntity()
□ No hay 'any' en TypeScript sin justificación documentada
□ Los guards se aplican VÍA DECORADORES, no con ifs en el service
□ Los errores son excepciones de NestJS, no throw new Error()
□ Sin lógica de negocio en los middleware
□ El EventBus se usa para comunicación entre módulos (no import directo)
□ Tests de integración para el caso de uso principal del módulo
□ Test de aislamiento de tenant si el módulo accede a la BD
□ Sin SQL raw sin sanitizar — Prisma o raw con $queryRaw correctamente
□ Los tokens/credenciales de terceros pasan por CacheService cifrado
□ Sin console.log — usar Logger de NestJS
```

---

*Backend Standards — BMad Enterprise Track | NexoCRM v1.0*
