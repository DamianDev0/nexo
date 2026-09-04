'use client'

import { timeAgo } from '@repo/shared-utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CalendarBlankIcon } from '@/shared/ui/icons'
import { CalendarPanel } from '@/shared/ui/molecules/date-picker'
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
      <Text variant="faint" className="text-sm group-hover/date:hidden">
        —
      </Text>
      <Text variant="faint" className="hidden truncate text-sm group-hover/date:inline">
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
          className="group/date -mx-1.5 h-auto w-full min-w-0 justify-start gap-1.5 rounded-md px-1.5 py-0.5 font-normal"
        >
          {content}
          <CalendarBlankIcon
            aria-hidden
            className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-120 group-hover/date:opacity-100"
          />
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
