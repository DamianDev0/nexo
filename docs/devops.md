# NexoCRM — DevOps & Infrastructure Document

**BMad Enterprise Track | Agente: Architect Winston (Enterprise DevOps)**

> Versión: 1.0 | Marzo 2026  
> Estado: Draft

---

## 1. Entornos

| Entorno | URL | Propósito | Deploy |
|---------|-----|-----------|--------|
| Local | localhost:3000 / localhost:3001 | Desarrollo | Docker Compose manual |
| Staging | staging.nexocrm.co | QA, pruebas de integración | Auto en push a `develop` |
| Production | *.nexocrm.co | Usuarios reales | Auto en push a `main` + approval manual |

---

## 2. Docker Compose (Desarrollo Local)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: nexocrm_dev
      POSTGRES_USER: nexocrm
      POSTGRES_PASSWORD: nexocrm_dev_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  # Bull Board — UI para monitorear colas en desarrollo
  bull-board:
    image: deadly0/bull-board
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "3002:3000"
    depends_on: [redis]

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 3. Pipeline CI/CD — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD NexoCRM

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # ─── JOB 1: Calidad de código ─────────────────────────────────────
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint          # ESLint + Prettier check
      - run: npm run type-check    # tsc --noEmit
      - run: npm run test:unit     # Vitest unit tests

  # ─── JOB 2: Tests de integración ──────────────────────────────────
  integration-tests:
    runs-on: ubuntu-latest
    needs: quality
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: nexocrm_test
          POSTGRES_USER: nexocrm
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run db:migrate:test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://nexocrm:test_pass@localhost:5432/nexocrm_test
          REDIS_URL: redis://localhost:6379

  # ─── JOB 3: Tests de seguridad de aislamiento ─────────────────────
  tenant-isolation-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env: { POSTGRES_DB: nexocrm_test, POSTGRES_USER: nexocrm, POSTGRES_PASSWORD: test }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:tenant-isolation  # OBLIGATORIO antes de deploy
        env:
          DATABASE_URL: postgresql://nexocrm:test@localhost:5432/nexocrm_test

  # ─── JOB 4: Build ─────────────────────────────────────────────────
  build:
    runs-on: ubuntu-latest
    needs: tenant-isolation-tests
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            apps/web/.next/
            apps/api/dist/

  # ─── JOB 5: Deploy a Staging (develop branch) ─────────────────────
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway Staging
        run: railway up --service nexocrm-staging
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN_STAGING }}

  # ─── JOB 6: Deploy a Producción (main + approval) ─────────────────
  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production  # Requiere aprobación manual en GitHub
    steps:
      - uses: actions/checkout@v4
      - name: Run DB migrations on all tenants
        run: npm run db:migrate:all-tenants
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
      - name: Deploy to Railway Production
        run: railway up --service nexocrm-api && railway up --service nexocrm-web
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN_PRODUCTION }}
      - name: Verify deployment health
        run: |
          sleep 30
          curl -f https://api.nexocrm.co/health || exit 1
      - name: Notify team on Slack
        if: always()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text": "🚀 Deploy a producción ${{ job.status }}: ${{ github.sha }}"}'
```

---

## 4. Infraestructura Railway (MVP)

```
SERVICIOS EN RAILWAY
─────────────────────────────────────────────────────────────────────

nexocrm-api         NestJS backend
  - Runtime:        Node.js 20
  - Plan:           Starter ($5/mes) → Pro ($20/mes) cuando escale
  - Región:         US-East (más cercana a Colombia)
  - Start cmd:      node dist/main.js
  - Health check:   GET /health → 200 OK
  - Replicas:       1 (MVP) → 2+ (cuando tenga tráfico real)

nexocrm-web         Next.js frontend
  - Runtime:        Node.js 20
  - Start cmd:      node .next/standalone/server.js
  - Env:            NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL

nexocrm-postgres    PostgreSQL 16
  - Plan:           Starter (1GB storage) → Pro (cuando >50 tenants)
  - Extensiones:    pgvector, pg_trgm, uuid-ossp
  - Backups:        Diarios automáticos, retención 7 días (Railway)
  - Connection:     Pool via PgBouncer (configurar cuando >20 tenants)

nexocrm-redis       Redis 7
  - Plan:           Starter (256MB) → suficiente para MVP
  - Persistencia:   AOF enabled
  - Uso:            Cache + BullMQ queues + Socket.io adapter

Cloudflare (externo a Railway)
  - R2 bucket:      nexocrm-files (PDFs facturas, adjuntos)
  - DNS:            nexocrm.co + *.nexocrm.co (wildcard para tenants)
  - CDN:            Assets estáticos del frontend
  - DDoS:           Automático en plan Free
```

### 4.1 Variables de entorno por servicio

```bash
# nexocrm-api — Variables de entorno en Railway

# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/nexocrm
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."  # RS256 private key
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."         # RS256 public key
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=30d

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Cifrado
ENCRYPTION_KEY=64_hex_chars_random  # AES-256 key (32 bytes = 64 hex chars)

# MATIAS API (DIAN)
MATIAS_API_URL=https://api.matias.com.co
MATIAS_API_KEY=xxx
MATIAS_ENVIRONMENT=production  # sandbox | production

