'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CaretDownIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'

export interface SplitButtonAction {
  readonly label: string
  readonly onSelect: () => void
}

interface SplitButtonProps {
  readonly label: string
  readonly type?: 'button' | 'submit'
  readonly onClick?: () => void
  readonly actions?: ReadonlyArray<SplitButtonAction>
  readonly disabled?: boolean
}

export function SplitButton({
  label,
  type = 'button',
  onClick,
  actions = [],
  disabled,
}: Readonly<SplitButtonProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (actions.length === 0) {
    return (
      <PillButton type={type} size="sm" disabled={disabled} onClick={onClick}>
        {label}
      </PillButton>
    )
  }

  return (
    <div className="inline-flex items-stretch">
      <PillButton
        type={type}
        size="sm"
        disabled={disabled}
        onClick={onClick}
        className="rounded-r-none pr-3.5"
      >
        {label}
      </PillButton>
      <span className="w-px self-stretch bg-primary-deep/25" />
      <GroovyPopover open={open} onOpenChange={setOpen}>
        <GroovyPopover.Trigger asChild>
          <PillButton
            type="button"
            size="sm"
            disabled={disabled}
            aria-label={t('common.moreOptions')}
            aria-haspopup="menu"
            aria-expanded={open}
            className={cn('rounded-l-none px-2.5', open && 'brightness-95')}
          >
            <CaretDownIcon className="size-3.5" />
          </PillButton>
        </GroovyPopover.Trigger>
        <GroovyPopover.Content align="end" subtle className="min-w-40 p-1">
          {actions.map((action) => (
            <GroovyPopover.Item
              key={action.label}
              content={{ label: action.label }}
              onSelect={() => {
                setOpen(false)
                action.onSelect()
              }}
            />
          ))}
        </GroovyPopover.Content>
      </GroovyPopover>
    </div>
  )
}
