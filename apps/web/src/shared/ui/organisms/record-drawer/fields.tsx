import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'

import type { FieldRow, SectionAction } from './types'
import type { ReactNode } from 'react'

function renderFieldValue(row: FieldRow, emptyValue: string): ReactNode {
  if (row.value === null) return emptyValue
  if (!row.href) return row.value
  return (
    <a href={row.href} className="underline-offset-4 hover:underline">
      {row.value}
    </a>
  )
}

type RecordDrawerFieldsProps = {
  readonly rows: ReadonlyArray<FieldRow>
  readonly emptyValue?: string
}

export function RecordDrawerFields({ rows, emptyValue = '—' }: Readonly<RecordDrawerFieldsProps>) {
  return (
    <dl data-slot="record-drawer-fields" className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.key} className="flex flex-col gap-0.5">
          <Text as="dt" variant="hint">
            {row.label}
          </Text>
          <Text as="dd" variant={row.value === null ? 'faint' : 'body'} className="truncate">
            {renderFieldValue(row, emptyValue)}
          </Text>
        </div>
      ))}
    </dl>
  )
}

type RecordDrawerEmptyProps = {
  readonly label: string
  readonly action?: SectionAction
}

export function RecordDrawerEmpty({ label, action }: Readonly<RecordDrawerEmptyProps>) {
  return (
    <div
      data-slot="record-drawer-empty"
      className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-3 py-2.5"
    >
      <Text variant="muted">{label}</Text>
      {action ? (
        <PillButton variant="ghost" size="xs" onClick={action.onClick}>
          {action.label}
        </PillButton>
      ) : null}
    </div>
  )
}
