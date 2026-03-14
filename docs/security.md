# NexoCRM — Security Document

**BMad Enterprise Track | Agente: Architect Winston (Enterprise Security)**

> Versión: 1.0 | Marzo 2026  
> Estado: Draft  
> Prerrequisito: architecture.md ✅

---

## 1. Modelo de Amenazas (STRIDE)

### 1.1 Activos a proteger

| Activo | Sensibilidad | Impacto si se filtra |
|--------|-------------|----------------------|
| Datos de contactos del tenant | Alta | GDPR/Ley 1581, pérdida de confianza |
| Tokens de facturación DIAN (resoluciones) | Crítica | Fraude fiscal, responsabilidad penal |
| Tokens de Wompi (pagos) | Crítica | Fraude financiero directo |
| Tokens de WhatsApp (360dialog) | Alta | Spam masivo, bloqueo de número |
| Datos de facturas y montos | Alta | Secreto comercial, competencia |
| Tokens de acceso JWT | Alta | Acceso no autorizado a la cuenta |
| Claves de cifrado (AES-256) | Crítica | Todas las credenciales expuestas |

### 1.2 Análisis STRIDE

| Amenaza | Vector | Mitigación |
|---------|--------|------------|
| **S**poofing | JWT falsificado, suplantación de tenant | RS256 asimétrico, TenantMiddleware estricto |
| **T**ampering | Modificar datos de factura en tránsito | HTTPS/TLS 1.3 obligatorio, firma HMAC en webhooks |
| **R**epudiation | "Yo no emití esa factura" | Log de auditoría inmutable con usuario, IP y timestamp |
| **I**nformation Disclosure | Tenant A ve datos de tenant B | Schema isolation + tests de aislamiento en CI |
| **D**enial of Service | Flood de webhooks DIAN/Wompi, brute force login | Rate limiting por tenant en Redis, CAPTCHA en auth |
| **E**levation of Privilege | Sales Rep accede a configuración de facturación | RBAC granular en cada endpoint con `@RequirePermission` |

---

## 2. Autenticación y Autorización

### 2.1 JWT RS256

```
CICLO DE VIDA DE TOKENS
─────────────────────────────────────────────────────────────────────
Access Token:
  - Algoritmo:   RS256 (asimétrico)
  - Expiración:  1 hora
  - Almacenado:  Solo en memoria del cliente (NO localStorage)
  - Payload:     { sub: userId, tenantId, role, schemaName, iat, exp }

Refresh Token:
  - Formato:     opaque (UUID v4 + hash SHA-256)
  - Expiración:  30 días, rotación en cada uso
  - Almacenado:  httpOnly cookie (Secure, SameSite=Lax)
  - En BD:       Hash SHA-256 del token (nunca el token en claro)

Rotación de refresh tokens:
  - Al usar un refresh token, se invalida y se emite uno nuevo
  - Si se detecta reutilización de un refresh token ya rotado:
    INVALIDAR TODAS las sesiones del usuario (detección de robo)
```

### 2.2 RBAC — Matriz de permisos

```
PERMISOS POR ROL
─────────────────────────────────────────────────────────────────────

Resource         Owner  Admin  Manager  SalesRep  Viewer
─────────────────────────────────────────────────────────────────────
contacts:read      ✓      ✓      ✓        ✓         ✓
contacts:create    ✓      ✓      ✓        ✓         ✗
contacts:update    ✓      ✓      ✓    (own only)    ✗
contacts:delete    ✓      ✓      ✗        ✗         ✗

deals:read         ✓      ✓      ✓        ✓         ✓
deals:create       ✓      ✓      ✓        ✓         ✗
deals:update       ✓      ✓      ✓    (own only)    ✗
deals:delete       ✓      ✓      ✗        ✗         ✗

invoices:read      ✓      ✓      ✓        ✓         ✓
invoices:create    ✓      ✓      ✓        ✓         ✗
invoices:emit      ✓      ✓      ✓        ✗         ✗  ← Solo Manager+
invoices:void      ✓      ✓      ✗        ✗         ✗

payments:read      ✓      ✓      ✓        ✓         ✓
payments:create    ✓      ✓      ✓        ✗         ✗

settings:read      ✓      ✓      ✗        ✗         ✗
settings:update    ✓      ✓      ✗        ✗         ✗
settings:dian      ✓      ✗      ✗        ✗         ✗  ← Solo Owner
settings:billing   ✓      ✗      ✗        ✗         ✗  ← Solo Owner

users:read         ✓      ✓      ✓        ✗         ✗
users:invite       ✓      ✓      ✗        ✗         ✗
users:deactivate   ✓      ✗      ✗        ✗         ✗
```

### 2.3 Rate limiting

