# Nexo — Storybook conventions

Storybook is the executable half of `DESIGN.md`. If a token or a component
state is written there, a story proves it here. If a story does not exist, the
component is not done.

## Setup

Storybook 9 with the Vite builder (`@storybook/nextjs-vite`), running against
`apps/web` so stories import real source through the same `@/` aliases.

```
apps/web/.storybook/
  main.ts           framework, stories glob, addons
  preview.tsx       decorators, parameters, theme + density + tenant globals
  theme-decorator.tsx
  nexo-theme.ts     Storybook UI chrome themed with Nexo tokens
  manager.ts        applies nexo-theme to the manager UI
  vitest.setup.ts   portable-stories project annotations
```

Stories glob: `src/shared/ui/**`, `src/entities/**`, `src/features/**`,
`src/widgets/**` (`*.stories.ts|tsx`) plus `src/docs/**/*.mdx`.

Addons: `@storybook/addon-docs`, `@storybook/addon-a11y`,
`@storybook/addon-vitest` (portable stories run in `pnpm test`, vitest
`storybook` project, real Chromium via `@vitest/browser-playwright`),
`@storybook/addon-themes`.

## Story file placement

Stories live next to the component, inside the slice that owns it — never in
a central `stories/` folder. FSD boundaries apply to stories exactly as they
do to source.

## Title taxonomy

`Category/Component`, five categories and no others:

| Category       | Contents                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `Foundations/` | MDX only: Color, Typography, Spacing, Radius, Elevation, Motion, Voice                             |
| `Atoms/`       | Amount, BadgeSoft, BadgeInk, AvatarSquircle, PillButton, Button, Input, Checkbox, Switch, Skeleton |
| `Molecules/`   | ControlledField, PasswordField, OptionTile, ColorPicker, FileUpload                                |
| `Organisms/`   | DataTable, PaginationCapsule, KanbanColumn, Timeline, EmptyState, KpiCard                          |
| `Brand/`       | MeshBloomOrb, OrbNetwork, Wordmark, ColombiaMap                                                    |
| `Widgets/`     | AppSidebar, AuthSplitView, WizardLayout                                                            |

Views and pages are not stories — they are Playwright specs.

## Story conventions

- CSF 3 with `satisfies Meta<typeof X>` and `StoryObj<typeof meta>`.
- Ship in order: `Default`, one story per variant, one per size, `States`,
  `WorstCase`, and `Playground` with full `argTypes`.
- Fixture data imported from a sibling `*.fixtures.ts` (or the slice `model/`)
  — never inlined in the story file.
- No component defined inside a story; layout needs become decorators.
- Everything in Storybook is English: copy, fixtures, story names and docs. (Product UI copy is Spanish via i18n; stories exercise components with English fixtures.)
- Interactive behaviour asserted with `play()` from `storybook/test`; any
  story with a `play()` is a test under `pnpm test`.
- `Playground` stories carry
  `parameters: { chromatic: { disableSnapshot: true } }`.

## Globals: theme, density, tenant

`preview.tsx` toolbar globals: `theme` (light · dark · side-by-side),
`density` (comfortable · compact), `tenant` (nexo lime `#A5E96F` · ochre
`#F0B429` · indigo `#8AA2FF`, which flips foreground to white). The theme
decorator toggles the `.dark` class — the same mechanism `next-themes` uses —
and tenants write only the four white-label variables. `side-by-side` renders
the story twice in a split frame; it is the Chromatic snapshot mode.

## Documentation pages

`Foundations/*` are MDX in `src/docs/` rendered from the token source
(`shared/config/tokens/theme-contract.ts` + live CSS variables): a token
added in code appears in the docs without editing MDX.

## Worst-case stories (required)

Every component ships `WorstCase` alongside `Default`: 60-character names,
`$ 1.200.000.000`, `$ 0`, foreign currency beside COP, competing statuses
falling back to Soft, reduced-motion for brand marks.

## Quality gates (CI)

1. **a11y** — `parameters.a11y.test = 'error'`: any serious/critical
   violation fails the vitest storybook project, both themes.
2. **Interaction** — portable stories run under `pnpm test` (vitest
   `storybook` project, headless Chromium).
3. **Chromatic** — `chromatic` job in `.github/workflows/ci.yml` on PRs,
   gated on `CHROMATIC_PROJECT_TOKEN`, `onlyChanged: true`.

The build also inherits `pnpm lint` architecture checks — 200-line cap, no
hardcoded colors, no raw HTML primitives outside `shared/ui`. Stories are
source files and are not exempt.

## Definition of done for a component

- Source in the right FSD slice, exported through the slice `index.ts`.
- Every token it consumes exists in `globals.css` — no local hexes.
- Stories: `Default`, variants, sizes, `States`, `WorstCase`, `Playground`.
- Passes a11y in light and dark, and under all three tenant presets.
- One `play()` interaction test if the component has behaviour.
- An entry in `DESIGN.md` under Components, same name as the story.
