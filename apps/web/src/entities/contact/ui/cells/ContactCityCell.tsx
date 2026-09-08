'use client'

import { MunicipalityCombobox } from '@/entities/geo'
import { DataTable } from '@/shared/ui/organisms/data-table'

import type { CityCellLabels } from '../../model/types/contact-cells.types'
import type { MunicipalityPick } from '../fields/ContactCityField'

type ContactCityCellProps = {
  readonly value: string | null
  readonly labels: CityCellLabels
  readonly onSelect?: (municipality: MunicipalityPick) => void
}

const TRIGGER =
  'h-auto w-full min-w-0 justify-between gap-1 rounded-md border-transparent bg-transparent px-1 py-0.5 font-light text-muted-foreground shadow-none hover:bg-muted'

export function ContactCityCell({ value, labels, onSelect }: Readonly<ContactCityCellProps>) {
  if (!onSelect) return <DataTable.CellText muted>{value}</DataTable.CellText>

  return (
    <MunicipalityCombobox
      value={value ?? ''}
      placeholder={labels.placeholder}
      triggerClassName={TRIGGER}
      onSelect={onSelect}
    />
  )
}
