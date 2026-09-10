import type { ReactNode } from 'react'

export type RailItem = {
  readonly id: string
  readonly label: string
  readonly icon: ReactNode
  readonly count?: number
  readonly attention?: boolean
}

export type PanelAction = {
  readonly label: string
  readonly onClick: () => void
}

export type RecordLayoutLabels = {
  readonly collapsePanel: string
  readonly expandAside: string
  readonly collapseAside: string
}
