## Stack

Next.js 14 App Router · TypeScript strict · Tailwind · shadcn/ui · Axios · TanStack Query · Zustand · Socket.io · Jest

## Architecture

- `src/app/` — routing only, max 20 lines per page.tsx
- `src/core/config/` — axios instance (api-url.ts)
- `src/core/helpers/` — error handler, formatters
- `src/core/services/` — HTTP services per domain (auth.service.ts, contacts.service.ts, etc.)
- `src/features/` — domain logic (components, hooks, stores)
- `src/components/` — pure visual components (atoms, molecules, organisms)
- `src/hooks/` — global reusable hooks
- `src/lib/` — query-client, socket, providers
- `src/store/` — zustand global stores (auth, tenant, ui)
- `src/utils/` — pure functions (cn, currency, date)
- `src/constants/` — ROUTES, QUERY_KEYS

## Data flow

Hook → Service → API (axios). Never skip layers.

## TypeScript

- NEVER use `any`. Use `unknown` and narrow with type guards.
- NEVER use `as` type assertions unless absolutely necessary. Prefer generics.
- NEVER duplicate types. All types come from `@repo/shared-types`.
- Request/response types live in `@repo/shared-types`, not in the frontend.

## React — core rules

### Data fetching

- NEVER use `useEffect` for data fetching. Use TanStack Query.
- NEVER use `useState + useEffect` to sync server state. Use `useQuery`.
- NEVER fetch in a component body. Fetch in hooks, consume in components.

### State

- Derive state whenever possible. Don't store what you can compute.
- NEVER duplicate server state in local state. TanStack Query IS your cache.
- Use `useState` only for truly local UI state (open/close, input value).
- Lift state up only when siblings need it. Otherwise keep it local.

### Effects

- `useEffect` is for synchronization with external systems, NOT for data flow.
- If your effect sets state based on props → you need `useMemo` or derived state.
- If your effect fetches data → you need `useQuery`.
- If your effect subscribes to events → that's a valid use case.
- Every effect must have a cleanup function if it subscribes to anything.

### Rendering

- NEVER use `index` as React key. Use a unique identifier.
- NEVER create components inside other components. Define them at module level.
- NEVER use spread props blindly (`{...props}`). Be explicit about what you pass.
- Prefer early returns for loading/error states over nested ternaries.
- Use `children` prop for composition instead of config props when possible.

### Hooks

- ALWAYS use `useCallback` for functions passed as props to child components.
- ALWAYS use `useMemo` for expensive computations (sorting, filtering, mapping large arrays).
- Custom hooks must start with `use` and do ONE thing.
- Don't abstract too early — only create a custom hook when logic is reused.
- Hooks can't be conditional. Never put hooks inside if/else or loops.

### Event handlers

- Name handlers `handle` + Event: `handleSubmit`, `handleRowClick`, `handleFilterChange`.
- Props for handlers use `on` + Event: `onSubmit`, `onClick`, `onChange`.
- Extract complex handler logic to separate functions, don't inline multi-line logic.

### Conditional rendering

```tsx
// ✅ Early return pattern (preferred)
if (isLoading) return <Skeleton />
if (isError) return <ErrorState />
if (!data) return <EmptyState />
return <DataView data={data} />

// ❌ Nested ternary hell (forbidden)
return isLoading ? <Skeleton /> : isError ? <ErrorState /> : data ? <DataView /> : <EmptyState />
```

### Composition over configuration

```tsx
// ❌ Config-heavy component (hard to maintain)
<Card
  title="Revenue"
  subtitle="This month"
  icon="dollar"
  showTrend
  trendDirection="up"
  trendValue="+12%"
  footer={<Link />}
/>

// ✅ Composable component (flexible, readable)
<Card>
  <CardHeader>
    <CardTitle>Revenue</CardTitle>
    <CardDescription>This month</CardDescription>
  </CardHeader>
  <CardContent>
    <MetricValue value="$1.250.000" trend="up" trendValue="+12%" />
  </CardContent>
</Card>
```

### Server Components vs Client Components (Next.js App Router)

