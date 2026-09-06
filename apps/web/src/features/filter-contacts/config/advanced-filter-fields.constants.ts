import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { FilterFieldOption } from '@/shared/ui/organisms/filter-bar'
import type { FilterFieldType } from '@repo/shared-types'

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

export const CORE_FIELDS: Readonly<Record<string, CoreFieldSpec>> = {
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
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
  lastContactedAt: { type: 'date' },
}

export const NAME_FILTER_FIELD = 'name'

export const CUSTOM_TYPE_MAP: Readonly<Partial<Record<string, FilterFieldType>>> = {
  select: 'select',
  multiselect: 'select',
  number: 'text',
  currency: 'text',
}
