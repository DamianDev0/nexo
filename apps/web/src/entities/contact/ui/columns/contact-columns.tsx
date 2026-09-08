import { selectionColumn } from '@/shared/ui/organisms/data-table'

import { CONTACT_COLUMN_ALIGN, CONTACT_GROW_COLUMN } from '../../config/contact-columns.constants'
import { contactAccessor } from '../../lib/contact-accessor'
import { ContactCellSaving } from '../cells/ContactCellSaving'

import { contactCellRenderer, withContactCellLabels } from './cell-renderers'
import { customFieldCellRenderer } from './custom-field-cells'

import type {
  ContactColumnContext,
  ContactRenderContext,
} from '../../model/types/contact-cells.types'
import type { ContactColumnDef, ContactListItem } from '@repo/shared-types'
import type { ColumnDef } from '@tanstack/react-table'

type ContactColumn = ColumnDef<ContactListItem, unknown>

function dataColumn(def: ContactColumnDef, context: ContactRenderContext): ContactColumn {
  const render = def.custom ? customFieldCellRenderer(def) : contactCellRenderer(def.key)
  const label = def.custom ? (def.label ?? def.key) : context.t(def.labelKey)

  return {
    id: def.key,
    accessorFn: contactAccessor(def.key),
    header: label,
    size: def.defaultWidth,
    minSize: def.minWidth,
    enableSorting: def.sortField !== null,
    enableHiding: def.key !== CONTACT_GROW_COLUMN,
    meta: {
      label,
      description: def.custom
        ? (def.label ?? def.key)
        : context.t(def.hintKey, { entity: context.entity ?? '' }),
      align: CONTACT_COLUMN_ALIGN[def.key],
      grow: def.key === CONTACT_GROW_COLUMN,
      lockable: true,
    },
    cell: ({ row }) => (
      <ContactCellSaving
        saving={context.pendingIds?.has(row.original.id) ?? false}
        label={context.labels.saving}
      >
        {render(row.original, context)}
      </ContactCellSaving>
    ),
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
