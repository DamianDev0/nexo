import { describe, expect, it } from 'vitest'

import type { ActivityTypeDef } from '@repo/shared-types'

import {
  buildActivityType,
  withActivityPatch,
} from '@/features/manage-settings/lib/activity-type-edit'


function activityType(overrides: Partial<ActivityTypeDef> = {}): ActivityTypeDef {
  return {
    key: 'call',
    label: 'Llamada',
    icon: 'phone',
    color: '#22C55E',
    trackDuration: true,
    isSystem: true,
    ...overrides,
  }
}

describe('buildActivityType', () => {
  it('slugifies the label into the key and marks the type as custom', () => {
    const def = buildActivityType(
      { label: '  Visita técnica  ', icon: 'map-pin', color: '#60A5FA', trackDuration: true },
      [activityType()],
    )

    expect(def.key).toBe('visita_tecnica')
    expect(def.label).toBe('Visita técnica')
    expect(def.icon).toBe('map-pin')
    expect(def.color).toBe('#60A5FA')
    expect(def.trackDuration).toBe(true)
    expect(def.isSystem).toBe(false)
  })

  it('uniquifies the key when it collides with an existing type', () => {
    const def = buildActivityType(
      { label: 'Call', icon: 'phone', color: '#22C55E', trackDuration: false },
      [activityType()],
    )

    expect(def.key).toBe('call_2')
  })

  it('caps the key at 30 characters', () => {
    const def = buildActivityType(
      {
        label: 'Reunión de seguimiento trimestral con el cliente',
        icon: 'users',
        color: '#A78BFA',
        trackDuration: false,
      },
      [],
    )

    expect(def.key.length).toBeLessThanOrEqual(30)
    expect(def.key).toMatch(/^[a-z][a-z0-9_]*$/)
  })
})

describe('withActivityPatch', () => {
  it('merges the patch preserving key and isSystem', () => {
    const patched = withActivityPatch(activityType(), { label: ' Llamada fría ', color: '#F87171' })

    expect(patched.key).toBe('call')
    expect(patched.isSystem).toBe(true)
    expect(patched.label).toBe('Llamada fría')
    expect(patched.color).toBe('#F87171')
    expect(patched.trackDuration).toBe(true)
  })

  it('toggles trackDuration without touching other fields', () => {
    const patched = withActivityPatch(activityType(), { trackDuration: false })

    expect(patched.trackDuration).toBe(false)
    expect(patched.icon).toBe('phone')
  })
})
