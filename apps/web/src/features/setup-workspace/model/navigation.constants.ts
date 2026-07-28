import type { SidebarModule } from '@repo/shared-types'

export const MODULE_GROUPS: ReadonlyArray<{
  key: string
  moduleKeys: ReadonlyArray<string>
}> = [
  { key: 'overview', moduleKeys: ['dashboard'] },
  { key: 'management', moduleKeys: ['contacts', 'companies', 'deals', 'activities'] },
  { key: 'billing', moduleKeys: ['invoices', 'products'] },
  { key: 'insights', moduleKeys: ['reports'] },
  { key: 'system', moduleKeys: ['settings'] },
]

const GROUP_BY_MODULE = new Map(
  MODULE_GROUPS.flatMap((group) => group.moduleKeys.map((key) => [key, group.key])),
)

export function moduleGroupKey(moduleKey: string): string {
  return GROUP_BY_MODULE.get(moduleKey) ?? 'overview'
}

export function groupModules(modules: ReadonlyArray<SidebarModule>) {
  return MODULE_GROUPS.map((group) => ({
    key: group.key,
    modules: modules.filter((m) => group.moduleKeys.includes(m.key)),
  })).filter((group) => group.modules.length > 0)
}

export const DEFAULT_MODULES: ReadonlyArray<SidebarModule> = [
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
