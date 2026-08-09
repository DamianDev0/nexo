---
name: nexo-testing
description: How to write every kind of web test in NexoCRM — component, hook, functional (MSW), Playwright e2e journeys, visual regression, performance budgets, race conditions, and Stryker mutation testing. Load before writing or reviewing any test in apps/web, expanding e2e coverage, or checking test quality.
---

# NexoCRM Web — Testing Playbook

## Existing infrastructure (do not reinvent)

| Piece                                                                  | Where                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Vitest config (2 projects: `unit` jsdom + `storybook` browser)         | `apps/web/vitest.config.mts`                                   |
| MSW factory (empty handlers, `onUnhandledRequest: 'error'`)            | `tests/msw/test-server.ts` → `createMswServer()` + `API` const |
| Default handlers + `CONTACTS_FIXTURE` / `buildContact()`               | `tests/msw/handlers.ts`                                        |
| TanStack wrapper                                                       | `tests/query-wrapper.tsx`                                      |
| Playwright config (chromium only, baseURL :3001, webServer `pnpm dev`) | `apps/web/playwright.config.ts`                                |
| E2E tenant helpers `onboardWorkspace(request)` / `loginAs(page, ws)`   | `apps/web/e2e/fixtures/tenant.ts`                              |
| Existing e2e (3): login, settings-navigation, settings-logo-upload     | `apps/web/e2e/*.spec.ts`                                       |
| Stryker mutation testing                                               | `apps/web/stryker.config.json` + `vitest.stryker.config.mts`   |

Hard rules: tests live in `apps/web/tests/` mirroring `src/` (NEVER in `src/`), import via `@/` aliases. Every new file in `features|entities/<slice>/{lib,model}/` needs a `<name>.test.ts(x)` somewhere under `tests/` (`check-test-mirror` cop, matched by basename). Zero comments. i18n is NOT initialized in unit tests — assert raw keys: `getByRole('button', { name: 'common.save' })`.

## Decision tree — which test type

- Pure function in `lib/` (builders, schemas, formatters) → plain Vitest unit test.
- Hook in `model/` or `query/` → `renderHook` + `queryWrapper` + `createMswServer()`.
- Component in `ui/` → Testing Library `render` + MSW + `vi.mock` of Next modules.
- Server Action in `api/` → call directly with `vi.mock('server-only')`, `vi.mock('next/cache')`, `vi.mock('next/headers')`.
- Cross-slice user journey in real browser → Playwright e2e.
- "Does it still LOOK right" → Playwright `toHaveScreenshot` (journeys) or Storybook + Chromatic (isolated components).
- "Do my tests actually test" → Stryker.

## Hook tests (dominant pattern — copy `tests/features/manage-contacts/useContactsTable.test.tsx`)

```ts
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

const server = createMswServer()

it('...', async () => {
  server.use(http.get(`${API}/contacts`, () => HttpResponse.json(payload)))
  const { result } = renderHook(() => useContactsTable(), { wrapper })
  await waitFor(() => expect(result.current.isPending).toBe(false))
  act(() => result.current.handleSearch('carlos'))
})
```

Every request must be stubbed (empty server + error on unhandled). Type responses with `satisfies ApiSuccessResponse<T>`.

## Component tests (pattern: `tests/features/manage-settings/settings-shell.test.tsx`)

Same MSW + wrapper, plus stub Next per-file as needed:

```ts
vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({ toString: (): string => '' })) }))
vi.mock('next/navigation', () => ({
  usePathname: () => '/contacts',
  useRouter: () => ({ push: vi.fn() }),
}))
```

Prefer `@testing-library/user-event` (installed, unused so far) over raw `fireEvent` for interactions: `const user = userEvent.setup()` then `await user.click(...)`. Query by role/label, never by class. Render containers (`ui/containers/`) for integration-ish coverage; render dumb `ui/` components with plain props for logic-free markup.

## E2E — Playwright journeys

State of the world: NO `data-testid` in src. Select by role/text (bilingual regex `/save|guardar/i`) or existing `data-slot` attributes: `table-root`, `table-toolbar`, `table-body`, `table-skeleton`, `table-bulk-bar`, `table-smart-lists`, `table-quick-filters`; rows carry `[data-selected]`. Remove the dev overlay first: `await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())`.

Every spec onboards a FRESH tenant (isolation, slow but safe): `const ws = await onboardWorkspace(request)` then `await loginAs(page, ws)`. Requires live API on :8080 + Postgres (`docker compose up -d`, `pnpm --filter api dev`). To reuse a session across tests in one file: `test.describe.configure({ mode: 'serial' })` + login once + `page.context().storageState()`.

No contacts seed exists. Seed via API mirroring `fixtures/tenant.ts` style:

```ts
async function seedContact(
  request: APIRequestContext,
  ws: Workspace,
  cookies: string,
  body: object,
) {
  const res = await request.post(`${API_URL}/contacts`, {
    headers: { 'x-tenant-slug': ws.slug, cookie: cookies },
    data: body,
  })
  expect(res.status()).toBe(201)
  return (await res.json()).data
}
```

### The contacts journey (target chain)

Buildable TODAY: Login → Contacts → Create (Sheet `contacts.form.submitCreate`) → Edit (row action reopens Sheet) → Search (debounced, page resets to 1) → Quick filters (`lifecycleStage`/`source` chips + clear all) → Smart Lists (status lists + "all", hotkeys 1-9, drag reorder persisted in localStorage `contacts.list-order`) → Bulk archive (select rows → `table-bulk-bar` → archive).

NOT built yet (do not write e2e, UI does not exist): Send SMS / Email, Schedule message. Add those legs when the messaging feature ships.

