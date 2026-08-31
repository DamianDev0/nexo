'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { CheckIcon } from '@/shared/ui/icons'
import { DatePicker } from '@/shared/ui/molecules/date-picker'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/shadcn/command'
import { SmoothInput } from '@/shared/ui/smoothui/input'

import type { FilterFieldDef, FilterFieldOption } from '../model/types'
import type { FilterValue } from '@repo/shared-types'

type ValueEditorProps = {
  readonly field: FilterFieldDef
  readonly multiple: boolean
  readonly value?: FilterValue
  readonly onChange: (value: FilterValue) => void
}

const TRIGGER_CLASS =
  'flex h-7 max-w-52 cursor-pointer items-center gap-1.5 truncate px-2.5 text-sm text-foreground outline-none hover:bg-muted'

function selectedLabels(
  options: ReadonlyArray<FilterFieldOption>,
  selected: ReadonlyArray<string>,
): string {
  return options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)
    .join(', ')
}

function OptionPicker({ field, multiple, value, onChange }: Readonly<ValueEditorProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const options = field.options ?? []
  const selected = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []
  const display = selectedLabels(options, selected)

  const toggle = (option: FilterFieldOption) => {
    if (!multiple) {
      onChange(option.value)
      setOpen(false)
      return
    }
    const next = selected.includes(option.value)
      ? selected.filter((entry) => entry !== option.value)
      : [...selected, option.value]
    onChange(next)
  }

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>
        <button type="button" className={TRIGGER_CLASS}>
          <span className={display ? 'truncate' : 'text-muted-foreground'}>
            {display ||
              (multiple
                ? t('common.filters.advanced.pickValues')
                : t('common.filters.advanced.pickValue'))}
          </span>
        </button>
      </GroovyPopover.Trigger>
      <GroovyPopover.Content align="start" autoFocusContent subtle className="w-52 p-0">
        <Command>
          <CommandInput placeholder={t('common.search')} />
          <CommandList className="max-h-56 p-1">
            <CommandEmpty className="px-2.5 py-4 text-center text-sm text-muted-foreground">
              {t('common.noResults')}
            </CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                className="gap-2 rounded-md"
                onSelect={() => toggle(option)}
              >
                {option.color && <ColorDot color={option.color} />}
                <span className="flex-1 truncate">{option.label}</span>
                {selected.includes(option.value) && (
                  <CheckIcon strokeWidth={3} className="size-3.5 text-primary-deep dark:text-primary" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}

export function ValueEditor(props: Readonly<ValueEditorProps>) {
  const { t } = useTranslation()
  const { field, value, onChange } = props

  if (field.type === 'select' || field.type === 'multi') {
    return <OptionPicker {...props} />
  }

  if (field.type === 'date') {
    return (
      <DatePicker
        value={typeof value === 'string' ? value : undefined}
        onChange={onChange}
        placeholder={t('common.filters.advanced.pickDate')}
        aria-label={field.label}
        className="h-7 w-36 rounded-none border-0 bg-transparent px-2.5"
      />
    )
  }

  return (
    <SmoothInput
      type={field.type === 'number' ? 'number' : 'text'}
      value={typeof value === 'string' || typeof value === 'number' ? value : ''}
      onChange={(event) =>
        onChange(
          field.type === 'number' && event.target.value !== ''
            ? Number(event.target.value)
            : event.target.value,
        )
      }
      placeholder={t('common.filters.advanced.typeValue')}
      aria-label={field.label}
      className="h-7 w-36 rounded-none border-0 bg-transparent px-2.5 text-sm shadow-none focus-visible:ring-0"
    />
  )
}
