import { CONTACTS_DEFAULT_PINNED_COLUMNS } from '../config/contacts-table.constants'

import type { DataTableLayout } from '@/shared/ui/organisms/data-table'
import type { ContactColumnDef, ContactTableState, ContactViewColumns } from '@repo/shared-types'

export function defaultHiddenColumns(
  catalog: ReadonlyArray<ContactColumnDef>,
): ReadonlyArray<string> {
  return catalog.filter((def) => !def.defaultVisible).map((def) => def.key)
}

export function toDataTableLayout(
  state: ContactTableState,
  catalog: ReadonlyArray<ContactColumnDef>,
): DataTableLayout {
  const columns = state.columns ?? {}

  return {
    order: columns.order,
    hidden: columns.hidden ?? defaultHiddenColumns(catalog),
    widths: columns.widths,
    pinnedLeft: columns.pinnedLeft ?? CONTACTS_DEFAULT_PINNED_COLUMNS,
    density: state.density,
  }
}

export function toContactTableState(layout: DataTableLayout): ContactTableState {
  const columns: ContactViewColumns = {
    order: [...(layout.order ?? [])],
    hidden: [...(layout.hidden ?? [])],
    widths: { ...layout.widths },
    pinnedLeft: [...(layout.pinnedLeft ?? [])],
  }

  return { columns, density: layout.density }
}
