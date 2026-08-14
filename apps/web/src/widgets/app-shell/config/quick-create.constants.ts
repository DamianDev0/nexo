import { CREATE_PARAM, ROUTES } from '@/shared/config/routes'

import type { QuickCreateTarget } from '../model/types'

export const QUICK_CREATE_TRIGGER_SIZE = 32
export const QUICK_CREATE_PANEL_WIDTH = 208
export const QUICK_CREATE_PANEL_RADIUS = 24

export const QUICK_CREATE_TARGETS: ReadonlyArray<QuickCreateTarget> = [
  {
    entity: 'contact',
    module: 'contacts',
    href: `${ROUTES.app.contacts.list}?${CREATE_PARAM}=1`,
    available: true,
  },
  {
    entity: 'company',
    module: 'companies',
    href: `${ROUTES.app.companies.list}?${CREATE_PARAM}=1`,
    available: false,
  },
  {
    entity: 'deal',
    module: 'deals',
    href: `${ROUTES.app.deals.list}?${CREATE_PARAM}=1`,
    available: false,
  },
  {
    entity: 'activity',
    module: 'activities',
    href: `${ROUTES.app.activities}?${CREATE_PARAM}=1`,
    available: false,
  },
]
