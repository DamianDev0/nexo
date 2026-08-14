import type { SidebarModuleKey } from './nav.types'
import type { EntityForm, EntityKey } from '@/entities/nomenclature'
import type { AppIcon } from '@/shared/ui/icons'

export type EntityLabelFn = (entity: EntityKey, form: EntityForm) => string

export interface QuickCreateTarget {
  readonly entity: EntityKey
  readonly module: SidebarModuleKey
  readonly href: string
  readonly available: boolean
}

export interface QuickCreateItem {
  readonly entity: EntityKey
  readonly label: string
  readonly icon: AppIcon
  readonly href: string
  readonly available: boolean
}
