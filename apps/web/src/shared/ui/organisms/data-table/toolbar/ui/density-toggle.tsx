'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { ArrowsInLineVerticalIcon, ArrowsOutLineVerticalIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'

import { DATA_TABLE_TOOLBAR_BUTTON } from '../../config/table.constants'
import { useDataTableContext } from '../../model/context'

export function DataTableDensity({ className }: Readonly<{ className?: string }>) {
  const { t } = useTranslation()
  const { density, setDensity } = useDataTableContext()
  const next = density === 'comfortable' ? 'compact' : 'comfortable'
  const Icon = density === 'comfortable' ? ArrowsInLineVerticalIcon : ArrowsOutLineVerticalIcon

  return (
    <HintTooltip asChild hint={t(`common.table.density.${next}`)}>
      <Button
        variant="outline"
        size="icon"
        aria-label={t(`common.table.density.${next}`)}
        onClick={() => setDensity(next)}
        className={cn(DATA_TABLE_TOOLBAR_BUTTON, 'w-9 px-0', className)}
      >
        <Icon className="size-4" />
      </Button>
    </HintTooltip>
  )
}
