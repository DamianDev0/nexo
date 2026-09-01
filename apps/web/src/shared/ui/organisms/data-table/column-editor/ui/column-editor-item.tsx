'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { DotsSixVerticalIcon, LockIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'

import type { ColumnEditorItem } from '../model/use-column-editor'

interface ColumnEditorRowProps {
  readonly item: ColumnEditorItem
  readonly onToggle: (id: string, visible: boolean) => void
}

export function ColumnEditorRow({ item, onToggle }: Readonly<ColumnEditorRowProps>) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: item.pinned,
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'group/column flex items-center gap-2 rounded-lg border border-transparent bg-card py-1.5 pl-1 pr-2.5',
        'hover:border-border hover:bg-muted',
        isDragging && 'z-10 border-border opacity-80 shadow-sm',
      )}
    >
      {item.pinned ? (
        <span className="size-7" />
      ) : (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t('common.table.reorder')}
          className="size-7 cursor-grab text-faint hover:bg-transparent hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <DotsSixVerticalIcon className="size-4" />
        </Button>
      )}

      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm',
          item.visible ? 'font-medium text-foreground' : 'text-faint',
        )}
      >
        {item.label}
      </span>

      {item.locked ? (
        <HintTooltip asChild hint={t('common.table.lockedColumn')}>
          <span className="flex size-8 items-center justify-center text-faint">
            <LockIcon className="size-3.5" />
          </span>
        </HintTooltip>
      ) : (
        <AnimatedToggle
          size="sm"
          checked={item.visible}
          label={item.label}
          onChange={(checked) => onToggle(item.id, checked)}
        />
      )}
    </li>
  )
}
