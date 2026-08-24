'use client'

import { memo } from 'react'

import { SortableRow } from '@/shared/ui/molecules/sortable-row'

import { FieldRow } from './FieldRow'

import type { FieldRowActions } from './FieldRow'
import type { FieldDef } from '@repo/shared-types'

interface SortableFieldRowProps {
  readonly field: FieldDef
  readonly actions: FieldRowActions
}

function SortableFieldRowBase({ field, actions }: Readonly<SortableFieldRowProps>) {
  return (
    <SortableRow id={field.key}>
      {(handle) => <FieldRow field={field} actions={actions} handle={handle} />}
    </SortableRow>
  )
}

export const SortableFieldRow = memo(SortableFieldRowBase)
