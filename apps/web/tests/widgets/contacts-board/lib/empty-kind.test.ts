import { describe, expect, it } from 'vitest'

import { resolveEmptyKind } from '@/widgets/contacts-board/lib/empty-kind'

const base = { isFiltered: false, isArchived: false, search: '', advanced: [] }

describe('resolveEmptyKind', () => {
  it('distinguishes an empty workspace from a filtered miss', () => {
    expect(resolveEmptyKind(base)).toBe('empty')
    expect(resolveEmptyKind({ ...base, isFiltered: true })).toBe('noResults')
  })

  it('shows the archived copy only when nothing narrows the archived list', () => {
    expect(resolveEmptyKind({ ...base, isArchived: true, isFiltered: true })).toBe('archivedEmpty')
    expect(resolveEmptyKind({ ...base, isArchived: true, isFiltered: true, search: 'ana' })).toBe(
      'noResults',
    )
    expect(resolveEmptyKind({ ...base, isArchived: true, isFiltered: true, advanced: [{}] })).toBe(
      'noResults',
    )
  })
})
