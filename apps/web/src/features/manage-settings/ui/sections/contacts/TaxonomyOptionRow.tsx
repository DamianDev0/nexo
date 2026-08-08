'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { DotsSixVerticalIcon, LockIcon, TrashIcon } from '@/shared/ui/icons'
import { EditableSwatchRow } from '@/shared/ui/molecules/editable-swatch-row'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import type { TaxonomyRowActions } from '../../../model/types'
import type { TaxonomyOption } from '@repo/shared-types'

interface TaxonomyOptionRowProps {
  readonly option: TaxonomyOption
  readonly fallbackLabel: string
  readonly actions: TaxonomyRowActions
}

export function TaxonomyOptionRow({
  option,
  fallbackLabel,
  actions,
}: Readonly<TaxonomyOptionRowProps>) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.key,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40')}
    >
      <EditableSwatchRow
        swatch={{
          color: option.color,
          colors: TAXONOMY_COLOR_PALETTE,
          onChange: (color) => actions.onPatch(option.key, { color }),
          label: t('settings.taxonomy.pickColor'),
        }}
        name={{
          value: option.label ?? '',
          placeholder: fallbackLabel,
          onChange: (label) => actions.onPatch(option.key, { label: label || null }),
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
          option.isSystem ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="px-2 text-muted-foreground">
                  <LockIcon className="size-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('settings.taxonomy.systemHint')}</TooltipContent>
            </Tooltip>
          ) : (
            <PillButton
              variant="ghost"
              size="sm"
              aria-label={t('settings.taxonomy.remove')}
              onClick={() => actions.onRemove(option.key)}
            >
              <TrashIcon className="size-3.5" />
            </PillButton>
          )
        }
      />
    </div>
  )
}
