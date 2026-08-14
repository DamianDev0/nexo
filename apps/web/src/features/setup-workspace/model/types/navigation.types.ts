import type { DEFAULT_SIDEBAR_MODULE_KEYS, SidebarModule } from '@repo/shared-types'

export type SidebarModuleKey = (typeof DEFAULT_SIDEBAR_MODULE_KEYS)[number]

export interface ModuleGroup {
  readonly key: string
  readonly moduleKeys: ReadonlyArray<string>
}

export interface NavigationFormValues {
  modules: SidebarModule[]
}
