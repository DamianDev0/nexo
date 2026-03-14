# NexoCRM — Project Context

**BMad Enterprise Track | Generado por: bmad-generate-project-context**

> Este documento define las convenciones técnicas que TODOS los agentes BMad
> (Dev Amelia, QA Quinn, SM Bob) deben seguir al implementar NexoCRM.
> Es la fuente de verdad para decisiones de implementación de bajo nivel.

---

## 1. Stack y Versiones (no negociables)

```
Node.js:     20.x LTS
TypeScript:  5.x strict mode (strictNullChecks, noImplicitAny)
Next.js:     14.x App Router
NestJS:      10.x
Prisma:      5.x
PostgreSQL:  16.x con pgvector
Redis:       7.x
Tailwind:    3.x
shadcn/ui:   latest (instalar componentes individualmente)
```

---

## 2. Convenciones TypeScript

```typescript
// ─── NOMBRADO ─────────────────────────────────────────────────────
// Archivos: kebab-case
// contacts.service.ts | invoice-form.tsx | nit-validator.ts

// Clases y tipos: PascalCase
class ContactsService {}
type CreateContactDto = {}
interface TenantContext {}

// Variables y funciones: camelCase
const contactsList = [];
function formatCOP(cents: number): string {}

// Constantes globales: UPPER_SNAKE_CASE
const CENTAVOS_PER_PESO = 100;
const MAX_INVOICE_ITEMS = 100;

// Enums: PascalCase con valores UPPER_SNAKE_CASE
enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING_DIAN = 'pending_dian',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  VOIDED = 'voided',
}

// ─── TIPOS ────────────────────────────────────────────────────────
// Preferir 'type' sobre 'interface' para DTOs y objetos simples
// Usar 'interface' solo cuando se necesite extensión o implementación

// ✓ Usar
type CreateContactDto = {
  firstName: string;
  lastName?: string;  // Campos opcionales con ?
  email?: string;
};

// ✓ Usar para respuestas de API con métodos
interface ContactsService {
  findAll(schemaName: string): Promise<Contact[]>;
  create(schemaName: string, dto: CreateContactDto): Promise<Contact>;
}

// ─── ASYNC/AWAIT ──────────────────────────────────────────────────
// SIEMPRE async/await, nunca .then().catch()
// Manejar errores con try/catch o con los guards de NestJS

// ✓
async function getContact(id: string): Promise<Contact> {
  const contact = await db.contact.findUnique({ where: { id } });
  if (!contact) throw new NotFoundException(`Contacto ${id} no encontrado`);
  return contact;
}

// ✗
function getContact(id: string): Promise<Contact> {
  return db.contact.findUnique({ where: { id } })
    .then(c => c || Promise.reject(new Error('not found')));
}
```

---

## 3. Convenciones NestJS

```typescript
// ─── ESTRUCTURA DE MÓDULO ─────────────────────────────────────────
// Cada módulo tiene: module, controller, service, (opcional: processor, gateway)
// Los módulos NO importan directamente otros módulos de feature
// La comunicación entre módulos es SOLO por EventBus

// ─── INYECCIÓN DE DEPENDENCIAS ────────────────────────────────────
// Siempre usar constructor injection, nunca property injection
@Injectable()
export class ContactsService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly eventBus: EventBus,
    private readonly cache: CacheService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}
}

// ─── GUARDS Y DECORATORS ──────────────────────────────────────────
// Orden SIEMPRE: @UseGuards(JwtGuard, RBACGuard) primero, luego decorators de negocio
@Controller('contacts')
@UseGuards(JwtGuard)  // Autenticación
export class ContactsController {
  @Get()
  @UseGuards(RBACGuard)
  @RequirePermission({ resource: 'contacts', action: 'read' })
  async findAll() {}
}

// ─── VALIDACIÓN DE DTOs ───────────────────────────────────────────
// Usar class-validator en DTOs de NestJS
// Los schemas Zod se usan en el BFF (Next.js) para validación del cliente
export class CreateContactDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @Matches(/^\d{10,11}$/)  // NIT sin formato
  @IsOptional()
  documentNumber?: string;
}

// ─── MANEJO DE ERRORES ────────────────────────────────────────────
// Usar las excepciones de NestJS — nunca throw new Error()
throw new NotFoundException('Contacto no encontrado');
throw new BadRequestException('El NIT no es válido');
throw new ForbiddenException('No tienes permiso para esta acción');
throw new UnprocessableEntityException({ message: 'Error DIAN', dianCode: 'FAD14' });
```

