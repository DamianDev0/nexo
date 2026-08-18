'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { CaretDownIcon, CheckIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/shadcn/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

import { IMPORT_UNMAPPED } from '../config/import-contacts.constants'
import { fieldLabel } from '../lib/import-mapping'

import type { ImportFieldDef } from '@repo/shared-types'

interface FieldSelectorProps {
  readonly fields: ReadonlyArray<ImportFieldDef>
  readonly value: string | null
  readonly label: string
  readonly onSelect: (field: string) => void
}

export function FieldSelector({ fields, value, label, onSelect }: Readonly<FieldSelectorProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const selected = fields.find((field) => field.field === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          className={cn(
            'h-9 w-52 shrink-0 justify-between gap-2 font-normal',
            !selected && 'text-muted-foreground',
          )}
        >
          <span className="truncate">
            {selected ? fieldLabel(t, selected) : t('contacts.import.map.ignore')}
          </span>
          <CaretDownIcon className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={t('contacts.import.map.search')} />
          <CommandList>
            <CommandEmpty>{t('common.noResults')}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={t('contacts.import.map.ignore')}
                onSelect={() => {
                  onSelect(IMPORT_UNMAPPED)
                  setOpen(false)
                }}
              >
                <span className="flex-1 text-muted-foreground">
                  {t('contacts.import.map.ignore')}
                </span>
                {!selected && <CheckIcon className="size-4" />}
              </CommandItem>

              {fields.map((field) => (
                <CommandItem
                  key={field.field}
                  value={`${fieldLabel(t, field)} ${field.field}`}
                  onSelect={() => {
                    onSelect(field.field)
                    setOpen(false)
                  }}
                >
                  <span className="flex-1">
                    {fieldLabel(t, field)}
                    {field.required && <span className="text-destructive"> *</span>}
                  </span>
                  {field.field === value && <CheckIcon className="size-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
