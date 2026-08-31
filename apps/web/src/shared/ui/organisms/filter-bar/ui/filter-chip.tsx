'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { XIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { Command, CommandItem, CommandList } from '@/shared/ui/shadcn/command'

import { needsValue, OPERATOR_GLYPHS, operatorsFor } from '../lib/conditions'

import { ValueEditor } from './value-editor'

import type { FilterFieldDef } from '../model/types'
import type { FilterCondition, FilterOperator } from '@repo/shared-types'

type FilterChipProps = {
  readonly field: FilterFieldDef
  readonly condition: FilterCondition
  readonly onChange: (next: FilterCondition) => void
  readonly onRemove: () => void
}

function OperatorPicker({
  field,
  condition,
  onChange,
}: Readonly<Omit<FilterChipProps, 'onRemove'>>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const pick = (operator: FilterOperator) => {
    const value = needsValue(operator) ? condition.value : undefined
    onChange({ ...condition, operator, value })
    setOpen(false)
  }

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>
        <button
          type="button"
          className="h-7 cursor-pointer whitespace-nowrap px-2.5 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
        >
          {t(`common.filters.advanced.operators.${condition.operator}`)}
        </button>
      </GroovyPopover.Trigger>
      <GroovyPopover.Content align="start" subtle className="w-44 p-1">
        <Command>
          <CommandList>
            {operatorsFor(field.type).map((operator) => (
              <CommandItem
                key={operator}
                value={operator}
                className="gap-2 rounded-md"
                onSelect={() => pick(operator)}
              >
                <span className="flex-1">{t(`common.filters.advanced.operators.${operator}`)}</span>
                <Text variant="hint" className="font-mono">
                  {OPERATOR_GLYPHS[operator]}
                </Text>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}

export function FilterChip({ field, condition, onChange, onRemove }: Readonly<FilterChipProps>) {
  const { t } = useTranslation()
  const Icon = field.icon

  return (
    <span className="flex h-7.5 items-center overflow-hidden rounded-lg border border-border bg-surface-input text-sm shadow-xs [&>*+*]:border-l [&>*+*]:border-border">
      <Text variant="strong" className="flex items-center gap-1.5 whitespace-nowrap px-2.5">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {field.label}
      </Text>
      <OperatorPicker field={field} condition={condition} onChange={onChange} />
      {needsValue(condition.operator) && (
        <ValueEditor
          field={field}
          multiple={condition.operator === 'is_any_of'}
          value={condition.value}
          onChange={(value) => onChange({ ...condition, value })}
        />
      )}
      <button
        type="button"
        aria-label={t('common.filters.advanced.remove', { field: field.label })}
        onClick={onRemove}
        className="flex h-full cursor-pointer items-center px-2 text-muted-foreground outline-none hover:bg-destructive/10 hover:text-destructive"
      >
        <XIcon className="size-3.5" />
      </button>
    </span>
  )
}
