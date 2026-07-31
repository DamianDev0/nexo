import { MODULE_ICON_NAMES, SIDEBAR_ICON_MAP } from '../config/module-icons.constants'
import { MODULE_GROUPS } from '../config/navigation.constants'

import type { SidebarModuleKey } from '../model/types'
import type { AppIcon } from '@/shared/ui/icons'
import type { SidebarModule } from '@repo/shared-types'

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

export function moduleIcon(key: SidebarModuleKey): AppIcon {
  return SIDEBAR_ICON_MAP[MODULE_ICON_NAMES[key]]!
}