```typescript
// Configuración de rate limiting por endpoint y plan
const rateLimits = {
  // Auth endpoints (protección brute force)
  'POST /auth/login': {
    free: { max: 10, window: '15m' },    // Bloquear por 15 minutos tras 10 intentos
    all: { max: 10, window: '15m' },
  },
  'POST /auth/register': {
    all: { max: 5, window: '1h' },       // 5 registros por hora por IP
  },

  // API endpoints (por tenant según plan)
  'api:general': {
    free: { max: 100, window: '1m' },
    starter: { max: 200, window: '1m' },
    pro: { max: 500, window: '1m' },
    business: { max: 2000, window: '1m' },
  },

  // Endpoints de alto costo computacional
  'POST /ai/chat': {
    free: { max: 0 },          // No disponible en Free
    starter: { max: 10, window: '1h' },
    pro: { max: 100, window: '1h' },
    business: { max: 500, window: '1h' },
  },
};
```

---

## 3. Seguridad de Datos

### 3.1 Cifrado en reposo

```typescript
// Datos que se cifran con AES-256-GCM antes de almacenar en BD:
const ENCRYPTED_FIELDS = [
  'tenant_wa_config.access_token_enc',  // Token de 360dialog
  'payment_sources.token',              // Token de tarjeta Wompi
  'users.mfa_secret',                   // Secret TOTP del usuario
  // NIT, CC y otros datos personales NO se cifran — se buscan con índices
  // La BD en sí está cifrada en reposo (Railway/RDS encryption-at-rest)
];

// Implementación:
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Formato: iv:authTag:ciphertext (todo en hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### 3.2 Datos que NUNCA se almacenan

```
❌ NUNCA almacenar:
  - Números completos de tarjeta de crédito/débito
  - CVV/CVC de tarjetas
  - Contraseñas en texto plano (siempre bcrypt con salt rounds >= 12)
  - Claves privadas de certificados DIAN (las maneja MATIAS)
  - Tokens de acceso de terceros en texto plano (siempre cifrados)
  - Datos bancarios completos (número de cuenta, clave)
```

### 3.3 Auditoría — Log inmutable

```typescript
// Tabla de auditoría en el schema del tenant
CREATE TABLE tenant_xxx.audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID,                        -- Quién hizo la acción
    action      VARCHAR(100) NOT NULL,       -- 'invoice.emit', 'contact.delete', etc.
    entity_type VARCHAR(50),
    entity_id   UUID,
    old_value   JSONB,                       -- Estado anterior (sin datos sensibles)
    new_value   JSONB,                       -- Estado nuevo (sin datos sensibles)
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Esta tabla es INSERT-only — nunca UPDATE ni DELETE
-- Acciones que generan audit log:
-- - Emitir factura DIAN
-- - Anular factura (nota crédito)
-- - Cambiar resolución DIAN activa
-- - Registrar pago
-- - Cambiar rol de usuario
-- - Acceder a configuración de pagos
-- - Exportar datos de contactos
-- - Login/logout
-- - Cambio de contraseña
```

---

## 4. Seguridad de Integraciones

### 4.1 Verificación de webhooks

```typescript
// Todos los webhooks verifican la firma antes de procesar

// Wompi webhook verification
function verifyWompiSignature(body: any, checksum: string): boolean {
  const secret = process.env.WOMPI_EVENTS_KEY;
  const properties = [
    body.data.transaction.id,
    body.data.transaction.status,
    body.data.transaction.amount_in_cents,
    body.data.transaction.currency,
    secret,
  ].join('');

  const hash = crypto.createHash('sha256').update(properties).digest('hex');
  return hash === checksum;
}

// Meta WhatsApp webhook verification
function verifyMetaSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return `sha256=${expected}` === signature;
}
```

### 4.2 Protección contra OWASP Top 10

| Vulnerabilidad | Mitigación implementada |
|----------------|------------------------|
| A01 Broken Access Control | RBAC en cada endpoint + tenant isolation |
| A02 Cryptographic Failures | AES-256-GCM para datos sensibles, TLS 1.3, RS256 JWT |
| A03 Injection | Prisma ORM (queries parametrizados), validación con class-validator |
| A04 Insecure Design | Revisión de arquitectura con modelo de amenazas STRIDE |
| A05 Security Misconfiguration | Variables de entorno, sin defaults inseguros, headers de seguridad |
| A06 Vulnerable Components | `npm audit` en CI, Dependabot en GitHub |
| A07 Auth Failures | Rate limiting en auth, refresh token rotation, httpOnly cookies |
| A08 Integrity Failures | Verificación de firma en todos los webhooks |
| A09 Logging Failures | Audit log inmutable, no se loguean datos sensibles |
| A10 SSRF | Whitelist de dominios para webhooks outgoing del tenant |

### 4.3 Headers de seguridad HTTP

```typescript
// apps/web/next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requiere unsafe-eval en dev
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: https://r2.cloudflarestorage.com",
      "connect-src 'self' wss://*.nexocrm.co https://api.anthropic.com",
    ].join('; '),
  },
];
```

---

## 5. Compliance Colombiano

### 5.1 Ley 1581 de 2012 — Habeas Data

#### Obligaciones de NexoCRM como encargado del tratamiento

```
OBLIGACIONES LEGALES
─────────────────────────────────────────────────────────────────────

