import type { ContactTaxonomyMaps } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

export type StatusHighlight = {
  readonly label: string
  readonly color: string | null
  readonly since: string | null
  readonly lifecycle: string
}

export function buildStatusHighlight(
  contact: ContactListItem,
  taxonomy: ContactTaxonomyMaps,
): StatusHighlight {
  const status = taxonomy.statusByKey.get(contact.status)
  const lifecycle = taxonomy.lifecycleByKey.get(contact.lifecycleStage)
  return {
    label: status?.label ?? contact.status,
    color: status?.color ?? null,
    since: contact.statusChangedAt,
    lifecycle: lifecycle?.label ?? contact.lifecycleStage,
  }
}
