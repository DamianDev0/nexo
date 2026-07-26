# NexoCRM Web — Claude Instructions

Source of truth: `docs/frontend-architecture.md`. This file is the operational summary.

## Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · FSD · TanStack Query (scoped) · Zustand (scoped) · i18next · Vitest + MSW · Playwright

## Architecture — Feature-Sliced Design

Import direction (enforced by `eslint-plugin-boundaries`):

```
app → views → widgets → features → entities → shared
```

- `src/app/` — Next.js routing only. Pages are re-exports of views. `src/proxy.ts` (Next 16 renamed middleware) guards routes at edge via `access_token` cookie.
- `src/views/<page>/` — page orchestrators (`login`, `onboarding`, `onboarding-setup`, `dashboard`).
- `src/widgets/<block>/` — composite blocks reused across pages (`app-shell`, `auth-shell`).
- `src/features/<verb>/` — ONE user action per slice, named as a verb: `login`, `logout`, `register-workspace`, `recover-password`, `setup-workspace`. Segments: `ui/`, `model/`, `api/`.
- `src/entities/<noun>/` — domain mirror (`session`). Segments: `model/`, `ui/`.
- `src/shared/` — domain-free: `api/` (axios http, request<T>, services, tenant-ref), `config/` (routes, query-keys, tokens/), `i18n/`, `lib/` (cn, hooks, animations), `ui/` (`shadcn/` vendor — never modify; `atoms/`, `molecules/` custom).

Every slice exposes `index.ts`. Never import another slice's internals.

## Hard rules (CI-enforced via `pnpm lint` = eslint + check:arch)

- Max 200 lines per `.ts(x)` file (`scripts/check-file-size.mjs`, frozen baseline).
- Zero hardcoded colors — tokens live in `src/shared/config/tokens/` and `globals.css` (`scripts/check-colors.mjs`).
- Zero raw `<button>/<input>/<select>/<table>/<textarea>` outside `shared/ui` (`scripts/check-html-primitives.mjs`).
- Baselines regenerate with `node scripts/check-X.mjs --update` — only when legacy shrinks, never to add debt.
- Zero comments in code. Names and types carry meaning. Only functional pragmas allowed.
- No arbitrary px values where a canonical class exists: Tailwind v4 spacing is dynamic, so `h-[38px]` is `h-9.5` (n = px/4); radii use tokens (`rounded-sm/md/lg/xl` = 6/12/18/24). Arbitrary stays only for font sizes from the type scale, em tracking, deg rotation and fractional borders.
- Zero `any`, `Readonly<Props>`, no index-as-key, no nested component definitions, `??` over `||`.
- All user-facing strings via i18next (`shared/i18n/locales/{es,en}.ts` — keep both in sync).

## Component patterns (mandatory)

- Constants NEVER inline in components/views — slice `model/` or `shared/config`. Builders that need `t()` are pure functions in `model/` (e.g. `buildStepDefs(t)`).
- Max 5 props per component. Beyond that: object-as-props grouped by cohesion (`data` / `actions` / `nav`).
- Dumb components: `ui/` renders props only — no fetch, no stores, no business logic. Logic lives in `model/` hooks.
- Container/Presentational: thin containers in `ui/containers/` connect context/hooks and build prop objects.
- Orchestrator views: zero state, zero business handlers — Provider + layout + content switch only.
- Shared step/section state: feature Context Provider (`model/x-context.tsx`) with memoized value + throwing accessor hook. Hooks inside per-step containers would lose state on unmount — the Provider preserves it.
- Compound Pattern for blocks with coexisting parts (root + `Object.assign` subcomponents). Any future DataTable is born compound.
- Visual pattern repeated ≥2 times → generic component in `shared/ui` (e.g. `OptionTile`).
- Splitting a >200-line file: folder with `index.tsx` (preserves import path), logic → hook, constants → `model/`.

## Data flow

- HTTP goes through `shared/api/request.ts` (`request<T>()` wraps axios + unwraps envelope + normalizes errors to `ApiErrorResponse`). Services are one-liners in `shared/api/services/`.
- Tenant slug reaches the interceptor via `shared/api/tenant-ref.ts` — never import stores in `shared/api`.
- Server state: TanStack Query. UI state: `useState`. Cross-cutting client state: Zustand (`entities/session`, persists only `tenantSlug`).
- State priority: URL > Server Components > useState > Zustand.
- Mutation pattern in wizards: `useStepMutation` (features/setup-workspace). Editable lists: `useEditableList` (stable ids — never index keys).
- Toasts: `sileo`; strings via `t()` from i18next (hooks import `{ t } from 'i18next'`).

## Testing

- `pnpm test` — Vitest + Testing Library (jsdom). MSW mocks the NestJS API at network level (`tests/msw/`).
- Tests NEVER live in `src/` — they go in `tests/` mirroring the `src` structure, importing via `@/` aliases.
- `pnpm test:e2e` — Playwright against `pnpm dev` on :3001 (requires `npx playwright install chromium` once).
- New logic ships with tests (TDD preferred: red → green).

## shadcn

- Vendor primitives: `src/shared/ui/shadcn/` — never modify; `npx shadcn add <x>` installs there (`components.json`).
- Custom UI: `shared/ui/atoms|molecules` — knows no domain. Domain UI lives in its slice's `ui/`.

## Pending (do NOT regress)

- Phase 3/4: entities + Server Actions + kill axios — happens per-feature when real domain pages (contacts, deals, invoices) get built. New mutations should prefer Server Actions with zod + `revalidateTag`.
- i18n is SSR-aware: locale = `NEXT_LOCALE` cookie > `Accept-Language` > `es`; `<html lang>` dynamic; server strings via `getT()` (`shared/i18n/server.ts`); client i18next syncs through the same cookie; switching lives in `features/switch-language`.
- Remaining baseline debt: 10 files >200 lines, 11 raw primitives (wizard tiles), 3 color entries (dynamic hsla + vendor var()).
