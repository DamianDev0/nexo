import { parseConditions } from '@/shared/ui/organisms/filter-bar'

import type { ContactSort } from '@/entities/contact'
import type {
  ContactTableState,
  ContactView,
  ContactViewInput,
  FilterCondition,
} from '@repo/shared-types'

export type ViewSnapshot = {
  readonly advanced: ReadonlyArray<FilterCondition>
  readonly search: string
  readonly sort: ContactSort | null
  readonly tableState: ContactTableState
}

export function viewConditions(view: ContactView): FilterCondition[] {
  const raw = view.advancedFilters?.conditions
  return parseConditions(raw ? JSON.stringify(raw) : null)
}

export function viewSearch(view: ContactView): string {
  const q = view.filters.q
  return typeof q === 'string' ? q : ''
}

function canonicalConditions(conditions: ReadonlyArray<FilterCondition>): string {
  return JSON.stringify(
    conditions.map((condition) => [condition.field, condition.operator, condition.value ?? null]),
  )
}

export function matchesSnapshot(view: ContactView, snapshot: ViewSnapshot): boolean {
  return (
    canonicalConditions(viewConditions(view)) === canonicalConditions([...snapshot.advanced]) &&
    viewSearch(view) === snapshot.search.trim()
  )
}

export function isSnapshotDirty(snapshot: ViewSnapshot): boolean {
  return snapshot.advanced.length > 0 || snapshot.search.trim().length > 0
}

export function buildViewInput(
  meta: { name: string; description: string },
  snapshot: ViewSnapshot,
): ContactViewInput {
  const conditions = snapshot.advanced
  return {
    name: meta.name.trim(),
    description: meta.description.trim() || null,
    filters: snapshot.search.trim() ? { q: snapshot.search.trim() } : {},
    advancedFilters: conditions.length > 0 ? { conditions: [...conditions] } : null,
    sort: snapshot.sort,
    columns: snapshot.tableState.columns,
    density: snapshot.tableState.density,
  }
}
