---
name: ui-ux-glossary
description: Component selection and usage rules distilled from the Mobbin Design Glossary (58 components). Load BEFORE designing or reviewing any NexoCRM UI — picking a component, adding feedback (toast/banner/dialog), inputs, navigation, or polish passes (borders, paddings, tooltips, states).
---

# UI/UX Component Selection (Mobbin Glossary)

Source: https://mobbin.com/glossary (scraped 2026-07-27). Full per-component "when / when not" notes in `REFERENCE.md` — consult it when a decision is contested.

## Decision tables

**Selection inputs** (single choice): 2 options → segmented control/switch · 2-5 visible → radio · 2-9 visual/rich → tile (OptionTile) · ≤10 plain → select · >10 → combobox (searchable).
**Selection inputs** (multi): few visible → checkboxes · visual → tiles multi-select · tags/dismissible → chips.
**Numeric**: small increments 1-10 → stepper · continuous range where imprecision OK → slider (discrete steps + visible value if steps matter) · exact value → text field (or slider + editable number).
**Feedback**: low-priority auto-dismiss → toast · persistent contextual → banner (max ONE) · needs decision/attention → dialog · loading known duration → determinate progress · unknown → spinner/skeleton (skeleton for content-rich pages).
**Overlays**: info anchored to element → popover (non-essential only) · text hint → tooltip · actions on element → dropdown/context menu · focused task → dialog · mobile supplementary → bottom sheet · full attention flows → full-screen overlay (X always obvious).
**Navigation**: top-level mobile → tab bar (≤5) · many sections/infrequent → sidebar/drawer · page sections → table of contents · wizard progress → stepper rail with page controls semantics (3-7 steps).
**Data display**: comparison across attributes → table (desktop) · mobile or concise → stacked list · visual collections → gallery/cards · hierarchy → tree.

## Rules that repeat across the whole glossary (apply always)

1. **Prominence ∝ importance**: critical → dialog/button; secondary → menu/popover/link; never bury primary actions in overflow or hide them behind low-discoverability triggers.
2. **Don't hide what users need often**: frequently accessed → visible (tabs, toolbar, buttons); occasional → collapsed (drawer, accordion, dropdown).
3. **Progressive disclosure**: show minimum first, reveal detail on demand (accordion, popover, tooltip) — but never hide critical info.
4. **One at a time**: one banner, one FAB, 3-5 action-sheet options, ≤5 tabs. More = cognitive overload.
5. **States are mandatory**: inputs need default/hover/focus/error/disabled; toggles need obvious on/off; selected tiles need fill+border+icon, not color alone.
6. **Feedback for everything**: >1s → indicator; instant → none; errors → specific + solution + visible cue, no jargon.
7. **Affordances**: draggable → grip icon + cursor-grab + drag ghost/elevation; clickable → hover state; editable → visible border/underline (a borderless input reads as static text).
8. **Empty states are screens, not gaps**: message + visual + action (first-use, no-results, post-completion).

## NexoCRM specifics

- Tokens only (`--primary` lime fails contrast on light → `text-primary-deep dark:text-primary` for lime text).
- OptionTile = Mobbin "tile": selected needs `border-primary` + `bg-accent` (fill+border, not color alone).
- Tooltips: shadcn `tooltip` in `shared/ui/shadcn`; use for icon-only buttons (grip, X, color dot) — never for essential info.
- Sliders: discrete with visible value label (probability %); `tabular-nums` on the value.
- Drag & drop: dnd-kit installed; pattern in `features/setup-workspace/ui/navigation/SortableModule.tsx` (cursor-grab, isDragging elevation); use `DragOverlay` for ghost.
- Cursor pointer: Tailwind v4 preflight removed it from buttons — restored globally in `globals.css` base layer (buttons, roles, labels, native inputs; `:disabled` excluded). Never re-add `cursor-pointer` per component; draggables override with `cursor-grab` (utilities beat base).
