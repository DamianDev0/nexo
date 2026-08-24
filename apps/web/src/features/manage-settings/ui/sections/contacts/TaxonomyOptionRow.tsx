'use client'

import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { DragHandle } from '@/shared/ui/atoms/drag-handle'
import { SwatchRow } from '@/shared/ui/molecules/swatch-row'

import { OptionRowActions } from './OptionRowActions'
import { OptionRowName } from './OptionRowName'

import type { TaxonomyRowActions } from '../../../model/types'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { TaxonomyOption } from '@repo/shared-types'

export interface TaxonomyRowHandle {
  readonly attributes: DraggableAttributes
  readonly listeners: SyntheticListenerMap | undefined
}

interface TaxonomyOptionRowProps {
  readonly row: { readonly option: TaxonomyOption; readonly label: string; readonly count: number }
  readonly actions: TaxonomyRowActions
  readonly handle?: TaxonomyRowHandle
  readonly ghost?: boolean
}

export function TaxonomyOptionRow({
  row,
  actions,
  handle,
  ghost,
}: Readonly<TaxonomyOptionRowProps>) {
  const { t } = useTranslation()
  const { option, label, count } = row

  return (
    <div className={cn(!option.enabled && 'opacity-55')}>
      <SwatchRow
        ghost={ghost}
        swatch={{
          color: option.color,
          colors: TAXONOMY_COLOR_PALETTE,
          onChange: (color) => actions.onPatch(option.key, { color }),
          label: t('settings.taxonomy.pickColor'),
        }}
        name={<OptionRowName name={label} description={option.description} />}
        leading={<DragHandle handle={handle} label={t('settings.taxonomy.reorder')} />}
        trailing={
          <OptionRowActions
            count={count}
            toggle={{
              enabled: option.enabled,
              onToggle: (enabled) => actions.onPatch(option.key, { enabled }),
            }}
            onEdit={() => actions.onEdit(option.key)}
            remove={{
              label: t('settings.taxonomy.remove'),
              onRemove: option.isSystem ? null : () => actions.onRemove(option.key),
              lockedHint: t('settings.taxonomy.systemHint'),
            }}
          />
        }
      />
    </div>
  )
}
