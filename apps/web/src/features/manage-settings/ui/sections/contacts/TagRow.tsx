'use client'

import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { SwatchRow } from '@/shared/ui/molecules/swatch-row'

import { OptionRowActions } from './OptionRowActions'
import { OptionRowName } from './OptionRowName'

import type { TagRowActions } from '../../../model/types'
import type { Tag } from '@repo/shared-types'

interface TagRowProps {
  readonly tag: Tag
  readonly count: number
  readonly actions: TagRowActions
}

export function TagRow({ tag, count, actions }: Readonly<TagRowProps>) {
  const { t } = useTranslation()

  return (
    <div className={cn(!tag.enabled && 'opacity-55')}>
      <SwatchRow
        swatch={{
          color: tag.color,
          colors: TAXONOMY_COLOR_PALETTE,
          onChange: (color) => actions.onUpdate({ id: tag.id, color }),
          label: t('settings.taxonomy.pickColor'),
        }}
        name={<OptionRowName name={tag.name} description={tag.description} />}
        trailing={
          <OptionRowActions
            count={count}
            toggle={{
              enabled: tag.enabled,
              onToggle: (enabled) => actions.onUpdate({ id: tag.id, enabled }),
            }}
            onEdit={() => actions.onEdit(tag)}
            remove={{ label: t('settings.tags.remove'), onRemove: () => actions.onRemove(tag) }}
          />
        }
      />
    </div>
  )
}