- Default to Server Components. Only add `'use client'` when you need interactivity.
- Server Components: layouts, pages, data display, static content.
- Client Components: forms, modals, dropdowns, anything with useState/useEffect.
- Never import a Server Component into a Client Component.
- Pass Server Component as `children` to Client Components when needed.

## Components — structure rules

### Layers

- `components/ui/` → shadcn raw primitives (auto-generated, don't modify)
- `components/atoms/` → our wrappers with added props (Button, Input, Badge, Avatar)
- `components/molecules/` → combinations of atoms (FormField, MetricCard, SearchInput)
- `components/organisms/` → complex reusable blocks (DataTable, AppShell, KanbanBoard)
- `features/*/components/` → domain-specific components with business logic

### Visual components (atoms/molecules/organisms)

- Receive ONLY props. No hooks, no stores, no API calls.
- Must be reusable across features. If it's specific to one feature, it's a feature component.
- Every atom/molecule MUST have a Storybook story.
- Accept `className` prop for style customization.

### Feature components

- Can use hooks, stores, and services.
- Handle loading/error/empty states.
- Orchestrate visual components.
- Are NOT reusable across features — they are specific to their domain.

### Pages (app/\*/page.tsx)

- Max 20 lines. Only import and render a feature component.
- No hooks, no state, no logic.
- Server Components by default.

### Props patterns

```tsx
// ✅ Destructure props in function signature
function ContactCard({ name, email, status, onClick }: ContactCardProps) { ... }

// ❌ Don't use props object
function ContactCard(props: ContactCardProps) { return <div>{props.name}</div> }

// ✅ Use Readonly for props that shouldn't be mutated
interface ContactCardProps {
  readonly name: string
  readonly email: string | null
  readonly onClick: (id: string) => void
}
```

## Styling

- NEVER hardcode colors. All colors come from CSS variables defined in globals.css.
- NEVER use inline styles. Use Tailwind classes.
- NEVER use hex/rgb values directly. Use semantic tokens: `text-foreground`, `bg-background`, `border-border`, etc.
- Design system: clean, minimal, black and white CRM aesthetic. No gradients, no shadows unless necessary.
- Use `cn()` from `@/utils/cn` for conditional classes.
- Spacing: consistent use of Tailwind spacing scale (p-4, gap-3, etc.)

## SonarQube

- Zero warnings allowed. Fix every warning before committing.
- Prefer `globalThis` over `window`.
- Prefer `Number.parseInt` over `parseInt`.
- Prefer `Number.isNaN` over `isNaN`.
- No unused variables or imports.
- No `void` operator warnings — use proper async handling.
- Cognitive complexity must stay under 15 per function.

## API calls

- All HTTP calls go through `core/services/*.service.ts`.
- Services use `apiUrl` from `core/config/api-url.ts`. Never create axios instances elsewhere.
- Services handle errors with `handleApiError` from `core/helpers/errorHandler.ts`.
- Services return typed data, never raw axios responses.
- Hooks consume services, never call axios directly.

## State management

- Server state: TanStack Query (useQuery, useMutation)
- UI state: Zustand (filters, sidebar, selections)
- NEVER put server data in Zustand. That's what TanStack Query cache is for.
- Query keys always from `constants/query-keys.constants.ts`.

## Error handling

- Services throw errors via `handleApiError()` which returns `ApiErrorResponse` from `@repo/shared-types`.
- Hooks catch errors in `onError` callbacks and show toast notifications.
- Never silently swallow errors. Either show a toast or log to console.error.

## Naming conventions

- Files: `camelCase.ts` for utils/hooks, `PascalCase.tsx` for components
- Hooks: `use` + Domain + Action (useLogin, useContacts, useContactMutations)
- Services: `domain.service.ts` (auth.service.ts, contacts.service.ts)
- Stores: `domain.store.ts` (auth.store.ts, ui.store.ts)
- Constants: `UPPER_SNAKE_CASE` for values, `camelCase` for factory functions

## What NOT to do

- Don't create wrapper components that just pass props through
- Don't use `React.FC` — use function declarations with typed props
- Don't use default exports for components — use named exports
- Don't create "utils" that have side effects — those are services
- Don't mix concerns — a hook that fetches AND transforms AND caches is doing too much

## Layer import rules

- `app/` → can only import from `features/`
- `features/` → can import from `components/`, `hooks/`, `utils/`, `constants/`, `core/`, `store/`
- `components/` → can only import from `utils/`, `constants/`, other `components/`
- `components/` → NEVER imports from `features/`, `store/`, `core/services/`
- `core/services/` → can only import from `core/config/`, `core/helpers/`, `@repo/shared-types`
- `store/` → can import from `@repo/shared-types` only

## Component layers

### Feature component (can have hooks, logic, state)

```tsx
// features/contacts/components/ContactListView.tsx
export function ContactListView() {
  const { data, isLoading, isError, refetch } = useContacts()

  if (isLoading) return <TableSkeleton />
  if (isError || !data) return <ErrorState onRetry={refetch} />

  return <DataTable columns={contactColumns} data={data.data} />
}
```

### Visual component (zero logic, zero hooks, pure props)

```tsx
// components/organisms/DataTable.tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ columns, data, onRowClick }: DataTableProps<T>) {
  return <table className="w-full">{/* pure rendering, no hooks, no API calls, no stores */}</table>
}
```

## Import order (enforced)

1. React / Next.js
2. Third-party libraries (alphabetical)
3. `@repo/*` (monorepo packages)
4. `@/*` (internal aliases)
5. Relative imports `./`

## Design system — shadcn/ui extension

### Philosophy

shadcn gives us unstyled primitives. We own the design.
Never use shadcn defaults as-is. Every token is customized in globals.css.
globals.css is the SINGLE SOURCE OF TRUTH for all visual tokens.

### shadcn component layers

shadcn raw primitives live in `components/ui/` (auto-generated, never modify).
We wrap and extend them in our atomic layers:

- `components/ui/button.tsx` → shadcn raw (don't touch)
- `components/atoms/Button/Button.tsx` → our wrapper with leftIcon, loading, variants
- `components/molecules/FormField/FormField.tsx` → Label + Input + ErrorMessage
- `components/organisms/DataTable/DataTable.tsx` → shadcn Table + TanStack Table

### Wrapping shadcn — the right way

```tsx
// components/atoms/Button/Button.tsx
import { Button as ShadButton, type ButtonProps as ShadButtonProps } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface ButtonProps extends ShadButtonProps {
  leftIcon?: React.ReactNode
  loading?: boolean
}

export function Button({
  leftIcon,
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ShadButton className={cn('gap-2', className)} disabled={disabled || loading} {...props}>
      {loading ? <Spinner className="size-4" /> : leftIcon}
      {children}
    </ShadButton>
  )
}
```

### Adding variants — always use cva, never conditionals

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent',
        soft: 'bg-primary/10 text-primary border-transparent',
        outline: 'border-border text-foreground bg-transparent',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)
```

### Typography scale (tighter than Tailwind defaults)

```
text-xs:   0.75rem   / 1rem
text-sm:   0.8125rem / 1.25rem    ← 13px, more refined
text-base: 0.9375rem / 1.5rem     ← 15px, professional feel
text-lg:   1.0625rem / 1.625rem
```

### Density system (context-dependent spacing)

```
compact:  p-2  gap-1.5  text-sm   → tables, sidebars, dropdowns
default:  p-4  gap-3    text-base → cards, forms, dialogs
relaxed:  p-6  gap-5    text-lg   → hero sections, onboarding
```

A table row is NEVER p-6. A hero section is NEVER p-2. Respect the density.

### Border radius — one personality, everywhere

```
--radius: 0.375rem (6px) — balanced modern, used globally
```

Never mix rounded-lg/xl/2xl randomly. All components inherit --radius.

### Shadows — elevation only, never decorative

```
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04)    → cards
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.06)  → dropdowns, modals
```

No box-shadow on buttons. No shadow on hover. Shadow = something is floating.

### Motion — subtle, consistent

```
All transitions: duration-150 ease-out
Hover: opacity or background shift, never transform scale
No bounce, no spring on UI elements
```

### Color tokens (globals.css)

```
--background / --foreground           → page base
--muted / --muted-foreground          → secondary text, disabled
--border / --input / --ring           → borders, inputs, focus
--primary / --primary-foreground      → main actions
--destructive / --destructive-foreground → danger actions
--accent / --accent-foreground        → highlights
```

These change per tenant when white-label branding is applied.

### Component composition toolkit

- UI primitives: shadcn (Button, Input, Dialog, Table, Select, Tabs...)
- Variants: cva() from class-variance-authority
- Conditional classes: cn() from @/utils/cn
- Data tables: shadcn Table + @tanstack/react-table
- Forms: shadcn Form + react-hook-form + zod
- Toasts: sonner (configured once in providers)
- Icons: lucide-react (consistent icon set)

### shadcn critical rules (from official skill)

#### Styling & Tailwind

- `className` for layout positioning only, never override component colors/typography
- No `space-x-*` or `space-y-*`. Use `flex` with `gap-*`. Vertical: `flex flex-col gap-*`
- Use `size-*` when width = height. `size-10` not `w-10 h-10`
- Use `truncate` shorthand. Not `overflow-hidden text-ellipsis whitespace-nowrap`
- No manual `dark:` color overrides. Use semantic tokens (`bg-background`, `text-muted-foreground`)
- Use `cn()` for conditional classes. No manual template literal ternaries
- No manual `z-index` on overlay components — Dialog, Sheet, Popover handle their own stacking

#### Forms

- Forms use react-hook-form + zod. Never manual form state
- Validation: `data-invalid` on Field wrapper, `aria-invalid` on the control
- Option sets (2-7 choices) use ToggleGroup, not Button loop with manual active state

#### Composition

- Items always inside their Group: SelectItem → SelectGroup, DropdownMenuItem → DropdownMenuGroup
- Dialog, Sheet, Drawer always need a Title (use `className="sr-only"` if visually hidden)
- Use full Card composition: CardHeader/CardTitle/CardDescription/CardContent/CardFooter
- Avatar always needs AvatarFallback for when image fails
- TabsTrigger must be inside TabsList

#### Use components, not custom markup

- Callouts → use Alert, not custom styled divs
- Loading placeholders → use Skeleton, not custom `animate-pulse` divs
- Dividers → use Separator, not `<hr>` or `<div className="border-t">`
- Status labels → use Badge, not custom styled spans
- Toasts → use sonner `toast()`, configured once

#### Icons (lucide-react)

- Icons in Button use `data-icon`: `<SearchIcon data-icon="inline-start" />`
- No sizing classes on icons inside shadcn components — CSS handles sizing

### What NOT to do with shadcn

- Never modify files inside `components/ui/` — they are auto-generated
- Never use className overrides longer than 3 utilities on a shadcn primitive — wrap it
- Never use arbitrary values `[#3a3a3a]` or `[14px]` — add to globals.css if missing
- Never install another UI library alongside shadcn (MUI, Chakra, Mantine)
- Never use Sheet + Dialog + Drawer for the same use case — pick one pattern

## Vercel performance rules (by priority)

### CRITICAL — eliminating waterfalls

- Move `await` into branches where actually used (defer-await)
- Use `Promise.all()` for independent async operations
- Use `next/dynamic` for heavy components (charts, kanban, rich editors)
- Load analytics/third-party scripts after hydration
- Preload on hover/focus for perceived speed

### HIGH — server-side

- Hoist static I/O (formatters, configs) to module level — never inside components
- Minimize data passed from Server to Client Components — serialize only what's needed
- Restructure components to parallelize data fetches, not sequential

### MEDIUM — re-render optimization

- Don't subscribe to state only used in callbacks (defer reads)
- Derive state during render, not in effects
- Use functional setState for stable callbacks: `setCount(prev => prev + 1)`
- Pass function to useState for expensive initial values: `useState(() => compute())`
- Don't wrap simple primitives in useMemo — it's overkill for booleans/strings
- Split hooks with independent dependencies into separate hooks
- Use `startTransition` for non-urgent updates (filtering, sorting)
- Use refs for transient frequent values (scroll position, mouse coords)
- NEVER define components inside other components — breaks reconciliation

### MEDIUM — rendering

- Use `content-visibility: auto` for long lists off-screen
- Extract static JSX outside components (icons, labels that never change)
- Use ternary `condition ? <A /> : <B />`, not `condition && <A />` (avoids rendering `0` or `""`)

### LOW-MEDIUM — JavaScript

- Build Map/Set for repeated lookups instead of array.find/includes
- Cache object property access in loops
- Combine multiple filter/map into one loop (reduce iterations)
- Check array length before expensive comparisons
- Return early from functions — avoid deep nesting
- Hoist RegExp creation outside loops/functions
- Use `toSorted()` for immutable sorting
- Use `flatMap` to map + filter in one pass

## CRM UI patterns

### Tables & lists

- Every list view has: search input, filters bar, bulk actions toolbar, pagination
- Tables use sticky headers, row hover highlight, and clickable rows that navigate to detail
- Empty states always have an icon, a message, and a CTA button ("Create your first contact")
- Loading states use skeleton placeholders that match the final layout, never a centered spinner
- Column widths are fixed for consistency, not auto-sized

### Detail views

- Two-column layout: main content (left 2/3) + sidebar (right 1/3)
- Sidebar shows: related entities, tags, owner, timestamps, quick actions
- Main content shows: tabs (Overview, Timeline, Activities, Deals, etc.)
- Detail header shows: entity name, status badge, primary actions (Edit, Delete, More...)
- Breadcrumbs always visible: Dashboard > Contacts > Juan Pérez

### Forms

- All forms use controlled components with react-hook-form + zod validation
- Inline validation on blur, not on every keystroke
- Submit button disabled while loading, shows spinner
- Success: toast + redirect. Error: toast + stay on form with errors highlighted
- Required fields marked with asterisk. Optional fields say "(optional)"
- Currency inputs accept "1.250.000" format and auto-format on blur
- Phone inputs accept "+57 300 123 4567" and strip formatting on submit

### Kanban (pipeline)

- Columns = pipeline stages. Cards = deals
- Drag and drop between columns triggers PATCH /deals/:id/stage
- Each card shows: deal title, value (formatted COP), contact name, days in stage
- Column header shows: stage name, deal count, total value
- Won/Lost columns are collapsed by default

### Dashboard

- Widget grid layout, user-configurable (GET/PATCH /dashboard/config)
- KPI cards at top: 4-6 cards in a row, each shows value + trend arrow + comparison
- Charts below: pipeline funnel, revenue trend line, activities bar chart
- Refresh interval configurable (default 5 min)
- All data from /dashboard endpoints, cached with TanStack Query staleTime

### Notifications

- Bell icon in header with unread badge count
- Dropdown panel shows recent notifications, grouped by today/yesterday/older
- Click on notification navigates to the related entity
- Mark as read on click, "Mark all as read" button at top
- Real-time updates via WebSocket (socket.io)

### Settings

- Left sidebar navigation within settings section
- Sections: General, Branding, Pipelines, Users, Activity Types, Custom Fields
- Changes auto-save or have explicit "Save" button with dirty state detection
- Branding preview shows live preview of logo/colors

### Multi-tenant awareness

- Tenant branding (logo, colors, product name) loaded on app init from /tenant/public
- CSS variables updated dynamically based on tenant theme
- Product name shown in sidebar header, page titles, email templates
- All API calls automatically scoped to tenant via cookie auth

### Search

- Global search in header searches across contacts, companies, deals
- Each entity list has its own local search with debounce (300ms)
- Search highlights matching text in results
- Recent searches saved in localStorage

### Bulk actions

- Checkbox column in every table for multi-select
- Floating action bar appears at bottom when items selected
- Actions: Assign, Tag, Delete, Export
- Confirmation dialog for destructive actions

### Permissions (RBAC)

- UI elements hidden based on user role, never just disabled
- Use `usePermissions()` hook that reads from auth store
- Routes protected by role in middleware
- API will return 403 anyway, but UI should prevent the attempt

### Accessibility

- All interactive elements keyboard-navigable (Tab, Enter, Escape)
- Focus traps in modals and dropdowns
- aria-labels on icon-only buttons
- Color contrast meets WCAG AA (4.5:1 for text)
- Toast notifications have role="alert"

### Performance

- List views virtualized for 1000+ rows (use @tanstack/react-virtual)
- Images lazy-loaded with Next.js Image component
- Route-level code splitting (Next.js App Router does this automatically)
- Prefetch next page on link hover
- Debounce search inputs, throttle scroll handlers

### Responsive

- Desktop-first design (CRMs are primarily desktop tools)
- Sidebar collapses to icons on medium screens
- Tables switch to card view on mobile
- Kanban scrolls horizontally on mobile
- Minimum supported width: 768px (tablet)

## Performance — imports, instantiation, rendering

### Dynamic imports — load heavy components only when needed

```tsx
// ❌ Wrong — KanbanBoard loads even if user never visits deals page
import { KanbanBoard } from '@/components/organisms/KanbanBoard'

// ✅ Correct — loads only when rendered
import dynamic from 'next/dynamic'
const KanbanBoard = dynamic(() =>
  import('@/components/organisms/KanbanBoard').then((m) => m.KanbanBoard),
)
```

Use dynamic imports for: charts, kanban, rich text editors, modals with heavy content, PDF viewers.
Do NOT use dynamic imports for: buttons, inputs, layout components, anything above the fold.

### Single instantiation — never create inside components

```tsx
// ❌ Wrong — new Intl.NumberFormat created on EVERY render
function PriceDisplay({ cents }: { cents: number }) {
  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })
  return <span>{formatter.format(cents / 100)}</span>
}

// ✅ Correct — formatter created ONCE at module level
const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

function PriceDisplay({ cents }: { cents: number }) {
  return <span>{COP_FORMATTER.format(cents / 100)}</span>
}
```

This applies to: Intl formatters, RegExp, static Maps/Sets, cva() variants, column definitions.

### Constants outside components — never inside

```tsx
// ❌ Wrong — array recreated every render, causes child re-renders
function ContactFilters() {
  const statusOptions = [
    { label: 'New', value: 'new' },
    { label: 'Qualified', value: 'qualified' },
  ]
  return <Select options={statusOptions} />
}

// ✅ Correct — defined once, referentially stable
const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Qualified', value: 'qualified' },
] as const

function ContactFilters() {
  return <Select options={STATUS_OPTIONS} />
}
```

### Memoization — use when it matters, not everywhere

```tsx
// ✅ useMemo for expensive computed values
const sortedContacts = useMemo(
  () => contacts.sort((a, b) => a.lastName.localeCompare(b.lastName)),
  [contacts],
)

// ✅ useCallback for functions passed as props
const handleRowClick = useCallback(
  (id: string) => {
    router.push(ROUTES.app.contacts.detail(id))
  },
  [router],
)

// ❌ Don't memoize simple values or inline functions that aren't passed as props
const fullName = useMemo(() => `${first} ${last}`, [first, last]) // overkill
```

### React.lazy boundaries — group by route

```tsx
// src/app/(app)/deals/page.tsx
import dynamic from 'next/dynamic'
const DealsView = dynamic(() =>
  import('@/features/deals/components/DealsView').then((m) => m.DealsView),
)

export default function DealsPage() {
  return <DealsView />
}
```

Each page is its own code-split boundary. Heavy features don't bloat other routes.

### Re-render prevention checklist

- Object/array props: define outside component or wrap in useMemo
- Function props: wrap in useCallback
- Context providers: split into separate contexts (auth, ui, tenant) — never one giant provider
- List rendering: always use unique `key`, never index
- Large lists (500+ items): use @tanstack/react-virtual

### What to NEVER instantiate inside a component

- axios instances → use `apiUrl` singleton from core/config
- QueryClient → created once in providers.tsx
- Socket connections → use `getSocket()` singleton from lib/socket
- Formatters (Intl, DateTimeFormat) → module-level constants in utils/
- Zod schemas → module-level constants in feature schemas/
- Column definitions (TanStack Table) → module-level constants
- cva() variant definitions → module-level constants
