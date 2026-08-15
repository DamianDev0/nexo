'use client'

import { useTranslation } from 'react-i18next'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  DotsThreeVerticalIcon,
  LockIcon,
  LockOpenIcon,
} from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import { DATA_TABLE_ICON_BUTTON } from '../../config/table.constants'

import type { Header } from '@tanstack/react-table'

export function HeaderMenu({ header }: Readonly<{ header: Header<unknown, unknown> }>) {
  const { t } = useTranslation()
  const { column } = header
  const sortable = column.getCanSort()
  const lockable = column.columnDef.meta?.lockable === true
  const pinned = Boolean(column.getIsPinned())
  const sorted = column.getIsSorted()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          data-slot="table-column-menu"
          aria-label={t('common.table.columnMenu')}
          className={DATA_TABLE_ICON_BUTTON}
        >
          <DotsThreeVerticalIcon className="size-3.5" weight="bold" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
        {sortable && (
          <>
            <DropdownMenuItem
              disabled={sorted === 'asc'}
              onSelect={() => column.toggleSorting(false)}
            >
              <ArrowUpIcon className="size-4" />
              {t('common.table.sortAsc')}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={sorted === 'desc'}
              onSelect={() => column.toggleSorting(true)}
            >
              <ArrowDownIcon className="size-4" />
              {t('common.table.sortDesc')}
            </DropdownMenuItem>
          </>
        )}

        {sortable && lockable && <DropdownMenuSeparator />}

        {lockable && (
          <DropdownMenuItem onSelect={() => column.pin(pinned ? false : 'left')}>
            {pinned ? <LockOpenIcon className="size-4" /> : <LockIcon className="size-4" />}
            {t(pinned ? 'common.table.unlock' : 'common.table.lock')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
