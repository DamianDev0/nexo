import { contactFullName } from '@/entities/contact'
import { selectionColumn } from '@/shared/ui/organisms/data-table'

import {
  CONTACT_COLUMN_ALIGN,
  CONTACT_GROW_COLUMN,
  CONTACT_LOCKABLE_COLUMNS,
} from '../config/contact-columns.constants'

import { contactCellRenderer } from './contact-column-cells'

import type { ContactColumnContext } from './contact-column-cells'
import type { ContactColumnDef, ContactListItem } from '@repo/shared-types'
import type { ColumnDef } from '@tanstack/react-table'

type ContactColumn = ColumnDef<ContactListItem, unknown>

function accessorFor(key: string): (contact: ContactListItem) => unknown {
  if (key === 'name') return contactFullName
  return (contact) => Reflect.get(contact, key)
}

function dataColumn(def: ContactColumnDef, context: ContactColumnContext): ContactColumn {
  const render = contactCellRenderer(def.key)
  const label = context.t(def.labelKey)

  return {
    id: def.key,
    accessorFn: accessorFor(def.key),
    header: label,
    size: def.defaultWidth,
    minSize: def.minWidth,
    enableSorting: def.sortField !== null,
    enableHiding: def.key !== CONTACT_GROW_COLUMN,
    meta: {
      label,
      description: context.t(def.hintKey),
      align: CONTACT_COLUMN_ALIGN[def.key],
      grow: def.key === CONTACT_GROW_COLUMN,
      lockable: CONTACT_LOCKABLE_COLUMNS.includes(def.key),
    },
    cell: ({ row }) => render(row.original, context),
  }
}

export function buildContactColumns(
  catalog: ReadonlyArray<ContactColumnDef>,
  context: ContactColumnContext,
): ReadonlyArray<ContactColumn> {
  return [
    selectionColumn<ContactListItem>({
      all: context.t('common.table.selectAll'),
      row: context.t('common.table.selectRow'),
    }),
    ...catalog.map((def) => dataColumn(def, context)),
  ]
}
