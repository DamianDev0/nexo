import type { DataTableSort } from '@/shared/ui/organisms/data-table'
import type { ObjectColumnDef } from '@repo/shared-types'

export type RecordSort<TField extends string = string> = {
  readonly field: TField
  readonly direction: 'asc' | 'desc'
}

export function toColumnSort<TField extends string>(
  sort: RecordSort<TField> | null,
  catalog: ReadonlyArray<ObjectColumnDef<TField>>,
): DataTableSort | null {
  if (!sort) return null

  const column = catalog.find((def) => def.sortField === sort.field)
  return column ? { field: column.key, direction: sort.direction } : null
}

export function fromColumnSort<TField extends string>(
  sort: DataTableSort | null,
  catalog: ReadonlyArray<ObjectColumnDef<TField>>,
): RecordSort<TField> | null {
  if (!sort) return null

  const column = catalog.find((def) => def.key === sort.field)
  return column?.sortField ? { field: column.sortField, direction: sort.direction } : null
}
