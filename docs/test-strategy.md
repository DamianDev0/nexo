# NexoCRM — Test Strategy

**BMad Enterprise Track | Agente: QA Quinn + TEA Module (Murat)**

> Versión: 1.0 | Marzo 2026

---

## 1. Pirámide de Testing

```
           /\
          /E2E\          5%  — Playwright — flujos críticos de negocio
         /──────\
        /Integration\    25% — Vitest + Supertest + BD real (Docker)
       /──────────────\
      /   Unit Tests   \  70% — Vitest — services, validators, utilities
     /──────────────────\
```

**Framework principal:** Vitest (más rápido que Jest, nativo con ESM)  
**E2E:** Playwright  
**Mocking de APIs externas:** MSW (Mock Service Worker)

---

## 2. Tests Obligatorios (P0 — bloquean merge a main)

### 2.1 Aislamiento de tenants

```typescript
// tests/security/tenant-isolation.test.ts
// OBLIGATORIO: Todo módulo nuevo debe tener este test

describe('Tenant Isolation', () => {
  it('should NOT expose contacts from tenant A to tenant B', async () => {
    const tenantA = await createTestTenant('tenant-a');
    const tenantB = await createTestTenant('tenant-b');
    const contact = await createContact(tenantA.schemaName, { name: 'Privado' });

    const res = await request(app)
      .get(`/contacts/${contact.id}`)
      .set('Authorization', `Bearer ${tenantB.accessToken}`);

    expect(res.status).toBe(404);
  });

  it('should NOT expose invoices from tenant A to tenant B', async () => { ... });
  it('should NOT expose deals from tenant A to tenant B', async () => { ... });
  it('should NOT expose payments from tenant A to tenant B', async () => { ... });
});
```

### 2.2 Calculador de impuestos colombianos

```typescript
// tests/unit/tax-calculator.test.ts
describe('TaxCalculator', () => {
  it('should calculate IVA 19% correctly', () => {
    const result = calculateTaxes({ subtotalCents: 10_000_000, ivaRate: 0.19 });
    expect(result.ivaCents).toBe(1_900_000);
    expect(result.totalCents).toBe(11_900_000);
  });

  it('should calculate retencion en la fuente correctly', () => {
    // Retención del 2.5% sobre $1.000.000 = $25.000
    const result = calculateRetenciones({ subtotalCents: 100_000_000, concept: 'services' });
    expect(result.retRentaCents).toBe(2_500_000);
  });

  it('should handle IVA 0% (exento)', () => {
    const result = calculateTaxes({ subtotalCents: 5_000_000, ivaRate: 0 });
    expect(result.ivaCents).toBe(0);
    expect(result.totalCents).toBe(5_000_000);
  });

  it('should never use floating point for currency', () => {
    // $3.333,33 * 3 debe ser exacto
    const result = calculateTaxes({ subtotalCents: 333_333, quantity: 3 });
    expect(result.subtotalCents).toBe(999_999); // No 999999.0000001
    expect(Number.isInteger(result.subtotalCents)).toBe(true);
  });
});
```

### 2.3 Validador de NIT colombiano

```typescript
// tests/unit/nit-validator.test.ts
describe('NIT Validator', () => {
  it('should validate correct NIT with DV', () => {
    expect(validateNIT('9001234567').valid).toBe(true);
    expect(validateNIT('9001234567').dv).toBe(7);
  });

  it('should reject NIT with wrong DV', () => {
    expect(validateNIT('9001234568').valid).toBe(false); // DV incorrecto
  });

  it('should validate CC (no DV required)', () => {
    expect(validateDocumentNumber('CC', '71234567')).toBe(true);
  });
});
```

### 2.4 Idempotencia de webhooks

```typescript
// tests/integration/webhooks.test.ts
describe('Wompi Webhook Idempotency', () => {
  it('should process the same webhook twice without duplicating payment', async () => {
    const webhookPayload = createWompiWebhook({ transactionId: 'txn_001', status: 'APPROVED' });

    await request(app).post('/webhooks/wompi').send(webhookPayload);
    await request(app).post('/webhooks/wompi').send(webhookPayload); // Segundo envío

    const payments = await countPayments({ transactionId: 'txn_001' });
    expect(payments).toBe(1); // Solo 1 pago registrado
  });
});
```

