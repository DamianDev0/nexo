'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { SlidersHorizontalIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import { DATA_TABLE_TOOLBAR_BUTTON } from '../../config/table.constants'
import { useDataTableContext } from '../../model/context'

export function DataTableColumns({ className }: Readonly<{ className?: string }>) {
  const { t } = useTranslation()
  const { table } = useDataTableContext()
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide())
  const hiddenCount = columns.filter((column) => !column.getIsVisible()).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-slot="table-columns"
          className={cn(DATA_TABLE_TOOLBAR_BUTTON, className)}
        >
          <SlidersHorizontalIcon className="size-4" />
          {t('common.table.columns')}
          {hiddenCount > 0 && <span className="text-faint">{hiddenCount}</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="max-h-96 w-56 overflow-y-auto">
        <DropdownMenuLabel>{t('common.table.columnsVisible')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) => column.toggleVisibility(checked)}
          >
            {column.columnDef.meta?.label ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
