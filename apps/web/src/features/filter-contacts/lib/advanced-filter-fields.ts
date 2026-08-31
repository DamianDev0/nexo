import {
  CUSTOM_COLUMN_PREFIX,
  type ContactColumnDef,
  type FilterFieldType,
} from '@repo/shared-types'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { AppIcon } from '@/shared/ui/icons'
import type { FilterFieldDef, FilterFieldOption } from '@/shared/ui/organisms/filter-bar'

type TranslateFn = (key: string) => string

export type AdvancedFieldSources = {
  readonly statuses: ReadonlyArray<TaxonomyChoice>
  readonly sources: ReadonlyArray<TaxonomyChoice>
  readonly lifecycleStages: ReadonlyArray<TaxonomyChoice>
  readonly tags: ReadonlyArray<string>
}

type CoreFieldSpec = {
  readonly type: FilterFieldType
  readonly options?: (sources: AdvancedFieldSources) => ReadonlyArray<FilterFieldOption>
}

const toOptions = (choices: ReadonlyArray<TaxonomyChoice>): ReadonlyArray<FilterFieldOption> =>
  choices.map((choice) => ({ value: choice.key, label: choice.label, color: choice.color }))

const CORE_FIELDS: Readonly<Record<string, CoreFieldSpec>> = {
  name: { type: 'text' },
  email: { type: 'text' },
  phone: { type: 'text' },
  whatsapp: { type: 'text' },
  city: { type: 'text' },
  status: { type: 'select', options: (s) => toOptions(s.statuses) },
  source: { type: 'select', options: (s) => toOptions(s.sources) },
  lifecycleStage: { type: 'select', options: (s) => toOptions(s.lifecycleStages) },
  tags: {
    type: 'multi',
    options: (s) => s.tags.map((tag) => ({ value: tag, label: tag })),
  },
  leadScore: { type: 'number' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
  lastContactedAt: { type: 'date' },
}

const NAME_FILTER_FIELD = 'firstName'

const CUSTOM_TYPE_MAP: Readonly<Partial<Record<string, FilterFieldType>>> = {
  select: 'select',
  multiselect: 'select',
  number: 'text',
  currency: 'text',
}

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
