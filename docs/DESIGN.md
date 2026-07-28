# Nexo CRM — DESIGN.md

> v3 — lime + sage. Canonical showcase: `Nexo Design System EN.dc.html`.
> Applied auth screens: `Nexo v3 - Auth con paleta v2.dc.html`.
> Supersedes v1 (warm paper / editorial serif).
> Implemented in `apps/web/src/styles/globals.css` (token values) and
> `apps/web/src/shared/ui/atoms/` (amount, badge-soft, badge-ink,
> avatar-squircle, pill-button). Executable half: `docs/STORYBOOK.md`.

## Overview

Nexo looks like a calm, generous consumer fintech product that happens to hold
a sales pipeline. Every screen sits on a sage canvas (`#E8EBE6`), content lives
in pure-white cards with **no border and no shadow** — the surface contrast
_is_ the elevation — and the only saturated colour on the page is a single
lime pill (`#A5E96F`) attached to the one action that moves a deal forward.

Two decisions carry the whole identity. First, **geometry**: 24px radius on
cards and buttons, 9999px on badges, chips and pagination. Nothing is a sharp
rectangle. Second, **weight**: Satoshi at 900 for every display headline,
against 400/500 for the entire interface.

The third signature is numeric: `amount` is a first-class component — symbol
one step smaller and muted, digits always tabular, magnitude abbreviated in
KPI cards but never in tables.

Token names stay on the shadcn contract in `globals.css`.

## Colors

Format: `light · dark`. Every text pair clears 4.5:1.

### Brand

- primary `#A5E96F · #A5E96F` — the single action colour. Ink text on top, never white.
- primary-hover `#C7F5A3` · primary-pressed `#8FD65C`
- primary-pale `#E4F7D6 · #1E2A16` · primary-deep `#25400F`

### Surface

- background (canvas) `#E8EBE6 · #0E0F0C`
- card `#FFFFFF · #171915` (no border in light; 1px border in dark)
- popover `#FFFFFF · #1D201B`
- sidebar `#0E0F0C` in both themes — always ink
- muted `#F1F3EF · #1F221C` · row-divider `#F5F7F4 · #1F221C`
- border `#DCE0D9 · #2A2D27` (decorative dividers ONLY)
- border-strong `#8B9288` — every interactive boundary (inputs, outlines) per WCAG 1.4.11

### Text

- foreground (ink) `#0E0F0C · #F2F4F0`
- body `#454745 · #C6CBC3`
- muted-foreground (mute) `#5F665D · #8E938C`
- faint `#6B7268 · #8E938C` — 11px/900 uppercase headers and icons only
- disabled-fg `#C9CEC5 · #4C514A` — never readable text

### Semantic (status ≠ action; lime is never success)

- positive `#2EAD4B · #4FD06F`, surface `#E3F5E7 · #14301F`, text-on `#054D28 · #4FD06F`
- warning `#FFD11A`, surface `#FFF3CF · #2B2312`, text-on `#4A3B1C · #FFD11A`, deep `#B86700`
- negative `#D03238 · #FF6A63`, surface `#FBE7E7 · #2E1614`, text-on `#A7000D · #FF6A63`
- info `#3D6FE0 · #8AB0FF`, surface `#E7EEFF · #151C2C`, text-on `#2C55B8 · #8AB0FF`

### White-label contract

A tenant overrides exactly four tokens: `--primary`, `--primary-foreground`,
`--primary-pale`, `--font-ui`. Everything else is system-owned.

## Typography

Satoshi for everything (900 display / 700 titles / 500 labels / 400 body —
no 600 anywhere). Geist Mono for identifiers and code only — never money.

| Token             | Size   | Weight | Tracking                      |
| ----------------- | ------ | ------ | ----------------------------- |
| display-hero      | 104px  | 900    | -0.05em                       |
| display-xl        | 84px   | 900    | -0.05em                       |
| display-lg        | 56px   | 900    | -0.045em                      |
| display-md        | 36px   | 900    | -0.035em                      |
| heading-md        | 20px   | 700    | -0.015em                      |
| heading-sm        | 16px   | 500    | 0                             |
| body-md (default) | 15px   | 400    | 0                             |
| row-title         | 15px   | 700    | 0                             |
| body-sm           | 13px   | 400    | 0                             |
| label             | 13px   | 500    | 0                             |
| badge             | 12.5px | 900    | 0                             |
| overline          | 11px   | 900    | 0.14em (only uppercase style) |
| mono              | 13px   | 400    | 0                             |

