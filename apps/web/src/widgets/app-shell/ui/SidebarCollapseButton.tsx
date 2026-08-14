'use client'

import { useTranslation } from 'react-i18next'

import { EdgeCollapseButton } from '@/shared/ui/molecules/edge-collapse-button'
import { useSidebar } from '@/shared/ui/shadcn/sidebar'

export function SidebarCollapseButton() {
  const { t } = useTranslation()
  const { toggleSidebar, state } = useSidebar()

  return (
    <EdgeCollapseButton
      edge="right"
      expanded={state === 'expanded'}
      onClick={toggleSidebar}
      label={t('nav.toggleSidebar')}
      className="hidden md:flex"
    />
  )
}
