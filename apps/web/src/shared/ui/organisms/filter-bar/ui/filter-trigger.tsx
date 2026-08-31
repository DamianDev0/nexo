'use client'

import { defaultOperator } from '../lib/conditions'

import { AddFilter } from './add-filter'

import type { FilterFieldDef } from '../model/types'
import type { FilterCondition } from '@repo/shared-types'

type FilterTriggerProps = {
  readonly fields: ReadonlyArray<FilterFieldDef>
  readonly value: ReadonlyArray<FilterCondition>
  readonly onChange: (next: ReadonlyArray<FilterCondition>) => void
  readonly iconOnly?: boolean
}

export function FilterTrigger({ fields, value, onChange, iconOnly }: Readonly<FilterTriggerProps>) {
  const add = (field: FilterFieldDef) => {
    onChange([...value, { field: field.key, operator: defaultOperator(field.type) }])
  }

  return (
    <AddFilter
      fields={fields}
      onPick={add}
      showLabel={!iconOnly}
      count={value.length}
    />
  )
}
