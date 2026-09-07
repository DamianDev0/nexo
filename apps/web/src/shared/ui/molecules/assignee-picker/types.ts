export type AssigneeOption = {
  readonly id: string
  readonly name: string
  readonly meta?: string
  readonly badge?: string
  readonly avatarUrl?: string | null
}

export type AssigneePickerLabels = {
  readonly trigger: string
  readonly search: string
  readonly empty: string
  readonly unassign: string
}
