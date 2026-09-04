import { CUSTOM_COLUMN_PREFIX, type ContactColumnDef } from '@repo/shared-types'

import {
  CORE_FIELDS,
  CUSTOM_TYPE_MAP,
  NAME_FILTER_FIELD,
  type AdvancedFieldSources,
} from '../config/advanced-filter-fields.constants'

import type { AppIcon } from '@/shared/ui/icons'
import type { FilterFieldDef } from '@/shared/ui/organisms/filter-bar'

type TranslateFn = (key: string) => string

export type { AdvancedFieldSources }

export function buildAdvancedFilterFields(
  t: TranslateFn,
  catalog: ReadonlyArray<ContactColumnDef>,
  sources: AdvancedFieldSources,
  icons: Readonly<Record<string, AppIcon>>,
): FilterFieldDef[] {
  const fields: FilterFieldDef[] = []

  for (const column of catalog) {
    if (column.custom) {
      const key = column.key.slice(CUSTOM_COLUMN_PREFIX.length)
      fields.push({
        key: `custom.${key}`,
        label: column.label ?? key,
        icon: icons.custom,
        type: CUSTOM_TYPE_MAP[column.fieldType ?? ''] ?? 'text',
        options: column.fieldOptions?.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      })
      continue
    }

    const spec = CORE_FIELDS[column.key]
    if (!spec) continue
    fields.push({
      key: column.key === 'name' ? NAME_FILTER_FIELD : column.key,
      label: t(column.labelKey),
      icon: icons[column.key],
      type: spec.type,
      options: spec.options?.(sources),
    })
  }

  return fields
}
