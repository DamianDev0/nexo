import { describe, expect, it } from 'vitest'

import type { Tag, TaxonomyOption } from '@repo/shared-types'

import { optionCandidates, tagCandidates } from '@/features/manage-settings/lib/reassign-candidates'

const TAGS: Tag[] = [
  {
    id: 'tag-1',
    name: 'VIP',
    color: '#60A5FA',
    description: null,
    enabled: true,
    entityType: 'contact',
    createdAt: '2026-01-01',
  },
  {
    id: 'tag-2',
    name: 'Frio',
    color: '#A78BFA',
    description: null,
    enabled: true,
    entityType: 'contact',
    createdAt: '2026-01-02',
  },
]

const OPTIONS: TaxonomyOption[] = [
  {
    key: 'new',
    label: 'Nuevo',
    description: null,
    color: '#60A5FA',
    order: 1,
    isSystem: true,
    enabled: true,
  },
  {
    key: 'vip',
    label: null,
    description: null,
    color: '#F87171',
    order: 2,
    isSystem: false,
    enabled: true,
  },
]

describe('tagCandidates', () => {
  it('drops the excluded tag and keys candidates by name', () => {
    expect(tagCandidates(TAGS, 'tag-2')).toEqual([{ key: 'VIP', label: 'VIP', color: '#60A5FA' }])
  })

  it('returns every tag when the excluded id is unknown', () => {
    expect(tagCandidates(TAGS, 'ghost')).toHaveLength(2)
  })

  it('returns an empty list for an empty source', () => {
    expect(tagCandidates([], 'tag-1')).toEqual([])
  })
})

describe('optionCandidates', () => {
  it('drops the excluded option and resolves labels through the resolver', () => {
    expect(optionCandidates(OPTIONS, 'new', (option) => option.label ?? option.key)).toEqual([
      { key: 'vip', label: 'vip', color: '#F87171' },
    ])
  })

  it('keeps every option when the excluded key is unknown', () => {
    expect(optionCandidates(OPTIONS, 'ghost', (option) => option.key)).toHaveLength(2)
  })
})
