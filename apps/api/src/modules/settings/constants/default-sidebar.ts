import { sidebarModuleStatus } from '@repo/shared-types'
import type { SidebarModule, TenantNomenclature } from '@repo/shared-types'
import type { SidebarConfig } from '../interfaces/sidebar-config.interface'

const NOMENCLATURE_MODULE_KEYS: Partial<Record<string, keyof TenantNomenclature>> = {
  contacts: 'contact',
  companies: 'company',
  deals: 'deal',
  activities: 'activity',
}

type ModuleSeed = Pick<SidebarModule, 'key' | 'label' | 'icon' | 'required'>

const MODULE_SEEDS: ReadonlyArray<ModuleSeed> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', required: true },
  { key: 'contacts', label: 'Contactos', icon: 'users', required: false },
  { key: 'companies', label: 'Empresas', icon: 'building', required: false },
  { key: 'deals', label: 'Negocios', icon: 'briefcase', required: false },
  { key: 'activities', label: 'Actividades', icon: 'calendar', required: false },
  { key: 'products', label: 'Productos', icon: 'package', required: false },
  { key: 'settings', label: 'Ajustes', icon: 'settings', required: true },
]

export function defaultSidebarFor(nomenclature: TenantNomenclature): SidebarConfig {
  return {
    modules: DEFAULT_SIDEBAR_CONFIG.modules.map((module) => {
      const entity = NOMENCLATURE_MODULE_KEYS[module.key]
      return entity ? { ...module, label: nomenclature[entity].plural } : module
    }),
  }
}

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  modules: MODULE_SEEDS.map((seed, index) => ({
    ...seed,
    enabled: true,
    order: index + 1,
    customIconUrl: null,
    status: sidebarModuleStatus(seed.key),
  })),
}
