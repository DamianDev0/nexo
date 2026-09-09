import type { AppIcon } from '@/shared/ui/icons'
import type { FilterFieldType } from '@repo/shared-types'

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
