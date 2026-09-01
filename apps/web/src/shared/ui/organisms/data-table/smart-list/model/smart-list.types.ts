import type { AppIcon } from '@/shared/ui/icons'

export type SmartListMenuAction = {
  readonly key: string
  readonly label: string
  readonly icon?: AppIcon
  readonly tone?: 'default' | 'danger'
  readonly onSelect: () => void
}

export interface SmartListItem {
  readonly id: string
  readonly label: string
  readonly count?: number
  readonly description?: string
  readonly pinned?: boolean
}

export interface SmartListsData {
  readonly items: ReadonlyArray<SmartListItem>
  readonly activeId: string
}
