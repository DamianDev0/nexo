# Frontend Standards — NexoCRM
# BMad Implementation Guide | Dev Agent: Amelia

> Versión: 1.0 | Marzo 2026
> Stack: Next.js 14 · TypeScript strict · Tailwind · shadcn/ui · Atomic Design · Storybook

---

## 1. Arquitectura de Carpetas — Feature-Driven + Atomic Design

```
apps/web/
├── src/
│   ├── app/                          # Next.js App Router (SOLO routing y layouts)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx            # Layout sin sidebar
│   │   │   ├── login/page.tsx        # Página — SOLO importa feature component
│   │   │   ├── register/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx            # Layout con AppShell
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── deals/page.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── ...
│   │   └── api/trpc/[trpc]/route.ts  # tRPC handler
│   │
│   ├── components/                   # COMPONENTES PUROS — sin lógica de negocio
│   │   ├── atoms/                    # Bloques indivisibles
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Badge.stories.tsx
│   │   │   │   ├── Badge.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Label/
│   │   │   ├── Spinner/
│   │   │   ├── Avatar/
│   │   │   ├── Tooltip/
│   │   │   └── ...
│   │   │
│   │   ├── molecules/                # Combinaciones de átomos
│   │   │   ├── FormField/            # Label + Input + ErrorMessage
│   │   │   ├── SearchInput/          # Input + Icon + Clear button
│   │   │   ├── StatusBadge/          # Badge con semántica de estado
│   │   │   ├── MetricCard/           # Card con label + número + delta
│   │   │   ├── EmptyState/           # Ilustración + texto + CTA
│   │   │   ├── ConfirmDialog/        # Modal de confirmación reutilizable
│   │   │   ├── CurrencyDisplay/      # Formato COP con accesibilidad
│   │   │   └── ...
│   │   │
│   │   ├── organisms/                # Secciones funcionales complejas
│   │   │   ├── AppShell/             # Layout principal con sidebar
│   │   │   ├── DataTable/            # Tabla genérica con sorting/filtering
│   │   │   ├── KanbanBoard/          # Board genérico (no acoplado a deals)
│   │   │   ├── Timeline/             # Timeline de eventos genérico
│   │   │   ├── NotificationBell/     # Bell + dropdown + WebSocket
│   │   │   ├── GlobalSearch/         # Búsqueda global con resultados
│   │   │   └── ...
│   │   │
│   │   └── templates/                # Layouts de página sin datos
│   │       ├── AuthTemplate/
│   │       ├── DashboardTemplate/
│   │       └── DetailTemplate/       # Layout de dos columnas (detail + sidebar)
│   │
│   ├── features/                     # LÓGICA DE NEGOCIO POR DOMINIO
│   │   ├── contacts/
│   │   │   ├── components/           # Componentes ESPECÍFICOS del dominio
│   │   │   │   ├── ContactCard/
│   │   │   │   ├── ContactForm/
│   │   │   │   ├── ContactTimeline/
│   │   │   │   ├── ContactStatusSelect/
│   │   │   │   └── ContactList/
│   │   │   ├── hooks/
│   │   │   │   ├── useContacts.ts    # TanStack Query hooks
│   │   │   │   ├── useContactSearch.ts
│   │   │   │   └── useContactMutations.ts
│   │   │   ├── stores/
│   │   │   │   └── contactFilters.store.ts  # Zustand — solo estado UI
│   │   │   ├── utils/
│   │   │   │   └── contact.utils.ts  # Helpers puros del dominio
│   │   │   ├── constants/
│   │   │   │   └── contact.constants.ts
│   │   │   ├── types/
│   │   │   │   └── contact.types.ts
│   │   │   └── index.ts              # Barrel export
│   │   │
│   │   ├── invoices/
│   │   │   ├── components/
│   │   │   │   ├── InvoiceForm/
│   │   │   │   ├── InvoiceStatusBanner/
│   │   │   │   ├── DIANStatusTracker/
│   │   │   │   ├── InvoiceTotals/
│   │   │   │   ├── InvoiceItemRow/
│   │   │   │   └── PaymentMethodSelector/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── utils/
│   │   │   │   └── tax-calculator.utils.ts  # Cálculos de impuestos colombianos
│   │   │   ├── constants/
│   │   │   │   └── tax-rates.constants.ts   # IVA 19%, 5%, 0%, retenciones
│   │   │   └── types/
│   │   │
│   │   ├── deals/
│   │   ├── payments/
│   │   ├── whatsapp/
│   │   ├── auth/
│   │   └── onboarding/
│   │
│   ├── hooks/                        # Hooks globales reutilizables
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useSocket.ts              # WebSocket connection
│   │   ├── usePermissions.ts         # RBAC en el frontend
│   │   ├── useTenant.ts              # Tenant context
│   │   └── useNotifications.ts
│   │
│   ├── lib/                          # Configuraciones e instancias
│   │   ├── trpc.ts                   # tRPC client
│   │   ├── queryClient.ts            # TanStack Query client
│   │   ├── socket.ts                 # Socket.io client
│   │   └── fonts.ts                  # Next font config
│   │
│   ├── store/                        # Zustand stores globales
│   │   ├── auth.store.ts             # Token de acceso en memoria
│   │   ├── ui.store.ts               # Sidebar open/close, theme
│   │   └── notifications.store.ts
│   │
│   ├── utils/                        # Utilidades puras (sin side effects)
│   │   ├── currency.utils.ts         # formatCOP, parseCOPInput
│   │   ├── date.utils.ts             # formatDate CO, fromNow
│   │   ├── nit.utils.ts              # validateNIT, formatNIT
│   │   ├── string.utils.ts           # capitalize, truncate, slugify
│   │   ├── array.utils.ts            # groupBy, sortBy, unique
│   │   └── cn.ts                     # clsx + tailwind-merge helper
│   │
│   ├── constants/                    # Constantes globales de aplicación
│   │   ├── routes.constants.ts       # ROUTES object con todas las rutas
│   │   ├── query-keys.constants.ts   # TanStack Query keys factory
│   │   ├── colombia-geo.constants.ts # 1122 municipios + 32 departamentos
│   │   ├── document-types.constants.ts  # CC, NIT, CE, PP, TI
│   │   └── permissions.constants.ts  # Matriz RBAC en el frontend
│   │
│   ├── types/                        # Types globales compartidos
│   │   ├── api.types.ts              # Tipos base de respuestas de API
│   │   ├── pagination.types.ts
│   │   └── form.types.ts
│   │
│   └── styles/
│       ├── globals.css               # Tailwind base + CSS vars
│       └── themes/
│           └── nexo.ts               # Config de colores Tailwind

```

