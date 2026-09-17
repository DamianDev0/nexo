type EmptyKind = 'empty' | 'noResults' | 'archivedEmpty'

type EmptyFlags = {
  readonly isFiltered: boolean
  readonly isArchived: boolean
  readonly search: string
  readonly advanced: ReadonlyArray<unknown>
}

export function resolveEmptyKind(state: EmptyFlags): EmptyKind {
  const narrowed = state.search.trim() !== '' || state.advanced.length > 0
  if (state.isArchived && !narrowed) return 'archivedEmpty'
  return state.isFiltered ? 'noResults' : 'empty'
}
