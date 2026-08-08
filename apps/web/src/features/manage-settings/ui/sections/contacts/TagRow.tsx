'use client'

import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { TrashIcon } from '@/shared/ui/icons'
import { EditableSwatchRow } from '@/shared/ui/molecules/editable-swatch-row'

import { useEditableName } from '../../../model/useEditableName'

import type { TagRowActions } from '../../../model/types'
import type { Tag } from '@repo/shared-types'

export function TagRow({ tag, actions }: Readonly<{ tag: Tag; actions: TagRowActions }>) {
  const { t } = useTranslation()
  const editable = useEditableName(tag.name, (name) => actions.onUpdate({ id: tag.id, name }))

  return (
    <EditableSwatchRow
      swatch={{
        color: tag.color,
        colors: TAXONOMY_COLOR_PALETTE,
        onChange: (color) => actions.onUpdate({ id: tag.id, color }),
        label: t('settings.taxonomy.pickColor'),
      }}
      name={{ value: editable.name, onChange: editable.setName, onBlur: editable.commit }}
      trailing={
        <PillButton
          variant="ghost"
          size="sm"
          aria-label={t('settings.tags.remove')}
          onClick={() => actions.onRemove(tag)}
        >
          <TrashIcon className="size-3.5" />
        </PillButton>
      }
    />
  )
}
