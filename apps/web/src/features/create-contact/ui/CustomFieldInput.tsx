'use client'

import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/shared/ui/molecules/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'
import { Textarea } from '@/shared/ui/shadcn/textarea'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'
import { SmoothCheckbox } from '@/shared/ui/smoothui/checkbox'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { CUSTOM_FIELD_INPUT_TYPES } from '../config/custom-field-input.constants'
import {
  formatCustomFieldValue,
  joinDateTime,
  parseCustomFieldNumber,
  splitDateTimeValue,
  toggleListItem,
} from '../lib/custom-field-input'

import type { FieldDef } from '@repo/shared-types'

type CustomFieldInputProps = {
  readonly def: FieldDef
  readonly value: unknown
  readonly onChange: (value: unknown) => void
}

export function CustomFieldInput({ def, value, onChange }: Readonly<CustomFieldInputProps>) {
  const { t } = useTranslation()

  if (def.type === 'boolean') {
    return <AnimatedToggle checked={value === true} onChange={onChange} label={def.label} />
  }

  if (def.type === 'textarea') {
    return (
      <Textarea
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={def.placeholder}
        aria-label={def.label}
        rows={3}
      />
    )
  }

  if (def.type === 'select') {
    return (
      <Select
        value={typeof value === 'string' ? value : ''}
        onValueChange={(next) => onChange(next)}
      >
        <SelectTrigger aria-label={def.label}>
          <SelectValue placeholder={t('contacts.form.customFieldSelect')} />
        </SelectTrigger>
        <SelectContent>
          {(def.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (def.type === 'multiselect') {
    return (
      <div className="flex flex-col gap-1.5">
        {(def.options ?? []).map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-body">
            <SmoothCheckbox
              checked={Array.isArray(value) && (value as string[]).includes(option.value)}
              onCheckedChange={() => onChange(toggleListItem(value, option.value))}
              aria-label={option.label}
            />
            {option.label}
          </label>
        ))}
      </div>
    )
  }

  if (def.type === 'date' || def.type === 'datetime') {
    const { date: datePart, time: timePart } = splitDateTimeValue(value)
    if (def.type === 'date') {
      return (
        <DatePicker
          value={datePart}
          onChange={onChange}
          placeholder={def.placeholder ?? t('contacts.form.pickDate')}
          aria-label={def.label}
        />
      )
    }
    return (
      <div className="flex gap-2">
        <DatePicker
          value={datePart}
          onChange={(next) => onChange(joinDateTime(next, timePart))}
          placeholder={def.placeholder ?? t('contacts.form.pickDate')}
          aria-label={def.label}
        />
        <Input
          type="time"
          value={timePart}
          disabled={!datePart}
          onChange={(event) => onChange(joinDateTime(datePart, event.target.value))}
          aria-label={t('contacts.form.pickTime')}
          className="w-28"
        />
      </div>
    )
  }

  const isCurrency = def.type === 'currency'
  const isNumeric = def.type === 'number' || isCurrency
  return (
    <Input
      type={CUSTOM_FIELD_INPUT_TYPES[def.type] ?? 'text'}
      value={formatCustomFieldValue(value, isCurrency)}
      onChange={(event) => {
        const raw = event.target.value
        onChange(isNumeric ? parseCustomFieldNumber(raw, isCurrency) : raw)
      }}
      placeholder={def.placeholder}
      aria-label={def.label}
    />
  )
}
