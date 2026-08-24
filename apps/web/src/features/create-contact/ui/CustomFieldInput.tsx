'use client'

import { CENTAVOS_PER_PESO } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'
import { Switch } from '@/shared/ui/shadcn/switch'
import { Textarea } from '@/shared/ui/shadcn/textarea'
import { SmoothCheckbox } from '@/shared/ui/smoothui/checkbox'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import type { FieldDef } from '@repo/shared-types'

interface CustomFieldInputProps {
  readonly def: FieldDef
  readonly value: unknown
  readonly onChange: (value: unknown) => void
}

const INPUT_TYPE: Readonly<Record<string, string>> = {
  number: 'number',
  currency: 'number',
  date: 'date',
  datetime: 'datetime-local',
  url: 'url',
  phone: 'tel',
  email: 'email',
}

function toggleItem(current: unknown, item: string): string[] {
  const list = Array.isArray(current) ? (current as string[]) : []
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

export function CustomFieldInput({ def, value, onChange }: Readonly<CustomFieldInputProps>) {
  const { t } = useTranslation()

  if (def.type === 'boolean') {
    return <Switch checked={value === true} onCheckedChange={onChange} aria-label={def.label} />
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
              onCheckedChange={() => onChange(toggleItem(value, option.value))}
              aria-label={option.label}
            />
            {option.label}
          </label>
        ))}
      </div>
    )
  }

  const isCurrency = def.type === 'currency'
  const isNumeric = def.type === 'number' || isCurrency
  const shown = value === undefined || value === null ? '' : value
  return (
    <Input
      type={INPUT_TYPE[def.type] ?? 'text'}
      value={
        isCurrency && typeof shown === 'number' ? String(shown / CENTAVOS_PER_PESO) : String(shown)
      }
      onChange={(event) => {
        const raw = event.target.value
        if (!isNumeric) {
          onChange(raw)
          return
        }
        if (raw === '') {
          onChange('')
          return
        }
        onChange(isCurrency ? Math.round(Number(raw) * CENTAVOS_PER_PESO) : Number(raw))
      }}
      placeholder={def.placeholder}
      aria-label={def.label}
    />
  )
}