---

## 4. Convenciones Next.js

```typescript
// ─── SERVER vs CLIENT COMPONENTS ─────────────────────────────────
// REGLA: Empieza con Server Component. Agrega 'use client' SOLO si necesitas:
//   - useState, useEffect, useReducer
//   - Event handlers (onClick, onChange)
//   - Browser APIs
//   - Custom hooks que usen lo anterior
//   - Socket.io (useSocket)

// ─── DATA FETCHING ────────────────────────────────────────────────
// En Server Components: fetch directo (cacheado por Next.js)
// En Client Components: TanStack Query (no fetch manual)

// ✓ Server Component — datos iniciales
async function ContactsPage({ searchParams }) {
  const contacts = await trpcServerClient.contacts.list(searchParams);
  return <ContactsList initialData={contacts} />;
}

// ✓ Client Component — actualizaciones y interactividad
'use client';
function ContactsList({ initialData }) {
  const { data } = useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => trpc.contacts.list.query(filters),
    initialData,
  });
}

// ─── ROUTES Y LAYOUTS ─────────────────────────────────────────────
// Route groups para separar contextos sin afectar URL:
// (auth) → sin sidebar (login, registro, onboarding)
// (app)  → con sidebar (dashboard, contactos, etc.)

// ─── METADATA ─────────────────────────────────────────────────────
// Cada página exporta metadata para SEO
export const metadata: Metadata = {
  title: 'Contactos | NexoCRM',
  description: 'Gestiona tus clientes y leads',
};
```

---

## 5. Convenciones de Base de Datos

```typescript
// ─── MONEDA (REGLA CRÍTICA) ───────────────────────────────────────
// TODOS los montos en la BD son CENTAVOS de COP (integer BIGINT)
// NUNCA usar DECIMAL, FLOAT o NUMERIC para moneda
// $100.000 COP = 10_000_000 en la BD

// ─── TIMESTAMPS ───────────────────────────────────────────────────
// Todos los registros tienen created_at y updated_at como TIMESTAMPTZ
// Zona horaria: siempre UTC en BD, convertir a America/Bogota en el frontend

// ─── IDs ──────────────────────────────────────────────────────────
// Todos los IDs son UUID v4 generados por PostgreSQL (gen_random_uuid())
// NUNCA IDs secuenciales expuestos en URLs

// ─── SOFT DELETE ──────────────────────────────────────────────────
// Contactos, deals, productos: usar is_active = false (soft delete)
// Facturas: NUNCA eliminar — solo anular con nota crédito
// Usuarios: usar is_active = false

// ─── JSONB vs COLUMNAS ────────────────────────────────────────────
// Usar columnas tipadas para: datos que se buscan, filtran o hacen JOIN
// Usar JSONB para: datos variables por tenant, configuraciones, metadata
// El campo custom_fields JSONB siempre inicializado como '{}'

// ─── NOMBRES DE TABLAS Y COLUMNAS ─────────────────────────────────
// snake_case siempre
// Prefijo del schema siempre: tenant_xxx.contacts (no solo contacts)

// ─── PRISMA ───────────────────────────────────────────────────────
// Usar Prisma para queries estándar
// Usar $queryRaw para: búsqueda full-text (tsvector), queries JSONB complejos,
//   similarity search pgvector, operaciones cross-schema
```

---

## 6. Convenciones de Seguridad

```typescript
// ─── LO QUE NUNCA VA EN EL CÓDIGO ────────────────────────────────
// ❌ API keys, passwords, secrets en código fuente
// ❌ process.env.SOMETHING sin validación en startup
// ❌ console.log con datos de usuarios o tokens
// ❌ SQL concatenado con strings del usuario

// ─── VARIABLES DE ENTORNO ─────────────────────────────────────────
// Validar todas las env vars al inicio con zod:
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  ENCRYPTION_KEY: z.string().length(64),
  JWT_PRIVATE_KEY: z.string().startsWith('-----BEGIN'),
  // ...
});
const env = envSchema.parse(process.env); // Falla en startup si falta algo

// ─── LOGS ─────────────────────────────────────────────────────────
// ✓ Loguear: IDs de entidades, estados, duraciones, tenant IDs
// ✗ Nunca loguear: passwords, tokens, NITs, nombres completos, emails
```

---

## 7. Convenciones de Colombia-Específicas

