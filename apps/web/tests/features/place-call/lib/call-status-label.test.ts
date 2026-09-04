import { describe, expect, it } from 'vitest'

import { statusLabel } from '@/features/place-call/lib/call-status-label'

const t = (key: string) => key

describe('statusLabel', () => {
  it('formats the elapsed duration while the call is active', () => {
    expect(statusLabel('active', 65, t)).toBe('01:05')
  })

  it('formats zero seconds when the active call just connected', () => {
    expect(statusLabel('active', 0, t)).toBe('00:00')
  })

  it('translates the ended state', () => {
    expect(statusLabel('ended', 12, t)).toBe('dialer.ended')
  })

  it('translates connecting for idle and connecting states', () => {
    expect(statusLabel('connecting', 0, t)).toBe('dialer.connecting')
    expect(statusLabel('idle', 0, t)).toBe('dialer.connecting')
  })
})
