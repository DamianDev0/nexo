import { moduleIcon } from '@/features/setup-workspace'

import { QUICK_CREATE_TARGETS } from '../config/quick-create.constants'

import type { EntityLabelFn, QuickCreateItem } from '../model/types'

export function buildQuickCreateItems(entityLabel: EntityLabelFn): QuickCreateItem[] {
  return QUICK_CREATE_TARGETS.map((target) => ({
    entity: target.entity,
    label: entityLabel(target.entity, 'singular'),
    icon: moduleIcon(target.module),
    href: target.href,
    available: target.available,
  }))
}
