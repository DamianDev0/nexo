import type { TenantNomenclature } from '@repo/shared-types'
import type { SidebarConfig } from '../interfaces/sidebar-config.interface'

const NOMENCLATURE_MODULE_KEYS: Partial<Record<string, keyof TenantNomenclature>> = {
  contacts: 'contact',
  companies: 'company',
  deals: 'deal',
  activities: 'activity',
}

export function defaultSidebarFor(nomenclature: TenantNomenclature): SidebarConfig {
  return {
    modules: DEFAULT_SIDEBAR_CONFIG.modules.map((module) => {
      const entity = NOMENCLATURE_MODULE_KEYS[module.key]
      return entity ? { ...module, label: nomenclature[entity].plural } : module
    }),
  }
}

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  modules: [
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
      label: 'Contactos',
      icon: 'users',
      enabled: true,
      order: 2,
      customIconUrl: null,
      required: false,
    },
    {
      key: 'companies',
      label: 'Empresas',
      icon: 'building',
      enabled: true,
      order: 3,
      customIconUrl: null,
      required: false,
    },
    {
      key: 'deals',
      label: 'Negocios',
      icon: 'briefcase',
      enabled: true,
      order: 4,
      customIconUrl: null,
      required: false,
    },
    {
      key: 'activities',
      label: 'Actividades',
      icon: 'calendar',
      enabled: true,
      order: 5,
      customIconUrl: null,
      required: false,
    },
    {
      key: 'invoices',
      label: 'Facturas',
      icon: 'file-text',
      enabled: true,
      order: 6,
      customIconUrl: null,
      required: false,
    },
    {
      key: 'products',
      label: 'Productos',
      icon: 'package',
      enabled: true,
      order: 7,
      customIconUrl: null,
      required: false,
    },
    {
      key: 'reports',
      label: 'Reportes',
      icon: 'bar-chart',
      enabled: true,
      order: 8,
      customIconUrl: null,
      required: false,
    },
    {
      key: 'settings',
      label: 'Ajustes',
      icon: 'settings',
      enabled: true,
      order: 9,
      customIconUrl: null,
      required: true,
    },
  ],
}