Structure: ONE journey spec `e2e/contacts-journey.spec.ts` in serial mode walking the chain (real user narrative), plus small focused specs for edge behavior. Assert on network too: `page.waitForRequest`/`waitForResponse` for the POST/PATCH, `expect.poll` for eventual UI state — the settings specs show both patterns.

## Visual regression — "contacts se ve igual"

Two layers:

1. **Playwright screenshots** for full pages. One-time config addition in `playwright.config.ts`:

```ts
expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } }
```

Then in the journey: `await expect(page).toHaveScreenshot('contacts-list.png', { mask: [page.locator('[data-slot="table-body"]')] })` — mask or deterministically seed anything dynamic (names, dates, counts). First run writes baselines (`*-snapshots/`, commit them); `--update-snapshots` refreshes intentionally. Screenshot AFTER `table-skeleton` detaches.

2. **Storybook + Chromatic** for isolated components — CI job exists (PRs, needs `CHROMATIC_PROJECT_TOKEN` secret). Domain UI has ZERO stories today; adding `ContactsTable`/`ContactFormSheet` stories gives per-component visual diffs for free.

## Performance — load-time budgets

`webServer` runs `pnpm dev` (Turbopack dev) — timings there are noise. Real budgets need `next build && next start`. Pattern: separate spec gated by env:

```ts
test.skip(!process.env.PERF, 'perf suite runs against production build')
test('contacts renders under budget', async ({ page }) => {
  await loginAs(page, ws)
  const start = Date.now()
  await page.goto('/contacts')
  await page.locator('[data-slot="table-body"]').waitFor()
  expect(Date.now() - start).toBeLessThan(3000)
  const nav = await page.evaluate(() => performance.getEntriesByType('navigation')[0].toJSON())
  expect(nav.domContentLoadedEventEnd).toBeLessThan(2000)
})
```

Run: `pnpm --filter web build && pnpm --filter web start` then `PERF=1 pnpm --filter web test:e2e --grep perf`. For deeper metrics (LCP/CLS) the roadmap already plans Lighthouse CI (Phase 2) — don't hand-roll it.

## Race conditions

- **Stale search responses** (hook level): first request answers SLOW with old data, second answers fast — assert UI shows the latest query's data. MSW: `await delay(300)` inside the first handler via `import { delay } from 'msw'`. TanStack keys per query string make this pass; the test pins it.
- **Double submit**: count POSTs in a handler, `await user.click(submit)` twice fast, expect 1 (button must disable while pending).
- **Optimistic rollback**: handler returns 500 for archive → row must reappear + error toast.
- **E2E network ordering**: `page.route('**/contacts*', async route => { await new Promise(r => setTimeout(r, 500)); route.continue() })` on the FIRST call only, type a second search immediately, assert final table matches the second term.
- **Debounce**: already proven in `useContactsTable.test.tsx` (collect `q` params, assert only final value hit the network) — reuse that pattern.

## Mutation testing — Stryker (proves tests actually test)

Installed: `@stryker-mutator/core` + `vitest-runner`, config `apps/web/stryker.config.json` (runs the `unit` project via dedicated `vitest.stryker.config.mts` — the storybook browser project can't be mutated). Mutates `features|entities/*/{lib,model}` + `shared/lib` `.ts` files. Incremental cache `reports/stryker-incremental.json` (gitignored).

```bash
pnpm --filter web test:mutation                                        # full run
pnpm --filter web exec stryker run --mutate "src/shared/lib/foo.ts"    # one file (~seconds)
open apps/web/reports/mutation/mutation.html                           # report
```

Workflow when touching a `lib/`/`model/` file: targeted run → open report → every **Survived** mutant is behavior no test asserts → add the missing assertion (don't test the mutant, test the behavior) → rerun until score ≥80 on that file. Known example: `password-strength.ts` shipped at 72% with 6 survivors (regex inversions and string-literal blanks undetected). Thresholds: high 80 / low 65 / `break: null` for now — once the mutated surface is clean, set `break` to fail CI on regressions. Don't chase 100%: equivalent mutants exist; judge each survivor (known equivalents: `optionalPhone` `.trim()` — phoneDigits already strips whitespace; `{ ...EMPTY_QUICK_FILTERS }` → `{}` — the loop reassigns every key).

Hard-won gotchas (violating these produced fake 100% scores via mass timeouts):

- ALWAYS run Stryker from `apps/web`, never the repo root — root runs sandbox the whole monorepo and die on `.claude/skills` symlinks.
- After editing TEST files, rerun with `--force` — the incremental cache serves stale Survived results and your new assertions appear not to work.
- `vitest.stryker.config.mts` anchors `@repo/*` aliases to the REAL monorepo (sandbox-relocation-proof via the `.stryker-tmp` path strip). Never revert to config-relative `../../packages` paths: inside the sandbox they resolve to nowhere, instrumented files fail to import, and every mutant times out instead of being tested.
- `include` globs resolve RELATIVE to vitest `dir`. The config sets `dir: 'tests'` + `include: ['**/*...']`; scope a run by narrowing dir, not include.
- A mutant marked **timeout** is only a real kill for infinite-loop mutants; 100% timeout across a file means the runner is broken, not the tests are great.

## Definition of done for any feature touching contacts

1. `lib`/`model` files: unit/hook tests (mirror cop enforces existence — Stryker enforces quality).
2. Container or key `ui/`: at least one component test with user-event.
3. Journey leg added/updated in `contacts-journey.spec.ts` if the user flow changed.
4. Screenshot assertion updated if the UI changed on purpose (`--update-snapshots`).
5. Targeted Stryker run on changed logic files, survivors killed or justified.