---

## 3. Tests de Integración por Módulo

### Módulo de Facturación (DIAN)

```typescript
// Usar MSW para mockear MATIAS API

server.use(
  http.post('https://api.matias.com.co/invoices/emit', () => {
    return HttpResponse.json({
      status: 'APPROVED',
      cufe: 'A3B4C5D6...',
      pdf_url: 'https://...',
      xml_url: 'https://...',
    });
  })
);

describe('InvoicesService', () => {
  it('should emit invoice and mark as approved after DIAN approves', async () => {
    const invoice = await invoicesService.emit(tenantSchema, createInvoiceDto);
    // Simular procesamiento del job
    await processJob('emit-dian', { invoiceId: invoice.id });

    const updated = await invoicesService.findOne(tenantSchema, invoice.id);
    expect(updated.status).toBe('approved');
    expect(updated.cufe).toBe('A3B4C5D6...');
  });

  it('should mark invoice as rejected when DIAN rejects', async () => {
    server.use(
      http.post('https://api.matias.com.co/invoices/emit', () => {
        return HttpResponse.json({ status: 'REJECTED', dianErrors: ['FAD14'] }, { status: 400 });
      })
    );

    await invoicesService.emit(tenantSchema, createInvoiceDto);
    await processJob('emit-dian', { invoiceId: invoice.id });

    const updated = await invoicesService.findOne(tenantSchema, invoice.id);
    expect(updated.status).toBe('rejected');
  });
});
```

---

## 4. Tests E2E — Playwright (flujos críticos)

```typescript
// tests/e2e/critical-flows.spec.ts

test('Flujo completo: registro → contacto → deal → factura DIAN → link de pago', async ({ page }) => {
  // 1. Registro
  await page.goto('/register');
  await page.fill('[name="businessName"]', 'Test Company');
  await page.click('[data-testid="continue-with-google"]'); // Mock OAuth en E2E

  // 2. Onboarding wizard
  await page.selectOption('[name="sector"]', 'services');
  await page.click('[data-testid="next-step"]');
  // ... completar los 4 pasos

  // 3. Crear contacto
  await page.click('[data-testid="add-contact"]');
  await page.fill('[name="firstName"]', 'Carlos');
  await page.fill('[name="phone"]', '3001234567');
  await page.click('[data-testid="create-contact"]');

  // 4. Crear deal
  await page.click('[data-testid="create-deal"]');
  await page.fill('[name="title"]', 'Test Deal');
  await page.fill('[name="amountCop"]', '1000000');
  await page.click('[data-testid="save-deal"]');

  // 5. Emitir factura (MATIAS API mockeado en E2E)
  await page.click('[data-testid="create-invoice-from-deal"]');
  await page.click('[data-testid="emit-dian"]');

  await expect(page.getByText('Aprobada por la DIAN')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('CUFE:')).toBeVisible();

  // 6. Enviar link de pago por WhatsApp
  await page.click('[data-testid="send-whatsapp"]');
  await expect(page.getByText('Mensaje enviado')).toBeVisible();
});
```

---

## 5. Priorización P0-P3

| Prioridad | Tests | Criterio |
|-----------|-------|---------|
| **P0** | Aislamiento tenants, validación NIT, cálculo impuestos, idempotencia webhooks | Bloquean merge a main |
| **P1** | Flujos de facturación DIAN, pagos Wompi, auth JWT | Bloquean deploy a staging |
| **P2** | Tests de UI (Playwright), tests de WhatsApp | Recomendados, no bloqueantes |
| **P3** | Performance, load testing (k6) | Pre-launch beta |

---

## 6. Cobertura Mínima Requerida

```
Global:           > 70% line coverage
Módulo invoices:  > 85% (crítico legal)
Módulo payments:  > 85% (crítico financiero)
Módulo auth:      > 80%
Utils/validators: > 95% (NIT, moneda, fechas)
```

---

*Test Strategy generado por QA Quinn (TEA Module) — BMad Enterprise Track | NexoCRM v1.0*
