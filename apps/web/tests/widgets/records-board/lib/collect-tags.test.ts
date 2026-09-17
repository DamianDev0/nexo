import { describe, expect, it } from 'vitest'

import { collectTags } from '@/widgets/records-board/lib/collect-tags'

describe('collectTags', () => {
  it('unions tags across rows without duplicates and skips rows without tags', () => {
    expect(collectTags([{ tags: ['vip', 'seed'] }, {}, { tags: ['seed', 'lead'] }])).toEqual([
      'vip',
      'seed',
      'lead',
    ])
  })
})
