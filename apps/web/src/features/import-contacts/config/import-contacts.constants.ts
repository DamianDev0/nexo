import type { DuplicateStrategy } from '@repo/shared-types'

export const IMPORT_STEPS = ['upload', 'configure', 'map', 'review', 'done'] as const

export const IMPORT_ACCEPT = '.csv,.xlsx'

export const IMPORT_MAX_SIZE_MB = 25

export const IMPORT_STRATEGIES: ReadonlyArray<DuplicateStrategy> = ['skip', 'update', 'create']

export const IMPORT_UNMAPPED = '__unmapped__'

export const IMPORT_PREVIEW_COLUMNS = 4

export const IMPORT_ISSUES_SHOWN = 25

export const IMPORT_ISSUE_FILTERS = ['all', 'errors', 'warnings'] as const
