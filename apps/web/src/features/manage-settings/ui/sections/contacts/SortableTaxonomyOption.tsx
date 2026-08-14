'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { memo } from 'react'

import { cn } from '@/shared/lib/cn'

import { TaxonomyOptionRow } from './TaxonomyOptionRow'

import type { TaxonomyRowActions } from '../../../model/types'
import type { TaxonomyOption } from '@repo/shared-types'

interface SortableTaxonomyOptionProps {
  readonly row: { readonly option: TaxonomyOption; readonly label: string; readonly count: number }
  readonly actions: TaxonomyRowActions
}

function SortableTaxonomyOptionBase({ row, actions }: Readonly<SortableTaxonomyOptionProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.option.key,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40')}
    >
      <TaxonomyOptionRow row={row} actions={actions} handle={{ attributes, listeners }} />
    </div>
  )
}

export const SortableTaxonomyOption = memo(SortableTaxonomyOptionBase)
