import { useQuery } from '@tanstack/react-query'

import { groupModules } from '@/features/setup-workspace'
import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { NAV_CRM } from '../lib/nav-items'

import type { NavItem } from '../model/types'
import type { SidebarModule } from '@repo/shared-types'

export interface SidebarNavGroup {
  readonly key: string
  readonly items: ReadonlyArray<NavItem>
}

export function toNavGroups(modules: ReadonlyArray<SidebarModule>): ReadonlyArray<SidebarNavGroup> {
  const navByKey = new Map(NAV_CRM.map((item) => [item.key, item]))
  const enabled = [...modules].filter((m) => m.enabled).sort((a, b) => a.order - b.order)

  return groupModules(enabled)
    .map((group) => ({
      key: group.key,
      items: group.modules
        .map((m) => navByKey.get(m.key as NavItem['key']))
        .filter((item): item is NavItem => item !== undefined),
    }))
    .filter((group) => group.items.length > 0)
}

const ALL_ENABLED: ReadonlyArray<SidebarModule> = NAV_CRM.map((item, index) => ({
  key: item.key,
  label: item.key,
  icon: item.key,
  enabled: true,
  order: index + 1,
  customIconUrl: null,
  required: false,
}))

export function useSidebarModules(): ReadonlyArray<SidebarNavGroup> {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.navigation,
    queryFn: settingsService.getNavigation,
    staleTime: 5 * 60 * 1000,
  })

  const modules = data?.modules?.length ? data.modules : ALL_ENABLED
  return toNavGroups(modules)
}
