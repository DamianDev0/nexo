import type { AppIcon } from '@/shared/ui/icons'
import type { FilterCondition, FilterFieldType } from '@repo/shared-types'

export type FilterFieldOption = {
  readonly value: string
  readonly label: string
  readonly color?: string
}

export type FilterFieldDef = {
  readonly key: string
  readonly label: string
  readonly icon?: AppIcon
  readonly type: FilterFieldType
  readonly options?: ReadonlyArray<FilterFieldOption>
}

export type FilterBarProps = {
  readonly fields: ReadonlyArray<FilterFieldDef>
  readonly value: ReadonlyArray<FilterCondition>
  readonly onChange: (next: ReadonlyArray<FilterCondition>) => void
  readonly className?: string
}
