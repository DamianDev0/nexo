import type { AppIcon } from '@/shared/ui/icons'
import type { DEFAULT_SIDEBAR_MODULE_KEYS } from '@repo/shared-types'

export type SidebarModuleKey = (typeof DEFAULT_SIDEBAR_MODULE_KEYS)[number]

export interface NavItem {
  readonly key: SidebarModuleKey
  readonly titleKey: `nav.${SidebarModuleKey}`
  readonly url: string
  readonly basePath: string
  readonly icon: AppIcon
  readonly available: boolean
}
