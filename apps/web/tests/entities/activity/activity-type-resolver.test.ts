import { describe, expect, it } from 'vitest'

import type { ActivityTypeDef } from '@repo/shared-types'

import {
  activityTypeByKey,
  resolveActivityType,
} from '@/entities/activity/lib/activity-type-resolver'

const CATALOG: ActivityTypeDef[] = [
  {
    key: 'call',
    label: 'Llamada',
    icon: 'phone',
    color: '#22C55E',
    trackDuration: true,
    isSystem: true,
  },
  {
    key: 'inspeccion',
    label: 'Inspección',
    icon: 'map-pin',
    color: '#F97316',
    trackDuration: true,
    isSystem: false,
  },
]

describe('resolveActivityType', () => {
  it('answers with what the tenant configured', () => {
    const type = resolveActivityType('inspeccion', CATALOG)

    expect(type).toMatchObject({
      key: 'inspeccion',
      label: 'Inspección',
      icon: 'map-pin',
      color: '#F97316',
      trackDuration: true,
      known: true,
    })
  })

  it('matches regardless of how the activity spelled the key', () => {
    expect(resolveActivityType('CALL', CATALOG).label).toBe('Llamada')
  })

  it('shows the raw type rather than swallowing an unknown one', () => {
    const type = resolveActivityType('site-survey', CATALOG)

    expect(type.label).toBe('site-survey')
    expect(type.known).toBe(false)
  })

  it('still hands back a renderable icon for an unknown type', () => {
    expect(resolveActivityType('site-survey', CATALOG).icon).toBeTruthy()
  })

  it('carries no colour for a type the tenant never defined', () => {
    expect(resolveActivityType('site-survey', CATALOG).color).toBeNull()
  })

  it('falls back when the catalog has not loaded yet', () => {
    expect(resolveActivityType('call', []).label).toBe('call')
  })
})

describe('activityTypeByKey', () => {
  it('indexes the catalog by lowercase key', () => {
    const index = activityTypeByKey(CATALOG)

    expect(index.get('call')?.label).toBe('Llamada')
    expect(index.get('inspeccion')?.label).toBe('Inspección')
    expect(index.get('nope')).toBeUndefined()
  })
})
