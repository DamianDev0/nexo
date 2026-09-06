import { getAudioContext } from './audio-context'

export const DTMF_TONES: Readonly<Record<string, readonly [number, number]>> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
}

const DTMF_DURATION_S = 0.18
const DTMF_ATTACK_S = 0.008
const DTMF_RELEASE_S = 0.05
const DTMF_GAIN = 0.16
const TICK_DURATION_S = 0.003
const TICK_GAIN = 0.08

function envelope(ctx: AudioContext, gain: number, duration: number, release: number): GainNode {
  const node = ctx.createGain()
  const now = ctx.currentTime
  node.gain.setValueAtTime(0, now)
  node.gain.linearRampToValueAtTime(gain, now + DTMF_ATTACK_S)
  node.gain.setValueAtTime(gain, now + duration - release)
  node.gain.linearRampToValueAtTime(0, now + duration)
  node.connect(ctx.destination)
  return node
}

function tone(ctx: AudioContext, frequency: number, out: GainNode, duration: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = frequency
  osc.connect(out)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function playDtmf(digit: string): void {
  const pair = DTMF_TONES[digit]
  const ctx = getAudioContext()
  if (!pair || !ctx) return
  const out = envelope(ctx, DTMF_GAIN, DTMF_DURATION_S, DTMF_RELEASE_S)
  tone(ctx, pair[0], out, DTMF_DURATION_S)
  tone(ctx, pair[1], out, DTMF_DURATION_S)
}

export function playTick(): void {
  const ctx = getAudioContext()
  if (!ctx) return
  const length = Math.max(1, Math.floor(ctx.sampleRate * TICK_DURATION_S))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 4
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.value = TICK_GAIN
  source.connect(gain).connect(ctx.destination)
  source.start()
}
