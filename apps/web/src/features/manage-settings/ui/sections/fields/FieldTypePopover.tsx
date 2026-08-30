'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CaretDownIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

import { FIELD_TYPE_ICONS } from '../../../config/custom-fields.constants'

import { FieldTypePicker } from './FieldTypePicker'

import type { CustomFieldType } from '@repo/shared-types'

interface FieldTypePopoverProps {
  readonly value: CustomFieldType
  readonly onChange: (type: CustomFieldType) => void
}

export function FieldTypePopover({ value, onChange }: Readonly<FieldTypePopoverProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const Icon = FIELD_TYPE_ICONS[value]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          aria-label={t('settings.fields.typeLabel')}
        >
          {Icon && <Icon className="size-3.5" />}
          {t(`settings.fields.types.${value}`)}
          <CaretDownIcon className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-xl p-3">
        <FieldTypePicker
          value={value}
          onChange={(type) => {
            onChange(type)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
