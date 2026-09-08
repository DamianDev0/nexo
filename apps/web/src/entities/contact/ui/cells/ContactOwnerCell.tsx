'use client'

import { AssigneePicker } from '@/shared/ui/molecules/assignee-picker'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { DataTable } from '@/shared/ui/organisms/data-table'

import type { AssigneeOption, AssigneePickerLabels } from '@/shared/ui/molecules/assignee-picker'

type ContactOwnerCellProps = {
  readonly value: string | null
  readonly name: string | null
  readonly options?: ReadonlyArray<AssigneeOption>
  readonly labels: AssigneePickerLabels
  readonly onChange?: (id: string | null, name: string | null) => void
}

export function ContactOwnerCell({
  value,
  name,
  options,
  labels,
  onChange,
}: Readonly<ContactOwnerCellProps>) {
  if (!onChange || !options || options.length === 0) {
    return name ? (
      <TruncateTip className="text-body">{name}</TruncateTip>
    ) : (
      <DataTable.CellText muted>{null}</DataTable.CellText>
    )
  }

  return (
    <AssigneePicker
      value={value}
      options={options}
      labels={labels}
      view={{ compact: true }}
      onChange={(id) => onChange(id, options.find((option) => option.id === id)?.name ?? null)}
    />
  )
}
