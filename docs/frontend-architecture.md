# Frontend Architecture — NexoCRM

> Version: 2.0 | July 2026
> Status: **Active — source of truth for the frontend**
> Supersedes the frontend sections of `architecture.md` (v1.0, BMad draft) and `frontend-standards.md` wherever they conflict.
> Real stack: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · FSD

---

## 0. Guiding principle

> The frontend is a **thin presentation layer** over a domain owned by the backend (NestJS).
> It renders with Server Components, mutates with Server Actions, organizes itself with Feature-Sliced Design,
> and mirrors the backend's ubiquitous language in `entities/` without duplicating its domain logic.

Three models coexist without fighting:

| Model             | Purpose                                  | Where it lives                                                                 |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| **FSD**           | Organize by domain + purpose             | Folder structure (`shared`, `entities`, `features`, `widgets`, `views`, `app`) |
| **DDD mirror**    | Mirror the backend's ubiquitous language | `entities/<x>/model/*.types.ts` with branded types + parse                     |
| **Atomic Design** | Classify UI by complexity                | Categorization inside `shared/ui/`                                             |

When they clash, **FSD wins**: a component that knows the domain belongs in `entities/`, even if Atomic-wise it's a molecule.

---

## 1. Current state (July 2026 audit)

`src/` = 14,077 lines, 168 files. Only ~48 files are reachable from a route.

### 1.1 Critical findings

| #   | Finding                                                                                                                            | Evidence                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **28% of the code is dead** — 46 files ≈ 3,900 lines with zero inbound imports                                                     | 35 shadcn primitives never used; entire `organisms/DataTable/` (9 files, 730 lines); entire `components/templates/` (5 files); entire `features/landing/` slice (299 lines, no landing route); socket layer (`lib/socket.ts` + `hooks/useSocket.ts`); `ui.store` and `tenant.store`; `utils/currency.utils.ts` and `date.utils.ts`; `animated-noise*` trio (2 byte-identical) |
| 2   | **Client-side SPA dressed as App Router** — 0 Server Actions, 0 route handlers, 0 `proxy.ts`                                       | The 4 "server" pages are 5–8 line shells; the 3 group layouts are `'use client'` guards → the whole tree is client. Auth is enforced client-side only (`AuthGuard` → `GET /auth/me`): protected routes reachable before hydration                                                                                                                                             |
| 3   | **axios coupled to Zustand** — `core → store` layering inversion                                                                   | `core/config/api-url.ts:2` imports `auth.store`; the transport layer can never run in Server Components                                                                                                                                                                                                                                                                       |
| 4   | **`components.json` structural landmine** — `aliases.ui = "@/components/ui"` but that folder doesn't exist                         | Any `npx shadcn add` creates `src/components/ui/` conflicting with atoms/molecules/organisms                                                                                                                                                                                                                                                                                  |
| 5   | **ESLint disabled in practice** — `eslint-plugin-only-warn` downgrades EVERYTHING to warning; `next lint` is deprecated in Next 16 | `lint` script likely broken on 16.1.5; no `import/order`, no boundaries, no unused-imports                                                                                                                                                                                                                                                                                    |
| 6   | **Zero tests in web** — `turbo run test` silently skips `apps/web` (no `test` script)                                              | `packages/jest-config` even exports a `./next` preset web never adopted                                                                                                                                                                                                                                                                                                       |
| 7   | **`auth.store` persists the full `AuthenticatedUser` to localStorage** without `partialize`                                        | `store/auth.store.ts`                                                                                                                                                                                                                                                                                                                                                         |

### 1.2 Quantified debt

- **16 `.tsx` files > 200 lines** (worst: `sidebar.tsx` at 699 — shadcn vendor).
- **67 hardcoded hex + 24 rgb/rgba colors** across 14 files. Concentrated in: `utils/effects.ts` (19), the onboarding palette trio (`appearance.constants.ts` / `useStepPipeline.ts` / `StepNomenclature.tsx` — same palette declared 3 times), `auth/Orb*` + `OnboardingBranding` (9). `BRAND_COLOR_OPTIONS` already exists in `@repo/shared-utils` and is unused.
- **17 raw `<button>` in features** (7 in `StepAppearance.tsx` alone), 1 raw `<input>`, fake table built with `grid-cols-5` in `StepTeam.tsx`. The "selectable tile" pattern re-typed ~9 times while `ToggleGroup`/`RadioGroup` sit vendored.
- **Major duplication**: 23 identical `try/catch` blocks in services (~140 lines extractable into one `request<T>()`); `LoginView` vs `OnboardingView` ~90% identical; `<Controller>` block copy-pasted 7×; 7 near-identical wizard hooks (extract `useStepMutation` + `useEditableList<T>`).
- **i18n client-only and used in only 7 files** (all onboarding). Auth/app-shell/landing are 100% hardcoded English even though the keys ALREADY exist in `locales/es.ts`. 13 hardcoded toasts. `<html lang="es">` fixed while the detector may resolve `en`.
- **Dead deps**: `@repo/ui` (0 imports), `sonner` (replaced by sileo), `@dnd-kit/*` (0 imports), `socket.io-client` (dead layer), `@tanstack/react-table` (only used by the dead DataTable).
- **Direction violations**: 3 cross-feature (`features/app` → `features/auth/hooks/*` bypassing the barrel), `core → store` inversion, `routes.constants.ts` with 20/23 routes pointing at nonexistent pages.

