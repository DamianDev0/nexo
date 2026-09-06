import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAudioContext, resetAudioContext } from '@/shared/lib/sound/audio-context'

class FakeAudioContext {
  state = 'suspended'
  resume = vi.fn(() => {
    this.state = 'running'
    return Promise.resolve()
  })
}

describe('getAudioContext', () => {
  afterEach(() => {
    resetAudioContext()
    vi.unstubAllGlobals()
  })

  it('returns null when the browser has no AudioContext', () => {
    vi.stubGlobal('AudioContext', undefined)
    expect(getAudioContext()).toBeNull()
  })

  it('creates the context once, resumes it when suspended and reuses it afterwards', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)

    const first = getAudioContext() as unknown as FakeAudioContext
    const second = getAudioContext()

    expect(second).toBe(first)
    expect(first.resume).toHaveBeenCalledTimes(1)
  })

  it('drops the cached context on reset', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    const first = getAudioContext()
    resetAudioContext()

    expect(getAudioContext()).not.toBe(first)
  })
})
