import { sidebarModuleStatus } from '@repo/shared-types'
import type { SidebarConfig, SidebarModule } from '@repo/shared-types'

const MODULE_DEFAULTS: ReadonlyArray<Pick<SidebarModule, 'key' | 'label' | 'icon' | 'required'>> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', required: true },
  { key: 'contacts', label: 'Contacts', icon: 'users', required: false },
  { key: 'settings', label: 'Settings', icon: 'cog', required: true },
]

export function sidebarModule(key: string, overrides: Partial<SidebarModule> = {}): SidebarModule {
  const seed = MODULE_DEFAULTS.find((m) => m.key === key) ?? {
    key,
    label: key,
    icon: key,
    required: false,
  }
  return {
    ...seed,
    enabled: true,
    order: 1,
    customIconUrl: null,
    status: sidebarModuleStatus(key),
    ...overrides,
  }
}

export function sidebarConfig(modules?: ReadonlyArray<SidebarModule>): SidebarConfig {
  return {
    modules: modules
      ? [...modules]
      : [
          sidebarModule('dashboard', { order: 1 }),
          sidebarModule('contacts', { order: 2 }),
          sidebarModule('settings', { order: 9 }),
        ],
  }
}
