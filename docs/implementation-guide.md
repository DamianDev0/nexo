# NexoCRM — Guía de Implementación BMad (Paso a Paso)

> Este documento define EXACTAMENTE cómo ejecutar el ciclo de implementación BMad
> con todos los documentos de planeación ya generados.

---

## Setup inicial (una sola vez)

```bash
# 1. Crear el repo
git init nexo-crm && cd nexo-crm

# 2. Instalar BMad
npx bmad-method install
# → Seleccionar: BMad Method + TEA (testing)

# 3. Copiar los artefactos de planeación
mkdir -p _bmad-output/planning-artifacts/epics
cp PRD.md _bmad-output/planning-artifacts/
cp ux-design.md _bmad-output/planning-artifacts/
cp architecture.md _bmad-output/planning-artifacts/
cp security.md _bmad-output/planning-artifacts/
cp devops.md _bmad-output/planning-artifacts/
cp project-context.md _bmad-output/
cp frontend-standards.md _bmad-output/planning-artifacts/
cp backend-standards.md _bmad-output/planning-artifacts/
cp epics.md _bmad-output/planning-artifacts/epics/
cp test-strategy.md _bmad-output/planning-artifacts/
cp sprint-status.yaml _bmad-output/implementation-artifacts/

# 4. Verificar en Claude Code / Cursor
bmad-help  # → Debe detectar todos los artefactos y guiarte al Sprint 1
```

---

## El Ciclo de Implementación BMad (por cada story)

```
┌─────────────────────────────────────────────────────────────────┐
│  CICLO PARA CADA STORY (fresh chat cada vez)                    │
│                                                                  │
│  1. SM Bob  → bmad-create-story  → Crea el archivo story        │
│  2. Dev Amelia → bmad-dev-story  → Implementa el código         │
│  3. Dev Amelia → bmad-code-review → Valida la calidad           │
│  (Repetir para cada story del sprint)                           │
│                                                                  │
│  Al terminar todas las stories del sprint:                      │
│  4. SM Bob  → bmad-retrospective → Retrospectiva del sprint     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sprint 1 — Stories en orden de ejecución

### Story 1: E-01-S01 — Multitenancy
```
FRESH CHAT #1:
  bmad-sm → bmad-create-story → E-01-S01

FRESH CHAT #2:
  bmad-dev → bmad-dev-story
  (lee: architecture.md + backend-standards.md + project-context.md)

FRESH CHAT #3:
  bmad-dev → bmad-code-review
```

### Story 2: E-01-S02 — Migration runner
```
FRESH CHAT #4: bmad-sm → bmad-create-story → E-01-S02
FRESH CHAT #5: bmad-dev → bmad-dev-story
FRESH CHAT #6: bmad-dev → bmad-code-review
```

### Story 3: E-02-S01 — Login + JWT
```
FRESH CHAT #7:  bmad-sm → bmad-create-story → E-02-S01
FRESH CHAT #8:  bmad-dev → bmad-dev-story
FRESH CHAT #9:  bmad-dev → bmad-code-review
```

### Story 4: E-02-S02 — Google OAuth
```
FRESH CHAT #10: bmad-sm → bmad-create-story → E-02-S02
FRESH CHAT #11: bmad-dev → bmad-dev-story
FRESH CHAT #12: bmad-dev → bmad-code-review
```

### Retrospectiva Sprint 1
```
FRESH CHAT #13: bmad-sm → bmad-retrospective
```

---

## Qué debe generar Dev Amelia en cada story del backend

Siguiendo `backend-standards.md`, para cada módulo:

```
modules/{feature}/
  ├── {feature}.module.ts
  ├── controllers/
  │   └── {feature}.controller.ts     ← Solo routing + decoradores
  ├── services/
  │   ├── {feature}.service.ts        ← Orquestador
  │   └── {feature}-*.service.ts      ← Servicios especializados si necesario
  ├── repositories/
  │   └── {feature}.repository.ts     ← ÚNICA capa con Prisma
  ├── dto/
  │   ├── create-{feature}.dto.ts
  │   ├── update-{feature}.dto.ts
  │   └── {feature}-response.dto.ts   ← Con factory fromEntity()
  ├── entities/
  │   └── {feature}.entity.ts
  └── interfaces/
      └── {feature}-*.interface.ts
```

## Qué debe generar Dev Amelia en cada story del frontend

Siguiendo `frontend-standards.md`:

```
features/{feature}/
  ├── components/
  │   ├── {Component}/
  │   │   ├── {Component}.tsx         ← Sin lógica de negocio
  │   │   ├── {Component}.types.ts
  │   │   ├── {Component}.stories.tsx ← Storybook obligatorio
  │   │   ├── {Component}.test.tsx    ← Tests del componente
  │   │   └── index.ts
  ├── hooks/
  │   ├── use{Feature}.ts             ← TanStack Query
  │   └── use{Feature}Mutations.ts    ← useMutation
  ├── stores/
  │   └── {feature}.store.ts          ← Solo estado UI
  ├── utils/
  │   └── {feature}.utils.ts
  ├── constants/
  │   └── {feature}.constants.ts
  └── types/
      └── {feature}.types.ts
```

---

## Comandos de referencia rápida

```bash
# Iniciar sprint
bmad-sm → SP (Sprint Planning)

# Por cada story:
bmad-sm → CS (Create Story) → nombre de la story
bmad-dev → DS (Dev Story)
bmad-dev → CR (Code Review)

# Al terminar el sprint:
bmad-sm → ER (Epic Retrospective)

# Si hay que cambiar el curso:
bmad-sm → CC (Correct Course)
bmad-pm → CC (Correct Course desde Product)
```

---

## Acciones ANTES de codificar (semana 1)

```
□ Registro en Factius API (equivalente a MATIAS para DIAN) — sandbox
  → https://www.factius.com.co/api
  → Obtener API key de sandbox
  → Actualizar architecture.md con el endpoint correcto

□ Registro en Wompi — sandbox
  → https://docs.wompi.co
  → Obtener pub_test_xxx y prv_test_xxx

□ Registro en 360dialog — sandbox
  → https://docs.360dialog.com
  → Obtener D360-API-KEY de prueba

□ Crear proyecto en Railway
  → Crear servicios: api, web, postgres (con pgvector), redis

□ Configurar GitHub Actions
  → Conectar Railway con el repo

□ Hablar con 5 pymes en Medellín antes de la semana 3
```

---

*Guía de implementación BMad | NexoCRM v1.0*