### 1.3 What's already right

- 4 existing feature slices (`app`, `auth`, `onboarding`, `landing`) already cut by domain.
- `components/` never imports `features/` (0 violations).
- es/en locales in sync (149 keys each).
- CSS tokens well defined in `globals.css` (62 vars) — just underused.
- Zustand correctly limited to UI state (no server data).

---

## 2. Target structure (FSD)

```
apps/web/src/
├── app/                        # Next.js routing ONLY — 1-5 line files
│   ├── (auth)/login/page.tsx   #   import { LoginPage } from '@/views/login'
│   └── (app)/contacts/page.tsx #   export { ContactsPage as default } from '@/views/contacts'
│
├── views/                      # Page orchestrators (FSD "pages" layer;
│   └── contacts/               # named views/ to avoid Pages Router clash)
│       ├── api/                #   server component data fetching
│       ├── ui/                 #   widget/feature composition
│       └── index.ts
│
├── widgets/                    # Composite blocks reused across pages
│   └── app-shell/              #   sidebar + header + content (Compound pattern)
│       ├── ui/
│       └── index.ts
│
├── features/                   # ONE user action = one slice
│   └── create-contact/
│       ├── api/                #   'use server' Server Action
│       ├── model/              #   useActionState hook / state logic
│       ├── ui/                 #   form, pure render
│       └── index.ts
│
├── entities/                   # Backend domain mirror — types + presentational UI
│   └── contact/
│       ├── model/              #   contact.types.ts (branded), contact.parse.ts (zod)
│       ├── ui/                 #   ContactCard, ContactAvatar — props only, no fetch
│       └── index.ts
│
└── shared/                     # Domain-free infrastructure
    ├── api/                    #   client.ts (fetch wrapper), errors.ts (RFC 7807)
    ├── config/                 #   env, routes, global constants
    ├── i18n/                   #   i18next setup + locales
    ├── lib/                    #   cn, formatters, date-co, generic hooks
    └── ui/
        ├── shadcn/             #   vendor — NEVER mix with custom code
        ├── atoms/              #   custom indivisible
        ├── molecules/          #   custom composite
        └── index.ts            #   Public API
```

### 2.1 Import rule — one direction only

```
app → views → widgets → features → entities → shared
```

- Each layer imports only from **lower** layers. Never sideways (feature → feature), never upward.
- If two features need the same thing → push the concept down to `entities/` or `shared/`.
- Enforced with `eslint-plugin-boundaries` + code review (the plugin can silently fail with ESLint 9 flat config — the PR checklist is the backstop).

### 2.2 Public API per slice

Every slice exposes `index.ts`. Importing another slice's internals is a violation:

```ts
import { ContactCard } from '@/entities/contact' // ✅
import { ContactCard } from '@/entities/contact/ui/ContactCard' // ❌
```

### 2.3 Decision tree — where a new component goes

```
Does it know the domain (Contact, Invoice, Deal)?
├─ NO  → shared/ui/<atoms|molecules>/
└─ YES
   ├─ Represents ONE entity, no logic?           → entities/<x>/ui/
   ├─ Belongs to ONE user action?                → features/<x>/ui/
   ├─ Composite block reused across pages?       → widgets/<x>/ui/
   └─ Specific to ONE page?                      → views/<x>/ui/
```

---

## 3. Rendering and data

### 3.1 Server Components by default

`'use client'` ONLY when one of these applies:

- React hooks (`useState`, `useEffect`, `useReducer`, `useContext`)
- DOM events (`onClick`, `onChange` — except form `action`)
- Browser APIs (`localStorage`, `window`, socket.io)

