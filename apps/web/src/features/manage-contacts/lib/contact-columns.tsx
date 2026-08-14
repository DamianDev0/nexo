import { formatDateCO } from '@repo/shared-utils'

import { contactFullName } from '@/entities/contact'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { DataTable, selectionColumn } from '@/shared/ui/organisms/data-table'

import { ContactNameCell, ContactRowActions, ContactTagsCell } from './contact-cells'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

type ContactColumn = ColumnDef<ContactListItem, unknown>

interface ContactRowHandlers {
  onEdit: (contact: ContactListItem) => void
  onArchive: (contact: ContactListItem) => void
}

interface ContactTaxonomyMaps {
  readonly statusByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly sourceByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly typeByKey: ReadonlyMap<string, TaxonomyChoice>
}

interface TextColumnOptions {
  readonly size: number
  readonly muted?: boolean
  readonly numeric?: boolean
  readonly align?: 'start' | 'center' | 'end'
  readonly value?: (contact: ContactListItem) => string | number | null
}

function labelFor(map: ReadonlyMap<string, TaxonomyChoice>, key: string | null): string | null {
  if (!key) return null
  return map.get(key)?.label ?? key
}

function textColumn(
  id: string,
  header: string,
  { size, muted, numeric, align, value }: TextColumnOptions,
): ContactColumn {
  const read = value ?? ((contact: ContactListItem) => Reflect.get(contact, id) as string | null)

  return {
    id,
    accessorFn: read,
    header,
    size,
    meta: { align },
    cell: ({ row }) => (
      <DataTable.CellText muted={muted} numeric={numeric}>
        {read(row.original)}
      </DataTable.CellText>
    ),
  }
}

export function buildContactColumns(
  t: TFunction,
  handlers: ContactRowHandlers,
  taxonomy: ContactTaxonomyMaps,
): ReadonlyArray<ContactColumn> {
  return [
    selectionColumn<ContactListItem>({
      all: t('common.table.selectAll'),
      row: t('common.table.selectRow'),
    }),
    {
      id: 'name',
      accessorFn: contactFullName,
      header: t('contacts.columns.name'),
      size: 240,
      meta: { grow: true },
      cell: ({ row }) => <ContactNameCell contact={row.original} />,
    },
    textColumn('jobTitle', t('contacts.columns.jobTitle'), { size: 150 }),
    {
      id: 'status',
      accessorKey: 'status',
      header: t('contacts.columns.status'),
      size: 140,
      cell: ({ row }) => {
        const choice = taxonomy.statusByKey.get(row.original.status)
        return <BadgeSoft color={choice?.color}>{choice?.label ?? row.original.status}</BadgeSoft>
      },
    },
    textColumn('lifecycleStage', t('contacts.columns.lifecycleStage'), {
      size: 130,
      value: (contact) =>
        t(`contacts.lifecycleStage.${contact.lifecycleStage}`, {
          defaultValue: contact.lifecycleStage,
        }),
    }),
    textColumn('source', t('contacts.columns.source'), {
      size: 130,
      muted: true,
      value: (contact) => labelFor(taxonomy.sourceByKey, contact.source),
    }),
    textColumn('type', t('contacts.columns.type'), {
      size: 120,
      muted: true,
      value: (contact) => contact.typeLabel ?? labelFor(taxonomy.typeByKey, contact.type),
    }),
    textColumn('phone', t('contacts.columns.phone'), {
      size: 140,
      numeric: true,
      value: (contact) => contact.phone ?? contact.whatsapp,
    }),
    textColumn('city', t('contacts.columns.city'), { size: 120, muted: true }),
    {
      id: 'tags',
      accessorFn: (row) => row.tags.join(', '),
      header: t('contacts.columns.tags'),
      size: 160,
      enableSorting: false,
      cell: ({ row }) => <ContactTagsCell tags={row.original.tags} />,
    },
    textColumn('leadScore', t('contacts.columns.leadScore'), {
      size: 90,
      numeric: true,
      align: 'end',
    }),
    textColumn('lastContactedAt', t('contacts.columns.lastContacted'), {
      size: 130,
      numeric: true,
      value: (contact) => (contact.lastContactedAt ? formatDateCO(contact.lastContactedAt) : null),
    }),
    textColumn('createdAt', t('contacts.columns.created'), {
      size: 120,
      numeric: true,
      value: (contact) => formatDateCO(contact.createdAt),
    }),
    {
      id: 'actions',
      size: 56,
      enableSorting: false,
      meta: { align: 'end' },
      cell: ({ row }) => (
        <ContactRowActions
          t={t}
          onEdit={() => handlers.onEdit(row.original)}
          onArchive={() => handlers.onArchive(row.original)}
        />
      ),
    },
  ]
}
