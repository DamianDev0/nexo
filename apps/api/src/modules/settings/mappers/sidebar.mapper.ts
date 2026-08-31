import { sidebarModuleStatus } from '@repo/shared-types'
import type { SidebarConfig, SidebarConfigInput } from '../interfaces/sidebar-config.interface'

export function withModuleStatus(config: SidebarConfigInput): SidebarConfig {
  return {
    modules: config.modules.map((module) => ({
      ...module,
      status: sidebarModuleStatus(module.key),
    })),
  }
}