1. POLÍTICA DE PRIVACIDAD
   - Publicada en https://nexocrm.co/privacidad
   - Aceptada explícitamente en el registro (checkbox con fecha y timestamp)
   - Actualizable — el tenant recibe email cuando cambia

2. REGISTRO ANTE LA SIC
   - Registrar la base de datos de tenants en el RNBD (Registro Nacional de Bases de Datos)
   - URL: https://www.sic.gov.co/tema/proteccion-de-datos-personales
   - Responsable: Representante Legal de NexoCRM

3. DERECHOS DEL TITULAR
   Los contactos del tenant tienen derechos. El tenant es responsable de ejercerlos.
   NexoCRM provee las herramientas técnicas:
   
   - Derecho de acceso: el tenant puede exportar todos los datos de un contacto
   - Derecho de rectificación: el tenant puede editar cualquier dato
   - Derecho de supresión: botón "Eliminar datos del contacto" (anonimiza PII,
     mantiene registros de facturación para cumplimiento tributario)
   - Derecho a no ser objeto de decisiones automatizadas: el lead score
     es sugerido, no vinculante

4. MEDIDAS DE SEGURIDAD
   - Cifrado en tránsito (TLS 1.3)
   - Cifrado en reposo para datos sensibles (AES-256)
   - Control de acceso (RBAC)
   - Log de auditoría
   - Procedimiento de notificación de brechas (ver sección 5.2)

5. TRANSFERENCIA INTERNACIONAL DE DATOS
   Los servicios que procesan datos de colombianos:
   - Claude API (Anthropic, USA): datos de queries del chat asistente
   - Resend (USA): emails con nombres de contactos
   - Cloudflare R2 (global): PDFs con datos fiscales
   
   Mitigación: usar DPA (Data Processing Agreements) con cada proveedor.
   Los datos de facturación críticos (CUFE, NIT) no se envían a modelos de IA.
```

### 5.2 Procedimiento de notificación de brechas

```
PROTOCOLO DE BRECHA DE SEGURIDAD
─────────────────────────────────────────────────────────────────────

DETECCIÓN (0-2 horas):
  1. Alerta automática de Sentry / Railway logs
  2. Notificar al equipo de seguridad en Slack #security-alerts
  3. Evaluar alcance: ¿cuántos tenants afectados? ¿qué datos?

CONTENCIÓN (2-4 horas):
  1. Revocar tokens de API de los proveedores afectados
  2. Bloquear el vector de ataque (ej: deshabilitar endpoint)
  3. Hacer snapshot de la BD para preservar evidencia

NOTIFICACIÓN (< 24 horas desde detección):
  1. Notificar a la SIC: https://www.sic.gov.co
     (Formulario de incidentes de seguridad)
  2. Notificar a los tenants afectados por email
  3. Si hay datos de tarjetas expuestos: notificar a Wompi

COMUNICACIÓN AL TENANT:
  Subject: "Aviso importante sobre la seguridad de tu cuenta en NexoCRM"
  - Qué datos fueron afectados
  - Período de exposición
  - Qué acciones tomamos
  - Qué debe hacer el tenant
  - Contacto para preguntas: seguridad@nexocrm.co
```

### 5.3 Resolución 000202/2025 DIAN — Checklist de compliance

```
CHECKLIST DE COMPLIANCE DIAN
─────────────────────────────────────────────────────────────────────
☐ Formato XML UBL 2.1 válido (delegado a MATIAS para MVP)
☐ CUFE generado con SHA-384 según algoritmo oficial
☐ Representación gráfica con QR apuntando al validador DIAN
☐ Numeración dentro del rango de la resolución activa
☐ Validación previa antes de entregar al adquiriente
☐ Nota crédito para anulación (nunca eliminación)
☐ Almacenamiento del XML firmado por mínimo 5 años
☐ Proceso de actualización ante cambios de resolución (< 30 días)
☐ Manejo de certificado digital (delegado a MATIAS para MVP)
☐ Pruebas en ambiente de habilitación DIAN antes de producción
```

---

## 6. Checklist de Seguridad Pre-Launch

```
OBLIGATORIO ANTES DEL BETA
─────────────────────────────────────────────────────────────────────
☐ Tests de aislamiento de tenants (tenant A no accede a datos de B)
☐ Prueba de penetración básica (OWASP ZAP automated scan)
☐ Verificación de headers de seguridad (securityheaders.com)
☐ Verificación SSL/TLS (ssllabs.com — objetivo: A+)
☐ Audit log funcional para acciones críticas
☐ Rate limiting probado y funcionando en staging
☐ Webhook signature verification probada para Wompi y Meta
☐ DPA firmados con Anthropic, Resend, Cloudflare
☐ Política de privacidad revisada por abogado colombiano
☐ Registro ante SIC iniciado
☐ Procedimiento de respuesta a brechas documentado y probado
☐ Variables de entorno de producción separadas de staging
☐ Claves de producción nunca en el repositorio de código
☐ Backups automáticos de BD configurados y probados (restore test)
```

---

*Documento generado por Architect Winston — BMad Enterprise Track | NexoCRM v1.0*