Everything else is a Server Component. Pages fetch on the server and pass resolved data down.

### 3.2 Mutations = Server Actions

```
1. Form submits with action={serverAction}
2. Server Action ('use server'): validate with zod → call backend via apiFetch → revalidateTag(...)
3. Next re-renders the affected Server Components
```

Forbidden: fetch/axios in client components to mutate, `useEffect` for data fetching, manual cache invalidation.

### 3.3 Single HTTP client: wrapped `fetch`

axios gets removed. Reasons: ignores Next's cache (`next: { tags, revalidate }`), breaks `revalidateTag()`, bundle weight with no benefit.

```ts
// shared/api/client.ts — the only HTTP exit point
export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { tags, revalidate, parse, ...rest } = options
  const res = await fetch(`${env.API_URL}${endpoint}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...rest.headers },
    next: { tags, revalidate: revalidate ?? 60 },
  })
  if (!res.ok) throw new ApiError(await parseProblem(res)) // RFC 7807
  if (res.status === 204) return undefined as T
  const json = await res.json()
  return (parse ? parse(json) : json) as T
}
```

### 3.4 Named cache tags

```ts
// shared/api/cache-tags.ts
export const CACHE_TAGS = {
  contacts: (tenantId: string) => `contacts:${tenantId}`,
  contact: (id: string) => `contact:${id}`,
  invoices: (tenantId: string) => `invoices:${tenantId}`,
} as const
```

| Resource                                 | revalidate | Why                                                            |
| ---------------------------------------- | ---------- | -------------------------------------------------------------- |
| Sensitive data (balances, DIAN statuses) | `2`        | Never `0` (overloads backend); 2s + post-mutation invalidation |
| Lists (contacts, invoices)               | `5`        | Eventual consistency acceptable                                |
| Catalogs (municipalities, doc types)     | `3600`     | Almost never change                                            |

After every mutation: `revalidateTag(CACHE_TAGS.x(id))`.

### 3.5 TanStack Query — only where RSC can't reach

RSC + Server Actions cover 90%. TanStack Query stays **only** for views with live client-side server state:

- Pipeline kanban (drag & drop + optimistic updates)
- WhatsApp inbox (real-time messages via socket)
- Tables with bulk inline editing

Rule: if the view needs neither optimistic updates nor real-time, it does NOT use TanStack Query.

### 3.6 State hierarchy

```
URL (searchParams + router.push)        ← filters, sort, pagination, search, tabs
  ↓ if URL doesn't fit
Server Components (fetch + render)      ← all static server state
  ↓ if interactivity required
useState / useActionState               ← forms, modals, local state
  ↓ only if shared across distant components AND doesn't fit in URL
Zustand                                 ← last resort (in-memory auth token, UI shell)
```

Filters in Zustand = architectural bug (loses shareable URLs and back button).

### 3.7 DDD mirror — branded types + parse at the boundary

```ts
// entities/contact/model/nit.ts
export type NIT = string & { readonly __brand: 'NIT' }
export function parseNIT(input: string): NIT {
  /* DIAN modulo 11 + cast */
}
```

Branded types only exist at compile time. The parse (zod) happens at the **boundary**:

1. User input → zod schema in the Server Action
2. API response → `parse<Entity>` inside `apiFetch`
3. localStorage / URL params → parse on read

Without parse at the boundary, a branded type is false safety.

---

## 4. Component rules

| Rule                                                                                 | Limit                                                                                                                                                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lines per `.tsx` file                                                                | **≤ 200** (enforced by CI script)                                                                                                                             |
| Lines per `page.tsx` in `app/`                                                       | ≤ 5 (re-export only)                                                                                                                                          |
| Logic in UI components                                                               | Zero — goes to `model/` (hook) or `shared/lib/`                                                                                                               |
| Inline constants                                                                     | Zero — go to the slice's `model/constants.ts` or `shared/config/`                                                                                             |
| Hardcoded colors (`#hex`, `rgb()`)                                                   | Zero — only Tailwind/CSS-var tokens (enforced by script)                                                                                                      |
| Raw HTML primitives (`<button>`, `<input>`, `<select>`, `<table>`) in features/views | Zero — always `shared/ui` (enforced by script)                                                                                                                |
| Props                                                                                | Always `Readonly<Props>` (Sonar S6759)                                                                                                                        |
| `any`                                                                                | Forbidden — `unknown` + narrow (S6571)                                                                                                                        |
| Array index as React key                                                             | Forbidden — stable IDs (S6479)                                                                                                                                |
| Nested component definitions                                                         | Forbidden (S6478)                                                                                                                                             |
| `\|\|` for nullish defaults                                                          | Use `??` (S6606)                                                                                                                                              |
| User-facing strings                                                                  | Only via i18n (`es.ts` / `en.ts`) — never inline                                                                                                              |
| Comments                                                                             | Only for constraints invisible in code (law, workaround with issue link, subtle invariant). No section markers, no commented-out code, no TODO without ticket |

