import { sidebarModuleStatus } from '@repo/shared-types'

import type { ModuleGroup } from '../model/types'
import type { SidebarModule } from '@repo/shared-types'

export const MODULE_GROUPS: ReadonlyArray<ModuleGroup> = [
  { key: 'overview', moduleKeys: ['dashboard'] },
  { key: 'management', moduleKeys: ['contacts', 'companies', 'deals', 'activities'] },
  { key: 'billing', moduleKeys: ['invoices', 'products'] },
  { key: 'insights', moduleKeys: ['reports'] },
  { key: 'system', moduleKeys: ['settings'] },
]

type ModuleSeed = Pick<SidebarModule, 'key' | 'label' | 'icon' | 'required'>

const MODULE_SEEDS: ReadonlyArray<ModuleSeed> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', required: true },
  { key: 'contacts', label: 'Contacts', icon: 'users', required: false },
  { key: 'companies', label: 'Companies', icon: 'building', required: false },
  { key: 'deals', label: 'Deals', icon: 'briefcase', required: false },
  { key: 'activities', label: 'Activities', icon: 'calendar', required: false },
  { key: 'products', label: 'Products', icon: 'package', required: false },
  { key: 'settings', label: 'Settings', icon: 'settings', required: true },
]

export const DEFAULT_MODULES: ReadonlyArray<SidebarModule> = MODULE_SEEDS.map((seed, index) => ({
  ...seed,
  enabled: true,
  order: index + 1,
  customIconUrl: null,
  status: sidebarModuleStatus(seed.key),
}))
