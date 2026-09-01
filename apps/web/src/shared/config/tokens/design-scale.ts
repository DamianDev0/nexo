export interface ScaleRow {
  readonly token: string
  readonly value: string
  readonly use: string
}

export const TYPE_SCALE: ReadonlyArray<ScaleRow> = [
  {
    token: 'display-hero',
    value: '104px / 0.90 / -0.05em / 900',
    use: 'Marketing hero. One per page.',
  },
  { token: 'display-xl', value: '84px / 0.88 / -0.05em / 900', use: 'Page hero inside the app.' },
  { token: 'display-lg', value: '56px / 0.98 / -0.045em / 900', use: 'Page title.' },
  {
    token: 'display-md',
    value: '36px / 1.05 / -0.035em / 900',
    use: 'KPI figure, empty-state headline.',
  },
  { token: 'heading-md', value: '20px / 1.35 / -0.015em / 700', use: 'Card title, panel header.' },
  { token: 'heading-sm', value: '16px / 1.4 / 500', use: 'Dialog title, section header.' },
  { token: 'body-md', value: '15px / 1.6 / 400', use: 'Default. Cells, field values, menu items.' },
  {
    token: 'row-title',
    value: '15px / 1.35 / 700',
    use: 'First column of a row, kanban card title.',
  },
  { token: 'body-sm', value: '13px / 1.5 / 400', use: 'Sub-lines, helper text, timestamps.' },
  { token: 'label', value: '13px / 1.2 / 500', use: 'Field labels.' },
  { token: 'badge', value: '12.5px / 1.0 / 900', use: 'Badge text, both families.' },
  {
    token: 'overline',
    value: '11px / 1.0 / 0.14em / 900 UPPERCASE',
    use: 'Group labels, table headers.',
  },
  { token: 'mono', value: '13px / 1.5 / 400 Geist Mono', use: 'IDs, slugs, code. Never money.' },
]

export const SPACE_SCALE: ReadonlyArray<ScaleRow> = [
  { token: 'xxs', value: '2px', use: 'Hairline offsets.' },
  { token: 'xs', value: '4px', use: 'Base unit.' },
  { token: 'sm', value: '8px', use: 'Chip gaps.' },
  { token: 'md', value: '12px', use: 'Intra-card gaps.' },
  { token: 'lg', value: '16px', use: 'Card gaps.' },
  { token: 'xl', value: '24px', use: 'Card padding.' },
  { token: '2xl', value: '32px', use: 'Block separation.' },
  { token: '3xl', value: '48px', use: 'Section separation.' },
  { token: '4xl', value: '64px', use: 'Page sections.' },
]

export const RADIUS_SCALE: ReadonlyArray<ScaleRow> = [
  { token: 'radius-sm', value: '6px', use: 'Checkboxes.' },
  { token: 'radius-md', value: '12px', use: 'Avatar squircles, small chrome.' },
  { token: 'radius-lg', value: '18px', use: 'Kanban cards, inner tiles.' },
  { token: 'radius-xl', value: '24px', use: 'Canonical: cards, buttons, panels, dialogs.' },
  { token: 'pill', value: '9999px', use: 'Badges, chips, filters, avatars, pagination, nav.' },
]

export const ELEVATION_SCALE: ReadonlyArray<ScaleRow> = [
  { token: 'e0', value: 'canvas, no border', use: 'Page background.' },
  { token: 'e1', value: 'white card, no border, no shadow', use: 'Cards, tables, kanban columns.' },
  { token: 'e2', value: 'var(--shadow-e2)', use: 'Popovers, toasts, dragged card, pagination.' },
  { token: 'e3', value: 'var(--shadow-e3)', use: 'Dialogs, sheets, command palette.' },
]

export const MOTION_SCALE: ReadonlyArray<ScaleRow> = [
  {
    token: 'instant',
    value: '120ms ease (duration-120)',
    use: 'Hover, focus halo, checkbox.',
  },
  {
    token: 'fast',
    value: '180ms cubic-bezier(.25,.1,.25,1) (quickEase / subtleTween 140ms)',
    use: 'Micro fades, chips, route content swap.',
  },
  {
    token: 'standard',
    value: '200ms ease (duration-200); dialogs: open 250ms ease-out / close 150ms ease-in',
    use: 'Dropdowns, dialogs, toasts, tab change.',
  },
  {
    token: 'deliberate',
    value: '350ms cubic-bezier(.25,.1,.25,1) (smoothEase, sheets)',
    use: 'Page transitions, sheets, wizard.',
  },
  {
    token: 'snappy spring',
    value: 'duration .2 / bounce 0 (snappySpring)',
    use: 'Count badges, chips add/remove.',
  },
  {
    token: 'gooey spring',
    value: 'duration .36 / bounce .24 (gooeySpring)',
    use: 'Popovers with blur entrance.',
  },
  {
    token: 'indicator spring',
    value: 'duration .45 / bounce .18 (indicatorSpring)',
    use: 'Active rails, tab underline.',
  },
]
