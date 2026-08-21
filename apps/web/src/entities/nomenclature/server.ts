import 'server-only'

import { getNomenclature } from '@/shared/api/dal/settings'
import { getT } from '@/shared/i18n/server'

import type { EntityForm, EntityKey } from './query/useEntityLabels'

export async function getEntityLabel(entity: EntityKey, form: EntityForm): Promise<string> {
  const t = await getT()
  const fallback = t(`entities.${entity}.${form}`)

  try {
    const nomenclature = await getNomenclature()
    return nomenclature[entity]?.[form] ?? fallback
  } catch {
    return fallback
  }
}
