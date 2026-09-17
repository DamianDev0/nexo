import { blankToUndefined } from '@repo/shared-utils'

import { parseConditions } from '@/shared/ui/organisms/filter-bar'

import type { RecordSort } from '@/entities/object-descriptor'
import type {
  ObjectTableState,
  ObjectView,
  ObjectViewInput,
  FilterCondition,
} from '@repo/shared-types'

export type ViewSnapshot = {
  readonly advanced: ReadonlyArray<FilterCondition>
  readonly search: string
  readonly sort: RecordSort | null
  readonly tableState: ObjectTableState
}

export function viewConditions(view: ObjectView): FilterCondition[] {
  const raw = view.advancedFilters?.conditions
  return parseConditions(raw ? JSON.stringify(raw) : null)
}

export function viewSearch(view: ObjectView): string {
  const q = view.filters.q
  return typeof q === 'string' ? q : ''
}

function canonicalConditions(conditions: ReadonlyArray<FilterCondition>): string {
  return JSON.stringify(
    conditions.map((condition) => [condition.field, condition.operator, condition.value ?? null]),
  )
}

export function matchesSnapshot(view: ObjectView, snapshot: ViewSnapshot): boolean {
  return (
    canonicalConditions(viewConditions(view)) === canonicalConditions([...snapshot.advanced]) &&
    viewSearch(view) === snapshot.search.trim()
  )
}

export function sortViews(views: ReadonlyArray<ObjectView>): ObjectView[] {
  return [...views].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
    return a.position - b.position
  })
}

export function isViewOwner(view: ObjectView, viewerId?: string | null): boolean {
  return viewerId != null && view.ownerId === viewerId
}

export function defaultView(
  views: ReadonlyArray<ObjectView>,
  viewerId?: string | null,
): ObjectView | null {
  return (
    views.find((view) => view.isDefault && view.ownerId === viewerId) ??
    views.find((view) => view.isDefault) ??
    null
  )
}

export function isSnapshotDirty(snapshot: ViewSnapshot): boolean {
  return snapshot.advanced.length > 0 || snapshot.search.trim().length > 0
}

export function buildViewInput(
  meta: { name: string; description: string },
  snapshot: ViewSnapshot,
): ObjectViewInput {
  const conditions = snapshot.advanced
  return {
    name: meta.name.trim(),
    description: blankToUndefined(meta.description.trim()) ?? null,
    filters: snapshot.search.trim() ? { q: snapshot.search.trim() } : {},
    advancedFilters: conditions.length > 0 ? { conditions: [...conditions] } : null,
    sort: snapshot.sort,
    columns: snapshot.tableState.columns,
    density: snapshot.tableState.density,
  }
}
