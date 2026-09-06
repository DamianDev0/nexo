'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { BulkProgressChip } from './BulkProgressChip'

import type { BulkActionsController } from '../model/useBulkActions'

export function BulkActionBar({ bar }: Readonly<{ bar: BulkActionsController['bar'] }>) {
  const { t } = useTranslation()

  return (
    <>
      {bar.actions.map(({ id, labelKey, icon: Icon, danger }) => {
        const label = t(labelKey)
        return (
          <HintTooltip key={id} asChild hint={label}>
            <PillButton
              variant={danger ? 'ghostDanger' : 'ghost'}
              size="xs"
              className="w-8 px-0"
              disabled={bar.isBusy}
              onClick={() => bar.onOpen(id)}
              aria-label={label}
            >
              <Icon className="size-4" />
            </PillButton>
          </HintTooltip>
        )
      })}
      {bar.progress && <BulkProgressChip action={bar.progress} />}
    </>
  )
}
