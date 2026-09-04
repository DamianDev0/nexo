'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { TrashIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

type ContactsBulkActionsProps = {
  readonly onArchive: () => void
  readonly disabled: boolean
}

export function ContactsBulkActions({ onArchive, disabled }: Readonly<ContactsBulkActionsProps>) {
  const { t } = useTranslation()
  const label = t('contacts.bulk.archive')

  return (
    <HintTooltip asChild hint={label}>
      <PillButton
        variant="ghostDanger"
        size="xs"
        disabled={disabled}
        onClick={onArchive}
        aria-label={label}
      >
        <TrashIcon className="size-4" />
      </PillButton>
    </HintTooltip>
  )
}
