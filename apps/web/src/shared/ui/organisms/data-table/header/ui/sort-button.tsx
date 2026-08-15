'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { ArrowDownIcon, ArrowUpIcon, CaretUpDownIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'

import { DATA_TABLE_ACTIVE_TONE, DATA_TABLE_ICON_BUTTON } from '../../config/table.constants'

import type { Header } from '@tanstack/react-table'

const SORT_ICON = { asc: ArrowUpIcon, desc: ArrowDownIcon } as const

export function SortButton({ header }: Readonly<{ header: Header<unknown, unknown> }>) {
  const { t } = useTranslation()
  const direction = header.column.getIsSorted()
  const Icon = direction === false ? CaretUpDownIcon : SORT_ICON[direction]

  return (
    <HintTooltip asChild hint={t('common.table.sort')}>
      <Button
        variant="ghost"
        size="icon-xs"
        data-slot="table-sort"
        aria-label={t('common.table.sort')}
        onClick={header.column.getToggleSortingHandler()}
        className={cn(DATA_TABLE_ICON_BUTTON, direction !== false && DATA_TABLE_ACTIVE_TONE)}
      >
        <Icon className="size-3.5" />
      </Button>
    </HintTooltip>
  )
}
