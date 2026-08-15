'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { DotsSixVerticalIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import { DATA_TABLE_ICON_BUTTON, DATA_TABLE_REVEAL } from '../../config/table.constants'

import type { useSortable } from '@dnd-kit/sortable'
import type { Ref } from 'react'

type DragHandleProps = Pick<ReturnType<typeof useSortable>, 'attributes' | 'listeners'> & {
  readonly ref: Ref<HTMLButtonElement>
}

export function DragHandle({ attributes, listeners, ref }: Readonly<DragHandleProps>) {
  const { t } = useTranslation()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon-xs"
      aria-label={t('common.table.reorder')}
      className={cn(
        DATA_TABLE_ICON_BUTTON,
        DATA_TABLE_REVEAL,
        'absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-grab active:cursor-grabbing',
      )}
      {...attributes}
      {...listeners}
    >
      <DotsSixVerticalIcon className="size-3.5" />
    </Button>
  )
}