```typescript
// ─── FORMATO DE FECHAS ────────────────────────────────────────────
// En la UI siempre DD/MM/AAAA — NUNCA MM/DD/YYYY
// En la API siempre ISO 8601: 2026-03-15T10:30:00-05:00
// Timezone de Colombia: America/Bogota (UTC-5, sin DST)

// ─── FORMATO DE MONEDA ────────────────────────────────────────────
// En la UI: $1.250.000 (punto como separador de miles, sin decimales)
import { formatCOP } from '@nexo/shared-utils/currency';
formatCOP(125000000) // → "$1.250.000"

// ─── NIT ──────────────────────────────────────────────────────────
// En la UI: 900.123.456-7 (con puntos y guion)
// En la BD: solo dígitos sin formato: "9001234567" y dígito_verificacion "7" separado
// La validación del DV se hace con el algoritmo módulo 11 de la DIAN
import { validateNIT } from '@nexo/shared-utils/nit-validator';

// ─── MUNICIPIOS Y DEPARTAMENTOS ───────────────────────────────────
// Lista completa en packages/shared-utils/colombia-geo.ts
// Los selects de municipio son searchable (no scroll infinito)
// El departamento se auto-selecciona cuando el usuario elige el municipio

// ─── DOCUMENTOS DE IDENTIDAD ─────────────────────────────────────
// CC (Cédula de Ciudadanía): 8-10 dígitos
// NIT: 9 dígitos + dígito verificador
// CE (Cédula de Extranjería): alfanumérico
// PP (Pasaporte): alfanumérico
// TI (Tarjeta de Identidad): menores de edad
```

---

## 8. Convenciones de Testing

```typescript
// ─── NOMBRADO DE TESTS ────────────────────────────────────────────
// Formato: describe('NombreClase/función', () => { it('should...', ...) })
describe('ContactsService', () => {
  it('should create a contact in the tenant schema', async () => {});
  it('should throw NotFoundException when contact does not exist', async () => {});
  it('should NOT return contacts from a different tenant', async () => {}); // Crítico
});

// ─── TESTS DE AISLAMIENTO DE TENANTS (OBLIGATORIOS) ──────────────
// Todo módulo que accede a la BD debe tener un test que verifique:
// "Un request autenticado como tenant A no puede leer datos de tenant B"

it('should isolate data between tenants', async () => {
  const tenantA = await createTestTenant('tenant-a');
  const tenantB = await createTestTenant('tenant-b');
  const contactInA = await createContact(tenantA, { name: 'Juan' });

  // Autenticado como tenant B, intentar leer contacto de A
  const response = await request(app)
    .get(`/contacts/${contactInA.id}`)
    .set('Authorization', `Bearer ${tenantB.token}`);

  expect(response.status).toBe(404); // No existe en el schema de B
});

// ─── MOCKS DE APIS EXTERNAS ───────────────────────────────────────
// MATIAS API: usar msw (Mock Service Worker) para simular respuestas DIAN
// Wompi: mock de webhooks con las firmas correctas
// Claude API: mock en tests, no llamar la API real en tests
```

---

## 9. Git y Pull Requests

```
BRANCH NAMING
─────────────────────────────────────────────────────────────────────
feature/E01-multitenancy-setup
bugfix/E08-dian-cufe-generation
hotfix/prod-wompi-webhook-signature
chore/upgrade-prisma-5.x

COMMIT MESSAGE (Conventional Commits)
─────────────────────────────────────────────────────────────────────
feat(contacts): add full-text search with tsvector
feat(invoices): integrate MATIAS API for DIAN emission
fix(auth): fix refresh token rotation race condition
test(invoices): add tenant isolation tests for billing module
chore(deps): upgrade prisma to 5.10
docs(architecture): update ADR-005 with new decision

PR CHECKLIST (template en .github/pull_request_template.md)
─────────────────────────────────────────────────────────────────────
☐ Tests unitarios para la lógica nueva
☐ Tests de integración si toca la BD
☐ Tests de aislamiento de tenants si es un nuevo módulo
☐ Sin secrets en el código
☐ Sin console.log con datos sensibles
☐ Tipos TypeScript sin `any` sin justificación
☐ Validación de inputs en el DTO (NestJS) o schema Zod (frontend)
☐ Error handling con excepciones de NestJS (no throw new Error())
☐ Documentación actualizada si cambia un contrato de API
```

---

*Documento generado por bmad-generate-project-context — BMad Enterprise Track | NexoCRM v1.0*
