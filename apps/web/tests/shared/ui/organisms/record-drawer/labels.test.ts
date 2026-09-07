import { describe, expect, it } from 'vitest'

import { buildRecordDrawerLabels } from '@/shared/ui/organisms/record-drawer'

const t = ((key: string) => key) as never

describe('buildRecordDrawerLabels', () => {
  it('reads every label from the recordDrawer namespace', () => {
    expect(buildRecordDrawerLabels(t)).toEqual({
      title: 'recordDrawer.title',
      prev: 'recordDrawer.prev',
      next: 'recordDrawer.next',
      close: 'recordDrawer.close',
    })
  })
})
