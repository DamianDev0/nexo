'use client'

import { useState } from 'react'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { PencilSimpleIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { SmoothInput } from '@/shared/ui/smoothui/input'

import type { EditableCellLabels } from '../../model/types/contact-cells.types'

export type TextCellValue = {
  readonly raw: string
  readonly display: string | null
  readonly numeric: boolean
}

type ContactTextFieldCellProps = {
  readonly field: string
  readonly value: TextCellValue
  readonly labels: EditableCellLabels
  readonly onSave?: (raw: string) => void
}

function EditPopover({
  field,
  value,
  labels,
  onSave,
}: Readonly<Required<ContactTextFieldCellProps>>) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value.raw)

  const commit = () => {
    const next = draft.trim()
    if (next !== value.raw) onSave(next)
    setOpen(false)
  }

  return (
    <GroovyPopover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(value.raw)
        setOpen(next)
      }}
    >
      <GroovyPopover.Trigger asChild>
        <PillButton
          variant="ghost"
          size="xs"
          aria-label={labels.edit(field)}
          className="group/edit -mx-1.5 h-auto w-full min-w-0 justify-between gap-1.5 rounded-md px-1.5 py-0.5 font-normal"
        >
          <DataTable.CellText numeric={value.numeric}>{value.display}</DataTable.CellText>
          <PencilSimpleIcon
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-120 group-hover/edit:opacity-100"
          />
        </PillButton>
      </GroovyPopover.Trigger>
      <GroovyPopover.Content subtle align="start" autoFocusContent className="w-64 p-2">
        <SmoothInput
          aria-label={field}
          type={value.numeric ? 'number' : 'text'}
          value={draft}
          autoFocus
          className="h-9 border-border bg-surface-input text-sm"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
          }}
        />
        <span className="mt-2 flex justify-end gap-1.5">
          <PillButton variant="outline" size="xs" onClick={() => setOpen(false)}>
            {labels.cancel}
          </PillButton>
          <PillButton size="xs" onClick={commit}>
            {labels.save}
          </PillButton>
        </span>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}

export function ContactTextFieldCell(props: Readonly<ContactTextFieldCellProps>) {
  const { value, onSave } = props
  if (!onSave)
    return <DataTable.CellText numeric={value.numeric}>{value.display}</DataTable.CellText>
  return <EditPopover {...props} onSave={onSave} />
}
