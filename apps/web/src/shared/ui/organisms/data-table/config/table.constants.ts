export const DATA_TABLE_SELECTION_ID = 'select'

export const DATA_TABLE_GUTTER = 'px-4'

export const DATA_TABLE_ROW_HEIGHT = { comfortable: 52, compact: 40 } as const

export const DATA_TABLE_PIN_ZONE = 3

export const DATA_TABLE_MIN_COLUMN_WIDTH = 90

export const DATA_TABLE_MAX_COLUMN_WIDTH = 480

export const DATA_TABLE_STORAGE_PREFIX = 'nexo.table.'

export const DATA_TABLE_ICON_BUTTON = 'size-5 text-faint hover:bg-muted hover:text-foreground'

export const DATA_TABLE_ACTIVE_TONE = 'text-primary-deep dark:text-primary'

export const DATA_TABLE_REVEAL =
  'pointer-events-none opacity-0 transition-opacity group-hover/th:pointer-events-auto group-hover/th:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100'

export const DATA_TABLE_SEARCH_COLLAPSED = 36

export const DATA_TABLE_SEARCH_EXPANDED = 288

export const DATA_TABLE_SEARCH_SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const

export const DATA_TABLE_TOOLBAR_SWAP = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8, pointerEvents: 'none' },
  transition: { duration: 0.18, ease: 'easeOut' },
} as const

export const DATA_TABLE_TOOLBAR_BUTTON =
  'h-9 gap-1.5 rounded-lg border-border px-3 text-sm font-medium text-body hover:border-border-strong hover:bg-muted'
