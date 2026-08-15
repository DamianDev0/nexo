'use client'

import { useTranslation } from 'react-i18next'

import { TrashIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'

interface ContactsBulkActionsProps {
  readonly onArchive: () => void
  readonly disabled: boolean
}

export function ContactsBulkActions({ onArchive, disabled }: Readonly<ContactsBulkActionsProps>) {
  const { t } = useTranslation()
  const label = t('contacts.bulk.archive')

  return (
    <HintTooltip asChild hint={label}>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={onArchive}
        aria-label={label}
        className="text-faint hover:text-negative-text"
      >
        <TrashIcon className="size-4" />
      </Button>
    </HintTooltip>
  )
}
