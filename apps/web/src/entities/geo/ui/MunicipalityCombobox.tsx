'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { CaretUpDownIcon, CheckIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/shadcn/command'

import { useMunicipalitySearch } from '../query/useMunicipalitySearch'

interface MunicipalityComboboxProps {
  readonly value: string
  readonly onSelect: (municipality: { code: string; name: string; department: string }) => void
  readonly placeholder?: string
}

export function MunicipalityCombobox({
  value,
  onSelect,
  placeholder,
}: Readonly<MunicipalityComboboxProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const { municipalities, isSearching, isIdle } = useMunicipalitySearch(term)

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-9 w-full justify-between border-border bg-surface-input px-3 text-sm font-normal',
            value ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <CaretUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </GroovyPopover.Trigger>

      <GroovyPopover.Content
        align="start"
        autoFocusContent
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={term}
            onValueChange={setTerm}
            placeholder={t('contacts.form.cityPlaceholder')}
          />
          <CommandList>
            <CommandEmpty>
              {isIdle
                ? t('geo.typeToSearch')
                : isSearching
                  ? t('common.loading')
                  : t('geo.noMatches')}
            </CommandEmpty>
            {municipalities.map((municipality) => (
              <CommandItem
                key={municipality.code}
                value={municipality.code}
                onSelect={() => {
                  onSelect(municipality)
                  setOpen(false)
                }}
              >
                <CheckIcon
                  className={cn(
                    'size-3.5 shrink-0',
                    value === municipality.name ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="flex-1 truncate">{municipality.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {municipality.department}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