### 4.1 File >200 lines — how to split it

1. Extract pure sub-components → sibling files in the slice's `ui/`
2. Extract state → hook in `model/`
3. Extract constants/config → `model/constants.ts`
4. Extract pure helpers → `shared/lib/` (if generic) or `model/` (if domain)

### 4.2 Compound Pattern for widgets

Widgets with coexisting parts (header + body + actions) use Compound to satisfy Open/Closed:

```tsx
<AppShell>
  <AppShell.Sidebar />
  <AppShell.Header>{/* breadcrumbs */}</AppShell.Header>
  <AppShell.Content>{children}</AppShell.Content>
</AppShell>
```

Adding a new action = inserting a child. The root never changes.

### 4.3 Hook Pattern for features

```
features/create-contact/
├── api/createContact.ts       ← 'use server' — mutation
├── model/useCreateContact.ts  ← useActionState — state
├── ui/CreateContactForm.tsx   ← pure render — consumes the hook
└── index.ts
```

Each file has exactly one reason to change.

---

## 5. Tooling and enforcement

### 5.1 Guard scripts (CI + pre-commit)

| Script                  | Detects                                                       | Fails if                             |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------ |
| `check:file-size`       | `.tsx`/`.ts` > 200 lines in `src/`                            | > 0 new (frozen baseline for legacy) |
| `check:colors`          | `#[0-9a-fA-F]{3,8}`, `rgb(`, `hsl(` outside tokens/theme      | > 0                                  |
| `check:html-primitives` | `<button`, `<input`, `<select`, `<table` outside `shared/ui/` | > 0                                  |
| `check:boundaries`      | imports violating FSD direction                               | > 0                                  |

They live in `apps/web/scripts/` and run via `pnpm check:arch` (added to `lint`).

### 5.2 ESLint

- `eslint-plugin-boundaries` → FSD layers
- `@typescript-eslint` strict type-checked
- `eslint-plugin-unused-imports` → dead code
- Key Sonar rules: S6759, S6754, S6478, S6479, S6606, S6571, S6841, S125, S5256, S2245

### 5.3 SonarQube

`sonar-project.properties` in `apps/web/` — quality gate: 0 new bugs, 0 blocker/critical code smells, coverage on new code ≥ 60%.

### 5.4 Testing

| Level       | Tool                     | Covers                                                                                |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------- |
| Unit        | Vitest + Testing Library | `shared/lib`, `entities/*/model` (parse, formatters), hooks                           |
| Integration | Vitest + **MSW**         | complete features — MSW mocks the NestJS backend at the network level, not at imports |
| E2E         | Playwright + **MSW**     | critical flows: login, onboarding, create contact, issue invoice                      |

MSW is the single backend mock point: same handlers for integration and e2e.

---

## 6. Migration plan — phases (simple → complex)

> Rule: every phase leaves `main` green (build + lint + tests pass). No phase mixes "moving files" with "changing behavior".
>
> **Status (July 2026): Phases 0, 1, 1.5, 2, 5 and the infrastructure of 6 are DONE.** Executed structure: `app → views → widgets → features → entities → shared`, features are verb slices (`login`, `logout`, `register-workspace`, `recover-password`, `setup-workspace`), session lives in `entities/session`, boundaries enforced by `eslint-plugin-boundaries` (v7 `dependencies` rule, verified firing). Phases 3–4 (entities per aggregate + Server Actions + kill axios) run per-feature as real domain pages (contacts, deals, invoices) get built.

### Phase 0 — Baseline (no product code touched)

- [ ] Fix lint: `next lint` (deprecated in Next 16) → direct `eslint .`; drop `eslint-plugin-only-warn` for web (or local override with real severities)
- [ ] Fix `components.json`: `aliases.ui` points to a nonexistent folder — point it at shadcn's real target
- [x] Guard scripts (`check:file-size`, `check:colors`, `check:html-primitives`) with **baseline**: legacy frozen, new code strict
- [ ] ESLint: `unused-imports` + `import/order` + Sonar rules
- [ ] Vitest installed (adopt `@repo/jest-config/next` preset or standalone vitest) + `test` script so turbo stops skipping web

