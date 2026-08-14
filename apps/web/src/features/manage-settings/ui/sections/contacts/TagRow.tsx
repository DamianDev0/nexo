'use client'

import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { EditableSwatchRow } from '@/shared/ui/molecules/editable-swatch-row'

import { useEditableName } from '../../../model/useEditableName'

import { OptionRowActions } from './OptionRowActions'

import type { TagRowActions } from '../../../model/types'
import type { Tag } from '@repo/shared-types'

interface TagRowProps {
  readonly tag: Tag
  readonly count: number
  readonly actions: TagRowActions
}

export function TagRow({ tag, count, actions }: Readonly<TagRowProps>) {
  const { t } = useTranslation()
  const editable = useEditableName({
    value: tag.name,
    onCommit: (name) => actions.onUpdate({ id: tag.id, name }),
  })

  return (
    <div className={cn(!tag.enabled && 'opacity-55')}>
      <EditableSwatchRow
        swatch={{
          color: tag.color,
          colors: TAXONOMY_COLOR_PALETTE,
          onChange: (color) => actions.onUpdate({ id: tag.id, color }),
          label: t('settings.taxonomy.pickColor'),
        }}
        name={{ value: editable.name, onChange: editable.setName, onBlur: editable.commit }}
        trailing={
          <OptionRowActions
            count={count}
            enabled={tag.enabled}
            onToggle={(enabled) => actions.onUpdate({ id: tag.id, enabled })}
            onEdit={() => actions.onEdit(tag)}
            remove={{ label: t('settings.tags.remove'), onRemove: () => actions.onRemove(tag) }}
          />
        }
      />
    </div>
  )
}