## Icons

lucide-react. Stroke 1.5 set once in a wrapper. Three sizes only: 14 inline,
16 buttons/rows, 20 nav/empty states. Icons are mute by default. Never alone —
icon-only controls carry aria-label + tooltip.

## Layout

Base 4px. Card padding 24–28. Page padding 36 horizontal. Sidebar 268px.
Density comfortable: rows 64 · fields 52 · buttons 48/44/36 · nav 46 ·
badges 28 soft / 46 ink · avatars 36 (26 in kanban).

## Elevation

e0 canvas · e1 white card no border no shadow · e2
`0 2px 4px rgba(14,15,12,.05), 0 18px 36px -16px rgba(14,15,12,.32)` ·
e3 dialogs. Dark expresses the ladder as surface steps
`#0E0F0C → #171915 → #1D201B → #232620`, never shadows.

## Shapes

sm 6 (checkbox) · md 12 (avatar squircle) · lg 18 (kanban card) ·
xl 24 (canonical: cards, buttons, dialogs) · pill 9999.

## Components (implemented specs)

### pill-button

Heights 48/42/36, radius 24/21/18, label 700. Variants: primary (lime, ink
label), ink, secondary, tertiary (1px ink border), ghost, icon (circle, 1px
border-strong). Disabled `opacity .4`. Destructive is never a filled button.

### amount — signature

display: symbol 28/500 mute, figure 58/900 -0.045em · compact: 17/500 +
32/900 + `M` 17/900, decimal comma (`184,5 M`) · inline: 13/500 + 15/500.
Tabular nums, period thousands, no decimals. Lost/void = mute + strikethrough.
Foreign: `US$` + ISO suffix 11/700 mute. Never abbreviate in a table.

### badge-soft / badge-ink — signature

Soft: h28 pill, badge type, semantic surface + text, 6px leading dot. Default
everywhere. Ink: h32/38/46, ink fill, white label, coloured indicator
(dot/spinner 900ms/check/cross) and halo
`0 0 0 1px color/35, 0 12px 30px -8px color/55` — never filter blur. Ink is
for live/terminal states; max one per row, competitors drop to Soft.

### data-table / pagination-capsule / kanban — signature (pending build)

Compound Table.Root/Toolbar/BulkBar/Header/Row/Cell/Pagination. White 24px
card, no outer border, 44px header with overline faint, 64px rows,
row-divider separators, hover `#FAFBF9`, selected `#F7FCF1`. Pagination
detached 28px below, e2 capsule h58: dots ≤9 pages (active 36×12 ink pill),
numbered >9. Kanban: white column radius 24; final column inverts to ink;
drag = white fill, e2, rotate(-0.8deg), dashed ghost.

## Brand mark

Mesh bloom: 192px circle, three blurred lime/mint blobs (#A5E96F, #7FD6C2,
#F2FFDA) over #DFF3C6, 5px dot screen 16% ink, 9–13s drift. Dark: base
#1E2A16, dots white 12%. Six satellite nodes unchanged from OrbNetwork
(lime stops #F7FFE8 → #C6E97A 55% → #8FC430). Wordmark: NEXO Satoshi 700
0.22em + 9px ink dot; never locked to the orb.

## Motion

instant 120ms · standard 200ms · deliberate 320ms, all
`cubic-bezier(.25,.1,.25,1)`; spring 260/28/.8 for drag. Ink spinner 900ms
linear. Everything collapses to opacity under prefers-reduced-motion.

## Voice

Spanish first, tú never usted. Verbs first. Colombian numerals. Errors say
what happened, what it means for the data, what to do next.

## Do / Don't

Do: two surfaces; lime once per view; ink on lime; `amount` for every figure;
Soft in tables, Ink for live; detached pagination; contrast-check every grey.

Don't: lime as success; borders/shadows on resting cards; money in mono or
with centavos; weight 600; faint/disabled-fg as readable text; radius >24
except pills; hardcoded hex (check-colors.mjs fails the build).
