'use client'

import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import { useSidebar } from '@/shared/ui/shadcn/sidebar'

export function SidebarCollapseButton() {
  const { t } = useTranslation()
  const { toggleSidebar, state } = useSidebar()
  const expanded = state === 'expanded'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      aria-label={t('nav.toggleSidebar')}
      aria-expanded={expanded}
      className="absolute -right-3 top-1/2 z-20 hidden size-6 -translate-y-1/2 rounded-full border-border-strong/50 bg-card p-0 text-foreground shadow-md hover:border-border-strong hover:bg-accent md:flex"
    >
      {expanded ? <ChevronsLeft className="size-3.5" /> : <ChevronsRight className="size-3.5" />}
    </Button>
  )
}
