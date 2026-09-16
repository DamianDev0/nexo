'use client'

import { timeAgo } from '@repo/shared-utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CalendarBlankIcon } from '@/shared/ui/icons'
import { CalendarPanel } from '@/shared/ui/molecules/date-picker'
import { EDITABLE_CELL_ICON, EDITABLE_CELL_TRIGGER } from '@/shared/ui/molecules/editable-cell'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'

type ContactDateFieldCellProps = {
  readonly value: string | null
  readonly display: string | null
  readonly locale: string
  readonly label: string
  readonly onSave?: (iso: string) => void
}

export function ContactDateFieldCell({
  value,
  display,
  locale,
  label,
  onSave,
}: Readonly<ContactDateFieldCellProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const content = display ? (
    <span className="flex min-w-0 flex-col text-left">
      <Text className="truncate tabular-nums">{display}</Text>
      {value && (
        <Text variant="faint" className="truncate">
          {timeAgo(`${value}T00:00:00-05:00`, locale)}
        </Text>
      )}
    </span>
  ) : (
    <>
      <Text variant="faint" className="text-sm group-hover/cell:hidden">
        —
      </Text>
      <Text variant="faint" className="hidden truncate text-sm group-hover/cell:inline">
        {t('common.pickDate', { field: label })}
      </Text>
    </>
  )

  if (!onSave) return content

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>
        <PillButton
          variant="ghost"
          size="xs"
          aria-label={label}
          className={cn(EDITABLE_CELL_TRIGGER, 'justify-start')}
        >
          {content}
          <CalendarBlankIcon aria-hidden className={cn(EDITABLE_CELL_ICON, 'ml-auto')} />
        </PillButton>
      </GroovyPopover.Trigger>
      <GroovyPopover.Content subtle align="start" autoFocusContent className="p-2">
        <CalendarPanel
          selected={value ?? undefined}
          locale={locale}
          onSelect={(iso) => {
            onSave(iso)
            setOpen(false)
          }}
        />
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
