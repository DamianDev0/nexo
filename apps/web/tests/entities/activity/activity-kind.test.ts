import { describe, expect, it } from 'vitest'

import {
  ACTIVITY_KIND_KEYS,
  activityIcon,
  activityKindKey,
  activityPreview,
  isActivityCompleted,
} from '@/entities/activity'

describe('activityKindKey', () => {
  it('normalises known kinds and buckets the rest as other', () => {
    expect(activityKindKey('Meeting')).toBe('meeting')
    expect(activityKindKey('site_visit')).toBe('other')
  })
})

describe('activityPreview', () => {
  it('prefers the title, then the first description line', () => {
    expect(activityPreview({ title: 'Llamar', description: 'x' })).toBe('Llamar')
    expect(activityPreview({ title: null, description: 'línea 1\nlínea 2' })).toBe('línea 1')
    expect(activityPreview({ title: null, description: null })).toBe('')
  })
})

describe('isActivityCompleted', () => {
  it('reads the completion timestamp', () => {
    expect(isActivityCompleted({ completedAt: '2026-09-02T00:00:00.000Z' })).toBe(true)
    expect(isActivityCompleted({ completedAt: null })).toBe(false)
  })
})

describe('activityIcon', () => {
  it('has an icon for every kind and a fallback for other', () => {
    for (const kind of ACTIVITY_KIND_KEYS) expect(activityIcon(kind)).toBeTruthy()
    expect(activityIcon('other')).toBeTruthy()
  })
})