---

## 2. Reglas de Componentes — Atomic Design

### 2.1 Regla de oro: separación estricta

```
COMPONENTE VISUAL (atom/molecule/organism)
  → Solo recibe props
  → Solo renderiza JSX
  → NUNCA tiene lógica de negocio
  → NUNCA llama a APIs directamente
  → NUNCA accede a stores directamente
  → Puede usar hooks de estilo (useMemo, useCallback para optimización)

FEATURE COMPONENT (features/*/components)
  → Puede usar hooks del dominio
  → Puede acceder a stores
  → Orquesta componentes visuales
  → Contiene lógica de presentación del dominio

PAGE (app/*/page.tsx)
  → Solo importa el feature component o template
  → Data fetching en Server Components (RSC)
  → Máximo 20 líneas
```

### 2.2 Estructura de un componente (patrón obligatorio)

```typescript
// components/molecules/MetricCard/MetricCard.tsx

// ─── IMPORTS — en este orden SIEMPRE ────────────────────────────
// 1. React y Next.js
import { type FC } from 'react'

// 2. Librerías de terceros (alfabético)
import { TrendingDown, TrendingUp } from 'lucide-react'

// 3. Componentes internos (de menor a mayor abstracción)
import { cn } from '@/utils/cn'

// 4. Types e interfaces (siempre al final de imports)
import type { MetricCardProps } from './MetricCard.types'

// ─── TYPES — en el mismo archivo si son simples, en .types.ts si son complejos ──
// Si el tipo tiene más de 5 propiedades o se reutiliza → archivo .types.ts
// Si es simple y solo se usa aquí → inline en el mismo archivo

// ─── CONSTANTS — fuera del componente ───────────────────────────
const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: null,
} as const

// ─── COMPONENT — función pura, sin lógica de negocio ────────────
export const MetricCard: FC<MetricCardProps> = ({
  label,
  value,
  trend,
  trendValue,
  className,
}) => {
  const TrendIcon = trend ? TREND_ICONS[trend] : null

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {TrendIcon && trendValue && (
        <div
          className={cn(
            'mt-2 flex items-center gap-1 text-xs',
            trend === 'up' ? 'text-success' : 'text-destructive',
          )}
        >
          <TrendIcon className="h-3 w-3" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}

// ─── DISPLAY NAME — siempre para debugging ──────────────────────
MetricCard.displayName = 'MetricCard'
```

