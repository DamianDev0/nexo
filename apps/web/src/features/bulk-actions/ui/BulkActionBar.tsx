'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { BULK_ARCHIVED_BAR_BUTTONS, BULK_BAR_BUTTONS } from '../config/bulk-actions.constants'

import { BulkProgressChip } from './BulkProgressChip'

import type { BulkActionsController } from '../model/useBulkActions'

export function BulkActionBar({ bar }: Readonly<{ bar: BulkActionsController['bar'] }>) {
  const { t } = useTranslation()
  const buttons = bar.archived ? BULK_ARCHIVED_BAR_BUTTONS : BULK_BAR_BUTTONS

  return (
    <>
      {buttons.map(({ id, labelKey, icon: Icon, danger }) => {
        const label = t(labelKey)
        return (
          <HintTooltip key={id} asChild hint={label}>
            <PillButton
              variant={danger ? 'ghostDanger' : 'ghost'}
              size="xs"
              className="w-8 px-0"
              disabled={bar.isBusy}
              onClick={() => (id === 'export' ? bar.onExport() : bar.onOpen(id))}
              aria-label={label}
            >
              <Icon className="size-3.5" />
            </PillButton>
          </HintTooltip>
        )
      })}
      {bar.progress && <BulkProgressChip action={bar.progress} />}
    </>
  )
}
