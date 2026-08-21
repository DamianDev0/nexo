import { CUSTOM_COLUMN_PREFIX } from '@repo/shared-types'

import { contactFullName } from '@/entities/contact'
import { selectionColumn } from '@/shared/ui/organisms/data-table'

import { CONTACT_COLUMN_ALIGN, CONTACT_GROW_COLUMN } from '../../config/contact-columns.constants'

import { contactCellRenderer, withContactCellLabels } from './cell-renderers'

import type {
  ContactColumnContext,
  ContactRenderContext,
} from '../../model/types/contact-cells.types'
import type { ContactColumnDef, ContactListItem } from '@repo/shared-types'
import type { ColumnDef } from '@tanstack/react-table'

type ContactColumn = ColumnDef<ContactListItem, unknown>

function accessorFor(key: string): (contact: ContactListItem) => unknown {
  if (key === 'name') return contactFullName
  if (key.startsWith(CUSTOM_COLUMN_PREFIX)) {
    const fieldKey = key.slice(CUSTOM_COLUMN_PREFIX.length)
    return (contact) => contact.customFields?.[fieldKey]
  }
  return (contact) => Reflect.get(contact, key)
}

function dataColumn(def: ContactColumnDef, context: ContactRenderContext): ContactColumn {
  const render = contactCellRenderer(def.key)
  const label = def.custom ? (def.label ?? def.key) : context.t(def.labelKey)

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
      description: def.custom ? (def.label ?? def.key) : context.t(def.hintKey),
      align: CONTACT_COLUMN_ALIGN[def.key],
      grow: def.key === CONTACT_GROW_COLUMN,
      lockable: true,
    },
    cell: ({ row }) => render(row.original, context),
  }
}

export function buildContactColumns(
  catalog: ReadonlyArray<ContactColumnDef>,
  context: ContactColumnContext,
): ReadonlyArray<ContactColumn> {
  const renderContext = withContactCellLabels(context)

  return [
    selectionColumn<ContactListItem>({
      all: context.t('common.table.selectAll'),
      row: context.t('common.table.selectRow'),
    }),
    ...catalog.map((def) => dataColumn(def, renderContext)),
  ]
}
