'use client'

import { memo } from 'react'

import { SortableRow } from '@/shared/ui/molecules/sortable-row'

import { TaxonomyOptionRow } from './TaxonomyOptionRow'

import type { TaxonomyRowActions } from '../../../model/types'
import type { TaxonomyOption } from '@repo/shared-types'

interface SortableTaxonomyOptionProps {
  readonly row: { readonly option: TaxonomyOption; readonly label: string; readonly count: number }
  readonly actions: TaxonomyRowActions
}

function SortableTaxonomyOptionBase({ row, actions }: Readonly<SortableTaxonomyOptionProps>) {
  return (
    <SortableRow id={row.option.key}>
      {(handle) => <TaxonomyOptionRow row={row} actions={actions} handle={handle} />}
    </SortableRow>
  )
}

export const SortableTaxonomyOption = memo(SortableTaxonomyOptionBase)
