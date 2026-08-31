import { isSidebarModuleAvailable } from '@repo/shared-types'

import { CREATE_PARAM, ROUTES } from '@/shared/config/routes'

import type { QuickCreateTarget } from '../model/types'

export const QUICK_CREATE_TRIGGER_SIZE = 32
export const QUICK_CREATE_PANEL_WIDTH = 208
export const QUICK_CREATE_PANEL_RADIUS = 24

type QuickCreateSeed = Omit<QuickCreateTarget, 'available'>

const QUICK_CREATE_SEEDS: ReadonlyArray<QuickCreateSeed> = [
  {
    entity: 'contact',
    module: 'contacts',
    href: `${ROUTES.app.contacts.list}?${CREATE_PARAM}=1`,
  },
  {
    entity: 'company',
    module: 'companies',
    href: `${ROUTES.app.companies.list}?${CREATE_PARAM}=1`,
  },
  {
    entity: 'deal',
    module: 'deals',
    href: `${ROUTES.app.deals.list}?${CREATE_PARAM}=1`,
  },
  {
    entity: 'activity',
    module: 'activities',
    href: `${ROUTES.app.activities}?${CREATE_PARAM}=1`,
  },
]

export const QUICK_CREATE_TARGETS: ReadonlyArray<QuickCreateTarget> = QUICK_CREATE_SEEDS.map(
  (seed) => ({ ...seed, available: isSidebarModuleAvailable(seed.module) }),
)