### Phase 1 — Cleanup (low risk, high return: −28% of code)

- [ ] Delete dead code: 35 unused shadcn primitives, `organisms/DataTable/` (recreate when a real table exists), `components/templates/`, `features/landing/` (no route), socket layer, `ui.store`, `tenant.store`, `animated-noise*` trio, `utils/{currency,date}.utils.ts`, orphaned Geist fonts
- [ ] Delete dead deps: `sonner`, `@dnd-kit/*`, `socket.io-client`, `@tanstack/react-table`, `@repo/ui` (+ those only pulled by dead primitives: `cmdk`, `vaul`, `embla`, `input-otp`, `react-day-picker`, `react-resizable-panels`)
- [ ] Prune `routes.constants.ts` (20/23 phantom routes) and `query-keys.constants.ts` (8/10 unused namespaces)
- [ ] Dedup: `request<T>()` in services (−140 lines), `AuthSplitView` (LoginView+OnboardingView), `<ControlledField>`/`<PasswordField>` (−140 lines), `useStepMutation` + `useEditableList<T>` in the wizard, brand palette down to ONE source (`@repo/shared-utils` already has `BRAND_COLOR_OPTIONS`)
- [ ] i18n: wire auth/app-shell to keys that already exist in `locales/*`, translate the 13 toasts, `WizardStep` defaults to `common.*`
- [ ] Hardcoded colors → tokens (`utils/effects.ts`, Orb*, OnboardingBranding; use the `--map-*`/`--surface-\*` vars already defined)
- [ ] Raw `<button>`/`<input>` → `shared/ui` (`Button`, `Input`, `ToggleGroup` for selectable tiles)
- [ ] `auth.store`: `partialize` — stop persisting the full `AuthenticatedUser` to localStorage

### Phase 1.5 — Route security (small but urgent)

- [x] `src/proxy.ts` (Next 16 renamed middleware to proxy): edge session check via `access_token` cookie for `/dashboard` and `/onboarding/setup`, guest-only redirect for `/login` and `/onboarding`; decision logic in `core/auth/route-access.ts` with unit tests

### Phase 2 — FSD foundations

- [ ] Create `shared/` and move: `utils/` → `shared/lib/`, `constants/` → `shared/config/`, `lib/i18n` → `shared/i18n/`
- [ ] Separate shadcn vendor → `shared/ui/shadcn/` (adjust `components.json`)
- [ ] Custom UI → `shared/ui/{atoms,molecules}/` with Public API
- [ ] `shared/api/client.ts` (fetch wrapper) + `cache-tags.ts` + `ApiError`
- [ ] `eslint-plugin-boundaries` active

### Phase 3 — Entities (domain mirror)

- [ ] One slice per backend aggregate: `contact`, `company`, `deal`, `invoice`, `payment`, `tenant`, `user`
- [ ] Branded types + zod parse at the boundary
- [ ] Entity presentational UI moved out of `components/`

### Phase 4 — Features + kill axios

- [ ] Migrate mutations to Server Actions slice by slice (start with the simplest)
- [ ] Every Server Action: zod → apiFetch → revalidateTag
- [ ] At the end: `pnpm remove axios`

### Phase 5 — Widgets + Views

- [ ] `sidebar.tsx` (699 lines) → `widgets/app-shell/` Compound, files ≤ 200 lines
- [ ] DataTable → generic `widgets/data-table/`
- [ ] Pages → `views/<x>/` with 1-line `app/` files
- [ ] Split the 16 files >200 lines

### Phase 6 — Testing + SonarQube

- [ ] MSW with NestJS API handlers
- [ ] Integration tests per migrated feature
- [ ] Playwright: login, onboarding, contact CRUD
- [ ] SonarQube in CI with quality gate

---

## 7. Frontend PR checklist

```
□ No new .tsx file > 200 lines
□ Imports respect FSD direction (app→views→widgets→features→entities→shared)
□ New slices expose index.ts; nobody imports another slice's internals
□ Zero unnecessary 'use client' (does it really use hooks/DOM/browser?)
□ Mutations via Server Action with zod + revalidateTag
□ Zero axios, zero fetch in client components
□ Zero hardcoded colors, zero raw HTML primitives outside shared/ui
□ Readonly<> props, zero any, zero index-as-key
□ User-facing strings in locales (es/en)
□ State at the right layer (URL > RSC > useState > Zustand)
□ Zero comments that restate the code
```
