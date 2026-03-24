import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import type { SidebarModule } from '@repo/shared-types'
import settingsService from '@/core/services/settings.service'

const DEFAULT_MODULES: SidebarModule[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    enabled: true,
    order: 1,
    customIconUrl: null,
    required: true,
  },
  {
    key: 'contacts',
    label: 'Contacts',
    icon: 'users',
    enabled: true,
    order: 2,
    customIconUrl: null,
    required: false,
  },
  {
    key: 'companies',
    label: 'Companies',
    icon: 'building',
    enabled: true,
    order: 3,
    customIconUrl: null,
    required: false,
  },
  {
    key: 'deals',
    label: 'Deals',
    icon: 'briefcase',
    enabled: true,
    order: 4,
    customIconUrl: null,
    required: false,
  },
  {
    key: 'activities',
    label: 'Activities',
    icon: 'calendar',
    enabled: true,
    order: 5,
    customIconUrl: null,
    required: false,
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: 'file-text',
    enabled: true,
    order: 6,
    customIconUrl: null,
    required: false,
  },
  {
    key: 'products',
    label: 'Products',
    icon: 'package',
    enabled: true,
    order: 7,
    customIconUrl: null,
    required: false,
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'bar-chart',
    enabled: true,
    order: 8,
    customIconUrl: null,
    required: false,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'settings',
    enabled: true,
    order: 9,
    customIconUrl: null,
    required: true,
  },
]

export function useStepNavigation(onNext: () => void) {
  const [modules, setModules] = useState<SidebarModule[]>(DEFAULT_MODULES)

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

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => settingsService.updateNavigation({ modules }),
    onSuccess: () => onNext(),
    onError: (err) => sileo.error({ title: 'Failed to save', description: err.message }),
  })

  const handleSave = useCallback(() => save(), [save])

  return {
    modules,
    handleToggle,
    handleReorder,
    handleSave,
    isPending,
  }
}