### 2.3 Types en archivo separado (cuando son complejos)

```typescript
// components/molecules/MetricCard/MetricCard.types.ts

export interface MetricCardProps {
  /** Label descriptivo de la métrica */
  label: string
  /** Valor formateado para mostrar (ej: "$1.250.000") */
  value: string
  /** Dirección del trend comparado con el período anterior */
  trend?: 'up' | 'down' | 'neutral'
  /** Texto del trend (ej: "+15% vs mes anterior") */
  trendValue?: string
  /** Clases CSS adicionales */
  className?: string
}
```

### 2.4 Storybook — obligatorio para atoms y molecules

```typescript
// components/molecules/MetricCard/MetricCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MetricCard } from './MetricCard'

const meta: Meta<typeof MetricCard> = {
  title: 'Molecules/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof MetricCard>

export const Default: Story = {
  args: {
    label: 'Por cobrar',
    value: '$12.450.000',
    trend: 'up',
    trendValue: '+8% vs mes anterior',
  },
}

export const Overdue: Story = {
  args: {
    label: 'Vencido',
    value: '$3.750.000',
    trend: 'down',
    trendValue: '-12% vs mes anterior',
  },
}

export const NoTrend: Story = {
  args: {
    label: 'Deals activos',
    value: '24',
  },
}
```

### 2.5 Tests de componentes

```typescript
// components/molecules/MetricCard/MetricCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MetricCard } from './MetricCard'

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Por cobrar" value="$12.450.000" />)
    expect(screen.getByText('Por cobrar')).toBeInTheDocument()
    expect(screen.getByText('$12.450.000')).toBeInTheDocument()
  })

  it('shows trend icon when trend is provided', () => {
    render(
      <MetricCard
        label="Test"
        value="$1.000"
        trend="up"
        trendValue="+10%"
      />,
    )
    expect(screen.getByText('+10%')).toBeInTheDocument()
  })

  it('does not render trend section when trend is not provided', () => {
    render(<MetricCard label="Test" value="$1.000" />)
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
  })
})
```

---

## 3. Hooks — Reglas y Patrones

```typescript
// features/contacts/hooks/useContacts.ts

// ─── REGLAS DE HOOKS ─────────────────────────────────────────────
// 1. Un hook = una responsabilidad
// 2. Nombre: use + Dominio + Acción (useContactSearch, useContactCreate)
// 3. SIEMPRE tipado completamente — nunca inferencia implícita
// 4. Los hooks de fetch usan TanStack Query (nunca useState + useEffect para fetch)
// 5. Los hooks de mutación usan useMutation con onSuccess/onError tipados

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys.constants'
import { trpc } from '@/lib/trpc'
import type { Contact, ContactFilters } from '../types/contact.types'
import type { PaginatedResponse } from '@/types/api.types'

interface UseContactsOptions {
  filters?: ContactFilters
  enabled?: boolean
}

export function useContacts(
  options: UseContactsOptions = {},
): UseQueryResult<PaginatedResponse<Contact>> {
  const { filters, enabled = true } = options

  return useQuery({
    queryKey: QUERY_KEYS.contacts.list(filters),
    queryFn: () => trpc.contacts.list.query(filters ?? {}),
    enabled,
    staleTime: 30_000, // 30 segundos
  })
}
```

```typescript
// features/contacts/hooks/useContactMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/constants/query-keys.constants'
import { trpc } from '@/lib/trpc'
import type { CreateContactDto, Contact } from '../types/contact.types'

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateContactDto): Promise<Contact> =>
      trpc.contacts.create.mutate(dto),

    onSuccess: (newContact) => {
      // Invalidar la lista para refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      toast.success(`Contacto ${newContact.firstName} creado exitosamente`)
    },

    onError: (error: Error) => {
      toast.error(`Error al crear contacto: ${error.message}`)
    },
  })
}
```

---

## 4. Stores Zustand — Solo estado UI

