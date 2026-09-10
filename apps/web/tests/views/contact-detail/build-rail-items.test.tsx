import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { DETAIL_PANELS } from '@/views/contact-detail/config/detail-panels.constants'
import { buildDetailRailItems } from '@/views/contact-detail/lib/build-rail-items'

const t = ((key: string) => key) as TFunction

const COUNTS = { activity: 7, notes: 2, tasks: 0, meetings: 1, tags: 3 }

describe('buildDetailRailItems', () => {
  it('builds one item per panel, in the order the rail declares', () => {
    const items = buildDetailRailItems(t, COUNTS, DETAIL_PANELS)

    expect(items.map((item) => item.id)).toEqual([...DETAIL_PANELS])
  })

  it('gives every item a label and an icon', () => {
    for (const item of buildDetailRailItems(t, COUNTS, DETAIL_PANELS)) {
      expect(item.label).toBeTruthy()
      expect(item.icon).toBeTruthy()
    }
  })

  it('carries the count of each panel', () => {
    const byId = new Map(buildDetailRailItems(t, COUNTS, DETAIL_PANELS).map((i) => [i.id, i.count]))

    expect(byId.get('activity')).toBe(7)
    expect(byId.get('tags')).toBe(3)
  })

  it('hides the badge on an empty panel instead of showing a zero', () => {
    const byId = new Map(buildDetailRailItems(t, COUNTS, DETAIL_PANELS).map((i) => [i.id, i.count]))

    expect(byId.get('tasks')).toBeUndefined()
  })
})
