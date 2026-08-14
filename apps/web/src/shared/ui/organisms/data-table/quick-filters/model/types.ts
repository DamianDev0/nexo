import type { AppIcon } from '@/shared/ui/icons'

export interface QuickFilterOption {
  readonly value: string
  readonly label: string
  readonly hint?: string
  readonly icon?: AppIcon
  readonly count?: number
}

export interface QuickFilterDef {
  readonly id: string
  readonly label: string
  readonly options: ReadonlyArray<QuickFilterOption>
  readonly selected: ReadonlyArray<string>
}
