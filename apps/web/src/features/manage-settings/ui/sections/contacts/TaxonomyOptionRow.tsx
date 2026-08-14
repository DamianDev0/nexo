'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { DotsSixVerticalIcon } from '@/shared/ui/icons'
import { EditableSwatchRow } from '@/shared/ui/molecules/editable-swatch-row'

import { useEditableName } from '../../../model/useEditableName'

import { OptionRowActions } from './OptionRowActions'

import type { TaxonomyRowActions } from '../../../model/types'
import type { TaxonomyOption } from '@repo/shared-types'

interface TaxonomyOptionRowProps {
  readonly option: TaxonomyOption
  readonly fallbackLabel: string
  readonly count: number
  readonly actions: TaxonomyRowActions
}

export function TaxonomyOptionRow({
  option,
  fallbackLabel,
  count,
  actions,
}: Readonly<TaxonomyOptionRowProps>) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.key,
  })
  const editable = useEditableName({
    value: option.label ?? '',
    onCommit: (label) => actions.onPatch(option.key, { label: label || null }),
    allowEmpty: true,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40', !option.enabled && 'opacity-55')}
    >
      <EditableSwatchRow
        swatch={{
          color: option.color,
          colors: TAXONOMY_COLOR_PALETTE,
          onChange: (color) => actions.onPatch(option.key, { color }),
          label: t('settings.taxonomy.pickColor'),
        }}
        name={{
          value: editable.name,
          placeholder: fallbackLabel,
          onChange: editable.setName,
          onBlur: editable.commit,
        }}
        leading={
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab text-muted-foreground active:cursor-grabbing"
            aria-label={t('settings.taxonomy.reorder')}
          >
            <DotsSixVerticalIcon className="size-4" />
          </span>
        }
        trailing={
          <OptionRowActions
            count={count}
            enabled={option.enabled}
            onToggle={(enabled) => actions.onPatch(option.key, { enabled })}
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
