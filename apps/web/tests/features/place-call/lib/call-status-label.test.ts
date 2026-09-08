import { describe, expect, it } from 'vitest'

import { statusLabel } from '@/features/place-call/lib/call-status-label'

const t = (key: string) => key

describe('statusLabel', () => {
  it('labels an active call', () => {
    expect(statusLabel({ status: 'active', held: false, error: null }, t)).toBe('dialer.inCall')
  })

  it('labels a held call', () => {
    expect(statusLabel({ status: 'active', held: true, error: null }, t)).toBe('dialer.onHold')
  })

  it('labels the ended state even while held', () => {
    expect(statusLabel({ status: 'ended', held: true, error: null }, t)).toBe('dialer.ended')
  })

  it('labels ringing', () => {
    expect(statusLabel({ status: 'ringing', held: false, error: null }, t)).toBe('dialer.ringing')
  })

  it('labels connecting for idle and connecting states', () => {
    expect(statusLabel({ status: 'connecting', held: false, error: null }, t)).toBe(
      'dialer.connecting',
    )
    expect(statusLabel({ status: 'idle', held: false, error: null }, t)).toBe('dialer.connecting')
  })

  it('labels a failed call with its normalized error, defaulting to callFailed', () => {
    expect(statusLabel({ status: 'failed', held: false, error: 'busy' }, t)).toBe(
      'dialer.errors.busy',
    )
    expect(statusLabel({ status: 'failed', held: false, error: null }, t)).toBe(
      'dialer.errors.callFailed',
    )
  })
})
