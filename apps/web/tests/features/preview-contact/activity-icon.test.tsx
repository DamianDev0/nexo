import { describe, expect, it } from 'vitest'

import { ACTIVITY_KIND_KEYS } from '@/features/preview-contact/lib/activity-groups'
import { activityIcon } from '@/features/preview-contact/lib/activity-icon'

describe('activityIcon', () => {
  it('has an icon for every kind and a fallback for other', () => {
    for (const kind of ACTIVITY_KIND_KEYS) expect(activityIcon(kind)).toBeTruthy()
    expect(activityIcon('other')).toBeTruthy()
  })
})
