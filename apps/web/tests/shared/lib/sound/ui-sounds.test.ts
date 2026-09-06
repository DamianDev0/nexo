import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { resetAudioContext } from '@/shared/lib/sound/audio-context'
import { DTMF_TONES, playDtmf, playTick } from '@/shared/lib/sound/ui-sounds'

type FakeParam = {
  value: number
  setValueAtTime: ReturnType<typeof vi.fn>
  linearRampToValueAtTime: ReturnType<typeof vi.fn>
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
}

function param(): FakeParam {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
}

const started: number[] = []

class FakeAudioContext {
  state = 'running'
  currentTime = 0
  sampleRate = 48_000
  destination = {}
  resume = vi.fn()
  createGain() {
    const node = { gain: param(), connect: vi.fn(() => node) }
    return node
  }
  createOscillator() {
    const osc = {
      type: 'sine',
      frequency: param(),
      connect: vi.fn(),
      start: vi.fn(() => started.push(osc.frequency.value)),
      stop: vi.fn(),
    }
    return osc
  }
  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) }
  }
  createBufferSource() {
    const source = { buffer: null, connect: vi.fn(() => source), start: vi.fn() }
    return source
  }
}

describe('ui sounds', () => {
  beforeEach(() => {
    started.length = 0
    resetAudioContext()
    vi.stubGlobal('AudioContext', FakeAudioContext)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetAudioContext()
  })

  it('plays the two standard DTMF frequencies for a keypad digit', () => {
    playDtmf('5')
    expect(started).toEqual([770, 1336])
    expect(DTMF_TONES['#']).toEqual([941, 1477])
  })

  it('ignores characters without a DTMF tone', () => {
    playDtmf('+')
    expect(started).toEqual([])
  })

  it('plays the ruixen-style noise tick without throwing', () => {
    expect(() => playTick()).not.toThrow()
    expect(started).toEqual([])
  })

  it('stays silent when the browser has no AudioContext', () => {
    vi.unstubAllGlobals()
    resetAudioContext()
    vi.stubGlobal('AudioContext', undefined)
    expect(() => playDtmf('1')).not.toThrow()
    expect(started).toEqual([])
  })
})
