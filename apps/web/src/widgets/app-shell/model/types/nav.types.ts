import type { AppIcon } from '@/shared/ui/icons'
import type { SidebarModuleKey } from '@repo/shared-types'

export type { SidebarModuleKey }

export interface SidebarUser {
  readonly name: string
  readonly email: string
  readonly avatarUrl: string | null
}

export interface SidebarTeam {
  readonly name: string
  readonly plan: string
}

export interface NavItem {
  readonly key: SidebarModuleKey
  readonly titleKey: `nav.${SidebarModuleKey}`
  readonly url: string
  readonly basePath: string
  readonly icon: AppIcon
}

export interface NavEntry extends NavItem {
  readonly available: boolean
}
