import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { ReactNode } from 'react'

export type RecordPager = {
  readonly index: number
  readonly total: number
  readonly hasPrev: boolean
  readonly hasNext: boolean
  readonly prev: () => void
  readonly next: () => void
}

export type RecordDrawerLabels = {
  readonly title: string
  readonly prev: string
  readonly next: string
  readonly close: string
}

export type QuickAction = {
  readonly id: string
  readonly label: string
  readonly icon: ReactNode
  readonly onClick?: () => void
  readonly disabled?: boolean
  readonly reason?: string
  readonly menu?: ReadonlyArray<ActionMenuItem>
}

export type SectionMeta = {
  readonly count?: number
  readonly badge?: ReactNode
}

export type SectionAction = {
  readonly label: string
  readonly onClick: () => void
}

export type FieldRow = {
  readonly key: string
  readonly label: string
  readonly value: ReactNode | null
  readonly href?: string
}