```typescript
// features/contacts/stores/contactFilters.store.ts

// REGLA: Zustand solo para estado de UI (filtros, selecciones, preferencias)
// NUNCA para server data — eso es TanStack Query

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ContactFilters, ContactView } from '../types/contact.types'

interface ContactFiltersState {
  // Estado
  filters: ContactFilters
  view: ContactView
  selectedIds: string[]

  // Acciones — verbos claros
  setFilter: (key: keyof ContactFilters, value: unknown) => void
  clearFilters: () => void
  setView: (view: ContactView) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
}

const DEFAULT_FILTERS: ContactFilters = {
  status: undefined,
  tags: [],
  source: undefined,
  assignedTo: undefined,
  search: '',
}

export const useContactFiltersStore = create<ContactFiltersState>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,
      view: 'list',
      selectedIds: [],

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      clearFilters: () => set({ filters: DEFAULT_FILTERS }),

      setView: (view) => set({ view }),

      toggleSelection: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((i) => i !== id)
            : [...state.selectedIds, id],
        })),

      clearSelection: () => set({ selectedIds: [] }),
    }),
    {
      name: 'contact-filters',
      partialize: (state) => ({ view: state.view }), // Solo persistir la vista, no los filtros
    },
  ),
)
```

---

## 5. Utils — Funciones puras sin side effects

```typescript
// utils/currency.utils.ts

// REGLA: Todas las utils son funciones puras
// No usan estado, no tienen side effects, son 100% predecibles

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Formatea centavos COP a string legible
 * @param cents - Monto en centavos (integer)
 * @returns String formateado (ej: "$1.250.000")
 */
export function formatCOP(cents: number): string {
  const pesos = Math.round(cents) / 100
  return COP_FORMATTER.format(pesos)
}

/**
 * Parsea input del usuario a centavos
 * @param input - String del usuario (ej: "1.250.000" o "1250000")
 * @returns Centavos como integer
 */
export function parseCOPInput(input: string): number {
  const cleaned = input.replace(/[$.\s]/g, '')
  const pesos = Number.parseInt(cleaned, 10)
  if (Number.isNaN(pesos)) return 0
  return pesos * 100
}

/**
 * Convierte pesos a centavos de forma segura (sin flotantes)
 */
export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100)
}

/**
 * Convierte centavos a pesos de forma segura
 */
export function centsToPesos(cents: number): number {
  return Math.round(cents) / 100
}
```

```typescript
// utils/nit.utils.ts

/**
 * Valida un NIT colombiano usando el algoritmo módulo 11 de la DIAN
 * @param nit - NIT con o sin formato (con puntos, guión y DV o solo dígitos)
 */
export function validateNIT(nit: string): { isValid: boolean; dv: number } {
  const digits = nit.replace(/[^0-9]/g, '')
  if (digits.length < 2) return { isValid: false, dv: -1 }

  const nitBase = digits.slice(0, -1)
  const dvProvided = Number.parseInt(digits.slice(-1), 10)

  const PRIMES = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
  let sum = 0

  for (let i = 0; i < nitBase.length; i++) {
    sum += Number.parseInt(nitBase[nitBase.length - 1 - i], 10) * PRIMES[i]!
  }

  const remainder = sum % 11
  const dv = remainder < 2 ? remainder : 11 - remainder

  return { isValid: dv === dvProvided, dv }
}

/**
 * Formatea un NIT para display: 900.123.456-7
 */
export function formatNIT(nitDigits: string, dv?: string): string {
  const clean = nitDigits.replace(/[^0-9]/g, '')
  const parts = clean.match(/.{1,3}/g) ?? []
  const formatted = parts.join('.')
  return dv ? `${formatted}-${dv}` : formatted
}
```

---

## 6. Constants — Nunca valores mágicos en el código

```typescript
// constants/query-keys.constants.ts

// Query Key Factory Pattern — previene bugs de invalidación
export const QUERY_KEYS = {
  contacts: {
    all: ['contacts'] as const,
    list: (filters?: unknown) => ['contacts', 'list', filters] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
    timeline: (id: string) => ['contacts', 'timeline', id] as const,
  },
  deals: {
    all: ['deals'] as const,
    list: (pipelineId?: string) => ['deals', 'list', pipelineId] as const,
    detail: (id: string) => ['deals', 'detail', id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    list: (filters?: unknown) => ['invoices', 'list', filters] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    dashboard: () => ['payments', 'dashboard'] as const,
  },
} as const

// constants/routes.constants.ts
export const ROUTES = {
  auth: {
    login: '/login',
    register: '/register',
    onboarding: '/onboarding',
  },
  app: {
    dashboard: '/dashboard',
    contacts: {
      list: '/contacts',
      detail: (id: string) => `/contacts/${id}`,
      new: '/contacts/new',
    },
    deals: '/deals',
    invoices: {
      list: '/invoices',
      detail: (id: string) => `/invoices/${id}`,
      new: '/invoices/new',
    },
    payments: '/payments',
    whatsapp: '/whatsapp',
    settings: {
      general: '/settings/general',
      dian: '/settings/dian',
      users: '/settings/users',
    },
  },
} as const
```