# Wompi
WOMPI_PUBLIC_KEY=pub_prod_xxx
WOMPI_PRIVATE_KEY=prv_prod_xxx
WOMPI_EVENTS_KEY=prod_events_xxx  # Para verificar firma de webhooks
WOMPI_WEBHOOK_URL=https://api.nexocrm.co/webhooks/wompi

# WhatsApp / 360dialog
DIALOG360_API_URL=https://waba.360dialog.io
NEXOCRM_WA_TOKEN=xxx  # Token del número compartido de NexoCRM

# IA
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx  # Para embeddings (text-embedding-3-small)

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=nexocrm-files
R2_PUBLIC_URL=https://files.nexocrm.co

# Email
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@nexocrm.co

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production

# App
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://nexocrm.co
API_URL=https://api.nexocrm.co
```

---

## 5. Monitoreo y Observabilidad

### 5.1 Health checks

```typescript
// apps/api/src/health/health.controller.ts

@Get('/health')
async health() {
  const checks = await Promise.allSettled([
    this.checkDatabase(),
    this.checkRedis(),
    this.checkMATIAS(),
    this.checkWompi(),
  ]);

  const status = checks.every(c => c.status === 'fulfilled') ? 'ok' : 'degraded';

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    checks: {
      database: checks[0].status,
      redis: checks[1].status,
      matias_api: checks[2].status,
      wompi_api: checks[3].status,
    },
  };
}
```

### 5.2 Logging estructurado

```typescript
// Todo log en formato JSON para Railway log aggregation
const logger = {
  info: (msg: string, context: Record<string, any> = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message: msg,
      timestamp: new Date().toISOString(),
      // NUNCA incluir: passwords, tokens, datos de tarjetas, NITs completos
      ...context,
    }));
  },
};

// Uso correcto:
logger.info('Invoice emitted', {
  tenantId: 'uuid',        // ✓ ID de tenant
  invoiceId: 'uuid',       // ✓ ID de factura
  status: 'approved',      // ✓ Estado
  // cufe: '...',          // ✗ NUNCA loguear el CUFE completo
  // nit: '900.123.456-7', // ✗ NUNCA NIT en texto en logs
});
```

### 5.3 Alertas automáticas

```
ALERTAS CONFIGURADAS (Railway + Sentry)
─────────────────────────────────────────────────────────────────────
Críticas (PagerDuty/WhatsApp inmediato):
  - Error rate > 5% en los últimos 5 minutos
  - Health check falla por > 2 minutos
  - Error de DIAN > 10% de las facturas en 1 hora
  - Latencia p99 > 2 segundos por 5 minutos

Altas (Slack #alerts):
  - Error rate > 1%
  - Queue backlog > 1000 jobs
  - Disco > 80% de uso
  - RAM > 85% de uso

Informativas (Slack #monitoring diario):
  - Resumen diario: facturas emitidas, pagos procesados, nuevos tenants
  - Nuevos errores de Sentry (primer occurrence)
```

---

## 6. Estrategia de Backup

```
BACKUPS DE POSTGRESQL
─────────────────────────────────────────────────────────────────────
Automáticos Railway:  Diarios, retención 7 días (plan Starter)
Manual adicional:     pg_dump diario a Cloudflare R2 (retención 30 días)
Script de backup:

  #!/bin/bash
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="nexocrm_backup_${TIMESTAMP}.sql.gz"

  pg_dump $DATABASE_URL | gzip > /tmp/$BACKUP_FILE

  # Subir a R2
  aws s3 cp /tmp/$BACKUP_FILE s3://nexocrm-backups/$BACKUP_FILE \
    --endpoint-url https://xxx.r2.cloudflarestorage.com

  echo "Backup completado: $BACKUP_FILE"

Prueba de restore:     Mensual en entorno de staging
RTO objetivo:          < 4 horas
RPO objetivo:          < 1 hora (backups automáticos de Railway son continuos en Pro)
```

---

## 7. Runbook — Procedimientos de Emergencia

### 7.1 DIAN caída (no se pueden emitir facturas)

```
PASOS:
1. Verificar status de MATIAS API: https://status.matias.com.co
2. Si MATIAS está caído: las facturas quedan en estado "pending_dian" en BD
3. Notificar a los tenants afectados por email (template pre-redactado)
4. Los jobs de BullMQ tienen retry automático cada 5 minutos (max 3 intentos)
5. Si la caída supera 2 horas: extender retry a 48 horas en el job config
6. Cuando MATIAS vuelve: los jobs pendientes se procesan automáticamente
7. Verificar que todos los "pending_dian" se resolvieron
```

### 7.2 Rollback de deploy

```bash
# Railway permite rollback a cualquier deploy anterior
railway rollback --service nexocrm-api --deployment-id <id>
railway rollback --service nexocrm-web --deployment-id <id>

# Si la migración de BD causó problemas:
# 1. Restaurar backup de antes del deploy
# 2. Ejecutar el script de rollback de la migración
# 3. Hacer rollback del código

# IMPORTANTE: Las migraciones deben ser siempre aditivas en el MVP.
# No eliminar columnas ni cambiar tipos en producción sin un proceso de 3 fases.
```

---

*Documento generado por Architect Winston — BMad Enterprise Track | NexoCRM v1.0*
