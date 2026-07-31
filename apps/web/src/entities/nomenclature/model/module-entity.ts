import type { EntityKey } from '../query/useEntityLabels'

export const MODULE_ENTITY: Readonly<Record<string, EntityKey>> = {
  contacts: 'contact',
  companies: 'company',
  deals: 'deal',
  activities: 'activity',
}
