'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { FunnelIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/shadcn/command'
import { SPRING_SNAPPY } from '@/shared/ui/smoothui/lib/animation'

import type { FilterFieldDef } from '../model/types'

type AddFilterProps = {
  readonly fields: ReadonlyArray<FilterFieldDef>
  readonly onPick: (field: FilterFieldDef) => void
  readonly showLabel: boolean
  readonly count?: number
}

export function AddFilter({ fields, onPick, showLabel, count = 0 }: Readonly<AddFilterProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>
        <PillButton
          variant="ghost"
          size="xs"
          className="relative gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label={t('common.filters.advanced.add')}
        >
          <FunnelIcon className="size-3.5" />
          {showLabel && t('common.filters.advanced.add')}
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={SPRING_SNAPPY}
                className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold tabular-nums text-primary-foreground"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </PillButton>
      </GroovyPopover.Trigger>

      <GroovyPopover.Content align="start" autoFocusContent subtle className="w-56 p-0">
        <Command>
          <CommandInput placeholder={t('common.filters.advanced.searchField')} />
          <CommandList className="max-h-64 p-1">
            <CommandEmpty className="px-2.5 py-4 text-center text-sm text-muted-foreground">
              {t('common.noResults')}
            </CommandEmpty>
            {fields.map((field) => {
              const Icon = field.icon
              return (
                <CommandItem
                  key={field.key}
                  value={field.label}
                  className="gap-2.5 rounded-md"
                  onSelect={() => {
                    onPick(field)
                    setOpen(false)
                  }}
                >
                  {Icon && <Icon className="size-4 text-muted-foreground" />}
                  {field.label}
                </CommandItem>
              )
            })}
          </CommandList>
        </Command>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
