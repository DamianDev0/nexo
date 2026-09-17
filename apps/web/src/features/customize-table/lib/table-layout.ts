import type { DataTableLayout } from '@/shared/ui/organisms/data-table'
import type { ObjectColumnDef, ObjectTableState, ObjectViewColumns } from '@repo/shared-types'

export function defaultHiddenColumns(
  catalog: ReadonlyArray<ObjectColumnDef>,
): ReadonlyArray<string> {
  return catalog.filter((def) => !def.defaultVisible).map((def) => def.key)
}

export function toDataTableLayout(
  state: ObjectTableState,
  catalog: ReadonlyArray<ObjectColumnDef>,
  defaultPinned: ReadonlyArray<string>,
): DataTableLayout {
  const columns = state.columns ?? {}

  return {
    order: columns.order,
    hidden: columns.hidden ?? defaultHiddenColumns(catalog),
    widths: columns.widths,
    pinnedLeft: columns.pinnedLeft ?? defaultPinned,
    density: state.density,
  }
}

export function toTableState(layout: DataTableLayout): ObjectTableState {
  const columns: ObjectViewColumns = {
    order: [...(layout.order ?? [])],
    hidden: [...(layout.hidden ?? [])],
    widths: { ...layout.widths },
    pinnedLeft: [...(layout.pinnedLeft ?? [])],
  }

  return { columns, density: layout.density }
}