---

## 7. ESLint + Prettier + Husky

### 7.1 `.eslintrc.cjs`

```javascript
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  rules: {
    // TypeScript strict
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-unused-vars': 'off', // Manejado por unused-imports

    // Imports sin usar
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],

    // Orden de imports (5 grupos en orden)
    'import/order': [
      'error',
      {
        groups: [
          'builtin',        // node:path, node:fs
          'external',       // react, next, @tanstack
          'internal',       // @/components, @/utils
          'parent',         // ../
          'sibling',        // ./
          'index',          // ./index
          'type',           // type imports
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // React
    'react/display-name': 'error',
    'react/prop-types': 'off', // TypeScript lo maneja

    // No lógica de negocio en componentes "tontos"
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
}
```

### 7.2 `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 7.3 `commitlint.config.cjs` + Husky

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',   // Nueva funcionalidad
      'fix',    // Bug fix
      'refactor', // Refactoring sin cambio de comportamiento
      'test',   // Agregar/modificar tests
      'docs',   // Documentación
      'chore',  // Cambios de herramientas, deps
      'style',  // Formato, espacios (sin cambio de lógica)
      'perf',   // Mejora de rendimiento
      'ci',     // CI/CD
    ]],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-max-length': [2, 'always', 72],
  },
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint y format solo los archivos staged
npx lint-staged

# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx --no-install commitlint --edit "$1"
```

```json
// package.json (lint-staged section)
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

---

## 8. Storybook — Configuración

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',        // Tests de accesibilidad
    '@storybook/addon-interactions', // Tests de interacción
  ],
  framework: '@storybook/nextjs',
  docs: { autodocs: 'tag' },
}

export default config
```

```typescript
// .storybook/preview.tsx
import type { Preview } from '@storybook/react'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
```

---

## 9. Reglas DRY y SOLID en Frontend

```
SINGLE RESPONSIBILITY
─────────────────────────────────────────────────────────────────────
✓ Un componente hace UNA cosa
✓ Un hook tiene UNA responsabilidad
✓ Una utility tiene UN propósito
✗ Componentes god que hacen fetch, validan, formatean Y renderizan

OPEN/CLOSED
─────────────────────────────────────────────────────────────────────
✓ Los componentes se extienden por props, no modificando el código interno
✓ Usar className prop para customización de estilos
✓ Usar children para contenido flexible
✗ Modificar un componente base para un caso de uso específico

DRY
─────────────────────────────────────────────────────────────────────
✓ Si copias código 2 veces, extraelo a una utility o componente
✓ Los query keys son factorías centralizadas (QUERY_KEYS)
✓ Los mensajes de error son constantes, no strings inline
✗ Formateo de COP duplicado en 3 componentes diferentes

NO LÓGICA EN COMPONENTES VISUALES
─────────────────────────────────────────────────────────────────────
✓ Las transformaciones de datos van en hooks o utils
✓ Las condiciones de negocio van en helpers
✗ Cálculos de impuestos inline en un componente de formulario
✗ Llamadas a API dentro de un componente visual

COMPOSICIÓN SOBRE HERENCIA
─────────────────────────────────────────────────────────────────────
✓ Componer componentes pequeños para hacer páginas complejas
✓ Usar render props o children para flexibilidad
✗ Crear BaseCard, ExtendedCard, SuperExtendedCard con herencia
```

---

## 10. Checklist de Code Review Frontend

```
ANTES DE ABRIR UN PR
─────────────────────────────────────────────────────────────────────
□ Los componentes visuales (atoms/molecules) no tienen lógica de negocio
□ Los hooks tienen una sola responsabilidad
□ No hay strings de moneda hardcodeados — siempre formatCOP()
□ No hay fechas en formato MM/DD/YYYY — siempre formatDate CO
□ Los valores mágicos son constantes con nombre descriptivo
□ Todos los atoms y molecules tienen Storybook story
□ Tests para las utils nuevas (especialmente tax-calculator y nit-validator)
□ Sin imports de 'any' — TypeScript strict sin excepciones
□ Imports en el orden correcto (eslint-plugin-import lo verifica)
□ displayName en todos los componentes
□ Sin console.log (solo console.warn/error con razón)
□ Sin TODO sin issue de GitHub asociado
```

---

*Frontend Standards — BMad Enterprise Track | NexoCRM v1.0*
