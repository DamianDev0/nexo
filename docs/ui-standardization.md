# UI Standardization Plan

Estado: Fases 1–6 completadas (2026-09-01). Fase 7 (Storybook) con 15+ componentes cubiertos; el resto es incremental al tocar cada componente. Fuente: auditoría de 4 agentes (inventario, duplicación, motion, storybook/calendarios).

## Norte

Estilo "smooth premium": morphs y springs sutiles, un solo vocabulario de motion, un componente canónico por categoría, todo documentado en Storybook (happy/loading/empty/worst-case), cero duplicación. Progresivo — nunca sobre-animar.

## Estándar de motion (autoritativo)

Única fuente JS: `shared/lib/animations/variants.ts`. CSS documentado en `MOTION_SCALE` (`shared/config/tokens/design-scale.ts`).

| Token           | Valor                           | Uso                                    |
| --------------- | ------------------------------- | -------------------------------------- |
| instant         | 120ms ease (`duration-120`)     | hover, focus, checkbox                 |
| fast            | 180ms EASE_SMOOTH (`quickEase`) | micro-fades, chips, swaps de contenido |
| standard        | 200ms (`duration-200`, dialogs) | dropdowns, dialogs, tabs               |
| deliberate      | 350ms (`smoothEase`, sheets)    | sheets, transiciones de página         |
| snappySpring    | spring .2 / bounce 0            | badges de conteo, chips                |
| gooeySpring     | spring .36 / bounce .24         | popovers con blur                      |
| indicatorSpring | spring .45 / bounce .18         | rails activos, underline de tabs       |

Reglas:

- Nunca importar `shared/ui/smoothui/lib/animation.ts` desde código first-party (es vendor interno).
- Todo `transition={{...}}` inline nuevo es violación — usar tokens.
- Todo motion pasa por `useReducedTransition` (o `MotionConfig reducedMotion`).
- El patrón aspiracional premium es el morph del botón "+" (`GooeyPopover`, GSAP): shared-element morph, etapas solapadas, easing direccional. Reservado para momentos hero, no para cada popover.

## Canon por categoría (decidido)

| Categoría       | Canónico                                                   | Migrar/eliminar                                                                 |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Confirmación    | `molecules/confirm-dialog.tsx` (tone default\|destructive) | hecho: DeleteView, DeletePipeline, SectorConfirm                                |
| Skeleton listas | `molecules/skeleton-list.tsx`                              | hecho: 4 panes settings                                                         |
| Popover animado | `GroovyPopover` (Radix crudo, sin doble animación)         | hecho                                                                           |
| Input           | `SmoothInput`                                              | shadcn `Input` solo interno de `input-group`; migrar `InputGroup` a SmoothInput |
| Checkbox        | `SmoothCheckbox`                                           | —                                                                               |
| Tooltip         | `HintTooltip` / `TruncateTip`                              | —                                                                               |
| Empty state     | `EmptyState` + crear variante inline ligera                | 4 empties ad-hoc                                                                |
| Paginación      | `PaginationCapsule`                                        | —                                                                               |
| Date picker     | `molecules/date-picker.tsx` hoy; ruixen adaptado después   | ver Fase 4                                                                      |

## Fases restantes

### Fase 2 — Formularios y controles ✅

- `AnimatedToggle` es el toggle canónico; los 3 usos de shadcn `Switch` migrados y `switch.tsx` eliminado (reinstalable via shadcn).
- `TileRadioGroup` (`molecules/tile-radio-group.tsx`): radio real con roving tabindex + flechas; migrados `FieldTypePicker`, `SectorPicker`, `PresetsSection`. `OptionTile` queda para toggles sueltos y exporta `optionTileClass` compartida.
- `ControlledField`: props agrupadas (`control`, `name`, `field`, `actions`, `hintFormat`) — fuera del baseline.
- `FieldLabel` con `variant="section"` reemplaza los 9 `Label` crudos con className duplicado en appearance/\*; baseline de duplicación encogido.
- `zodResolver` verificado presente en todos los `use*Form.ts`.

### Fase 3 — Búsqueda, tabs, chips ✅

- `molecules/search-input.tsx`: icono + input + clear (Escape limpia) — migrado SettingsNav.
- `molecules/searchable-command.tsx`: Command + búsqueda + empty — dedup AsyncSelect y QuickFilter.
- `CommandEmpty` del vendor ahora trae el estilo estándar por defecto (4 overrides idénticos eliminados).
- `molecules/step-rail.tsx`: rail vertical de pasos promovido desde WizardLayout (era `StepItem` local); pill "opcional" via `BadgeSoft tone=outline`. `AnimatedStepper` queda como stepper horizontal (ImportWizard) — son layouts distintos, ambos canon.
- Chips: evaluado — `FilterChip` (condición editable segmentada) y `ActiveChips` (pill removible) sirven interacciones distintas; se mantienen separados con animaciones ya tokenizadas.

