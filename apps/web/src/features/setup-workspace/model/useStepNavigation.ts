import { DEFAULT_SIDEBAR_MODULE_KEYS, REQUIRED_SIDEBAR_MODULES } from '@repo/shared-types'
import { t } from 'i18next'
import { useState, useCallback } from 'react'

import settingsService from '@/shared/api/services/settings.service'

import { MODULE_ICON_NAMES } from './icon-map.constants'
import { useStepMutation } from './useStepMutation'

import type { SidebarModule } from '@repo/shared-types'

function buildDefaultModules(): SidebarModule[] {
  return DEFAULT_SIDEBAR_MODULE_KEYS.map((key, index) => ({
    key,
    label: t(`nav.${key}`),
    icon: MODULE_ICON_NAMES[key],
    enabled: true,
    order: index + 1,
    customIconUrl: null,
    required: REQUIRED_SIDEBAR_MODULES.has(key),
  }))
}

export function useStepNavigation(onNext: () => void) {
  const [modules, setModules] = useState<SidebarModule[]>(buildDefaultModules)

  const handleToggle = useCallback((key: string) => {
    setModules((prev) =>
      prev.map((m) => (m.key === key && !m.required ? { ...m, enabled: !m.enabled } : m)),
    )
  }, [])

  const handleReorder = useCallback((activeKey: string, overKey: string) => {
    setModules((prev) => {
      const oldIdx = prev.findIndex((m) => m.key === activeKey)
      const newIdx = prev.findIndex((m) => m.key === overKey)
      if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return prev

      const next = [...prev]
      const moved = next.splice(oldIdx, 1)[0]
      if (!moved) return prev
      next.splice(newIdx, 0, moved)
      return next.map((m, i) => ({ ...m, order: i + 1 }))
    })
  }, [])

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () => settingsService.updateNavigation({ modules }),
    onNext,
  })

  return {
    modules,
    handleToggle,
    handleReorder,
    handleSave,
    isPending,
  }
}
