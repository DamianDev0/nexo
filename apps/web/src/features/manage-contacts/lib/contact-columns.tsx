import { formatDateShortCO } from '@repo/shared-utils'

import { contactFullName } from '@/entities/contact'
import { DataTable, selectionColumn } from '@/shared/ui/organisms/data-table'

import { ContactNameCell, ContactStatusCell, ContactTagsCell } from './contact-cells'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

type ContactColumn = ColumnDef<ContactListItem, unknown>

interface ContactTaxonomyMaps {
  readonly statusByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly sourceByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly typeByKey: ReadonlyMap<string, TaxonomyChoice>
}

interface TextColumnOptions {
  readonly size: number
  readonly tone?: 'muted' | 'numeric'
  readonly align?: 'start' | 'center' | 'end'
  readonly value?: (contact: ContactListItem) => string | number | null
}

function labelFor(map: ReadonlyMap<string, TaxonomyChoice>, key: string | null): string | null {
  if (!key) return null
  return map.get(key)?.label ?? key
}

function textColumn(
  id: string,
  t: TFunction,
  { size, tone, align, value }: TextColumnOptions,
): ContactColumn {
  const read = value ?? ((contact: ContactListItem) => Reflect.get(contact, id) as string | null)

  return {
    id,
    accessorFn: read,
    header: t(`contacts.columns.${id}`),
    size,
    meta: { align, description: t(`contacts.columnHints.${id}`) },
    cell: ({ row }) => (
      <DataTable.CellText muted={tone === 'muted'} numeric={tone === 'numeric'}>
        {read(row.original)}
      </DataTable.CellText>
    ),
  }
}

export function buildContactColumns(
  t: TFunction,
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
      minSize: 180,
      meta: { grow: true, lockable: true, description: t('contacts.columnHints.name') },
      cell: ({ row }) => <ContactNameCell contact={row.original} />,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('contacts.columns.status'),
      size: 150,
      minSize: 130,
      meta: { lockable: true, description: t('contacts.columnHints.status') },
      cell: ({ row }) => (
        <ContactStatusCell
          status={row.original.status}
          choice={taxonomy.statusByKey.get(row.original.status)}
        />
      ),
    },
    textColumn('email', t, { size: 210 }),
    textColumn('phone', t, { size: 150, tone: 'numeric' }),
    textColumn('whatsapp', t, { size: 150, tone: 'numeric' }),
    textColumn('documentNumber', t, { size: 150, tone: 'numeric' }),
    textColumn('jobTitle', t, { size: 150 }),
    textColumn('lifecycleStage', t, {
      size: 130,
      value: (contact) =>
        t(`contacts.lifecycleStage.${contact.lifecycleStage}`, {
          defaultValue: contact.lifecycleStage,
        }),
    }),
    textColumn('source', t, {
      size: 130,
      tone: 'muted',
      value: (contact) => labelFor(taxonomy.sourceByKey, contact.source),
    }),
    textColumn('type', t, {
      size: 120,
      tone: 'muted',
      value: (contact) => contact.typeLabel ?? labelFor(taxonomy.typeByKey, contact.type),
    }),
    {
      id: 'tags',
      accessorFn: (row) => row.tags.join(', '),
      header: t('contacts.columns.tags'),
      size: 150,
      enableSorting: false,
      meta: { description: t('contacts.columnHints.tags') },
      cell: ({ row }) => (
        <ContactTagsCell
          tags={row.original.tags}
          label={(count) => t('contacts.tagCount', { count })}
        />
      ),
    },
    textColumn('city', t, { size: 130, tone: 'muted' }),
    textColumn('leadScore', t, { size: 110, tone: 'numeric', align: 'end' }),
    textColumn('lastContactedAt', t, {
      size: 150,
      tone: 'numeric',
      value: (contact) =>
        contact.lastContactedAt ? formatDateShortCO(contact.lastContactedAt) : null,
    }),
    textColumn('createdAt', t, {
      size: 140,
      tone: 'numeric',
      value: (contact) => formatDateShortCO(contact.createdAt),
    }),
  ]
}
