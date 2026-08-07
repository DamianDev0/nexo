'use client'

import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { TrashIcon } from '@/shared/ui/icons'
import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'
import { Input } from '@/shared/ui/shadcn/input'

import { useEditableName } from '../../../model/useEditableName'

import type { TagRowActions } from '../../../model/types'
import type { Tag } from '@repo/shared-types'

export function TagRow({ tag, actions }: Readonly<{ tag: Tag; actions: TagRowActions }>) {
  const { t } = useTranslation()
  const editable = useEditableName(tag.name, (name) => actions.onUpdate({ id: tag.id, name }))

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
      <ColorSwatchPicker
        color={tag.color}
        colors={TAXONOMY_COLOR_PALETTE}
        onChange={(color) => actions.onUpdate({ id: tag.id, color })}
        label={t('settings.taxonomy.pickColor')}
      />
      <Input
        className="h-8 flex-1 border-transparent bg-transparent text-sm shadow-none focus-visible:border-border"
        value={editable.name}
        onChange={(e) => editable.setName(e.target.value)}
        onBlur={editable.commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      <PillButton
        variant="ghost"
        size="sm"
        aria-label={t('settings.tags.remove')}
        onClick={() => actions.onRemove(tag)}
      >
        <TrashIcon className="size-3.5" />
      </PillButton>
    </div>
  )
}
