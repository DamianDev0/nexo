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

export function ContactCityCell({ value, labels, onSelect }: Readonly<ContactCityCellProps>) {
  if (!onSelect) return <DataTable.CellText muted>{value}</DataTable.CellText>

  return (
    <MunicipalityCombobox
      value={value ?? ''}
      label={labels.field}
      placeholder={labels.placeholder}
      compact
      triggerClassName="font-light text-muted-foreground"
      onSelect={onSelect}
    />
  )
}
