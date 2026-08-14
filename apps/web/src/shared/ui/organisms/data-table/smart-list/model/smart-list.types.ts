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
