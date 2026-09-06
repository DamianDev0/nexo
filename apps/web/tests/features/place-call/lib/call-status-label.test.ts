import { describe, expect, it } from 'vitest'

import { statusLabel } from '@/features/place-call/lib/call-status-label'

const t = (key: string) => key

describe('statusLabel', () => {
  it('labels an active call', () => {
    expect(statusLabel('active', false, t)).toBe('dialer.inCall')
  })

  it('labels a held call', () => {
    expect(statusLabel('active', true, t)).toBe('dialer.onHold')
  })

  it('labels the ended state even while held', () => {
    expect(statusLabel('ended', true, t)).toBe('dialer.ended')
  })

  it('labels connecting for idle and connecting states', () => {
    expect(statusLabel('connecting', false, t)).toBe('dialer.connecting')
    expect(statusLabel('idle', false, t)).toBe('dialer.connecting')
  })
})