### Fase 4 — Calendarios ✅ (parcial por diseño)

- `DatePicker` reescrito estilo ruixen en `molecules/date-picker/` (index + calendar-panel + date-iso): grid animado con `smoothSpring` y slide direccional de mes, dot de hoy, tokens Nexo, Intl es-CO/en-US, DD/MM/YYYY, mismo API — swap transparente para CustomFieldInput y value-editor. `react-day-picker` eliminado del manifest.
- `RangeCalendar`/`CalendarScheduler`/`CalendarCrest`/`ChronoSelect` (vendor ruixen) quedan como material fuente knip-ignorado: se adaptan igual que el DatePicker cuando exista su consumidor real (date-range en filtros, scheduler de actividades — 24h, no AM/PM). No construir sin consumidor (knip los mataría).

### Fase 5 — Botones ✅ (PillButton canon)

Ejecutada: 33+ archivos migrados en manage-settings, setup-workspace, import-contacts, entities, widgets y views. Cero imports de `shadcn/button` fuera de `shared/ui`. Los 5 dialogs RHF llevan `type="submit"` explícito (PillButton defaultea `type="button"`). `variant="link"` de UploadStep → PillButton ghost con clases de link.

Regla: código de features/entities/widgets/views usa **PillButton**; shadcn `Button` queda solo como base interna de `shared/ui` (presets como HeaderIconButton pueden envolverlo). `PillButton` ganó `outline`, `destructive`, focus ring y svg sizing.

Mapping de migración `Button` → `PillButton`:

| Button                | PillButton                                                   |
| --------------------- | ------------------------------------------------------------ |
| `default` / `default` | `primary` / `sm`                                             |
| `destructive`         | `destructive` / `sm`                                         |
| `ghost`               | `ghost` (size `default`→`sm`, `sm`→`xs`)                     |
| `outline`             | `outline` / `sm`                                             |
| `secondary`           | `secondary` / `sm`                                           |
| `link`                | enlace `<Link>`/`<a>` con clases de link                     |
| `size=icon*` sueltos  | preset `HeaderIconButton` o `ghost` + `className="w-8 px-0"` |

Ejecutar por slices (settings → setup-workspace → import-contacts → resto), verificando en Storybook side-by-side.

### Fase 6 — Texto y limpieza

- Typography ✅: 62 sitios migrados a `Text`; baseline 70 → 13. `Text` ganó variantes `label`, `bold`, `lead`, `faint`, `fine`, `micro`, `mono` y prop `role`. Los 13 restantes son legítimos no-tipográficos (badges/cajas, `style` dinámico del theme preview, spans que heredan color de estado, asteriscos) — quedan congelados a propósito.
- `ContactsSkeleton`: evaluado — se queda (skeleton de página pre-mount sin instancia de tabla; `useSkeletonHint` lee el layout persistido real, se auto-sincroniza).
- `check-ui-purity` ampliado a `shared/ui/` ✅; el fetch de AsyncSelect vive ahora en `shared/lib/hooks/useAsyncSelect.ts` (patrón `useTypeaheadList`) — baseline 5 → 4.
- `StatTile` promovido a `shared/ui/molecules/stat-tile.tsx` ✅. `SaveBar`, `WizardStep`, `IssueList`, `SettingsNavRow` se promueven cuando aparezca su segundo consumidor (promoción sin consumidor extra = churn sin beneficio).
- Promover genéricos: `StatTile`, `SaveBar`, `WizardStep`, `SettingsNavRow`, `IssueList`, `FileSummary`.
- Ampliar `check-ui-purity.mjs` a `shared/ui/` (hoy no ve el `useQuery` de `use-async-select.ts`) y mover ese fetch a patrón contenedor.
- Dead code: decidir sobre `BadgeInk`, kanban/kpi (staged para deals — mantener), ruixen sin uso.

### Fase 7 — Storybook

- Story por componente canónico con: Default, estados (hover/focus/disabled), Loading, Empty, Error donde aplique, WorstCase (convención de casa), Playground.
- Los cops aplican a stories (no comments, no colores crudos).

## Reglas de oro al ejecutar

1. Un PR/commit por fase o sub-fase; nunca big-bang.
2. Cada migración visual se verifica en Storybook side-by-side (light/dark/density).
3. Baselines de cops solo encogen.
4. Nada de sobre-animación: si un elemento ya tiene spring, su contenedor no anima.
