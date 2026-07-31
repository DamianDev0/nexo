import type { AppIcon } from '@/shared/ui/icons'

export interface EntityLabels {
  singular: string
  plural: string
}

export interface NomenclatureState {
  contact: EntityLabels
  company: EntityLabels
  deal: EntityLabels
  activity: EntityLabels
}

export interface NomenclatureEntity {
  readonly key: keyof NomenclatureState
  readonly icon: AppIcon
}

export interface NomenclaturePreset {
  readonly label: string
  readonly icon: string
  readonly values: NomenclatureState
}
