import { sidebarModuleStatus } from '@repo/shared-types'
import { useQuery } from '@tanstack/react-query'

import { groupModules } from '@/features/setup-workspace'
import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { NAV_CRM } from '../lib/nav-items'

import type { NavEntry } from '../model/types'
import type { SidebarModule } from '@repo/shared-types'

export interface SidebarNavGroup {
  readonly key: string
  readonly items: ReadonlyArray<NavEntry>
}

export function toNavGroups(modules: ReadonlyArray<SidebarModule>): ReadonlyArray<SidebarNavGroup> {
  const navByKey = new Map(NAV_CRM.map((item) => [item.key, item]))
  const enabled = [...modules].filter((m) => m.enabled).sort((a, b) => a.order - b.order)

  return groupModules(enabled)
    .map((group) => ({
      key: group.key,
      items: group.modules
        .map((m) => {
          const item = navByKey.get(m.key as NavEntry['key'])
          if (!item) return undefined
          return { ...item, available: (m.status ?? sidebarModuleStatus(m.key)) === 'available' }
        })
        .filter((item): item is NavEntry => item !== undefined),
    }))
    .filter((group) => group.items.length > 0)
}

const FALLBACK_MODULES: ReadonlyArray<SidebarModule> = NAV_CRM.map((item, index) => ({
  key: item.key,
  label: item.key,
  icon: item.key,
  enabled: sidebarModuleStatus(item.key) === 'available',
  order: index + 1,
  customIconUrl: null,
  required: false,
  status: sidebarModuleStatus(item.key),
}))

export function useSidebarModules(): ReadonlyArray<SidebarNavGroup> {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.navigation,
    queryFn: settingsService.getNavigation,
    staleTime: 5 * 60 * 1000,
  })

  const modules = data?.modules?.length ? data.modules : FALLBACK_MODULES
  return toNavGroups(modules)
}
