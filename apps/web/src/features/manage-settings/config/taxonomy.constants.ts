import type { TaxonomyKind } from '../lib/taxonomy-edit'
import type { TaxonomyReassignKind } from '@repo/shared-types'

export const TAXONOMY_REASSIGN_KIND: Record<TaxonomyKind, TaxonomyReassignKind> = {
  statuses: 'status',
  sources: 'source',
  types: 'type',
  lifecycleStages: 'lifecycle',
}
