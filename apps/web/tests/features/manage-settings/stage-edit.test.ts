import { describe, expect, it } from 'vitest'

import type { StageDraft } from '@/features/manage-settings/lib/stage-edit'
import type { PipelineStage } from '@repo/shared-types'

import {
  clampProbability,
  defaultStageInputs,
  moveStageDraft,
  removeStageDraft,
  stageDraftsEqual,
  stageDraftsValid,
  toStageDrafts,
  toStageInputs,
  updateStageDraft,
} from '@/features/manage-settings/lib/stage-edit'

function stage(overrides: Partial<PipelineStage> = {}): PipelineStage {
  return {
    id: 's1',
    pipelineId: 'p1',
    name: 'Lead',
    color: '#60A5FA',
    probability: 10,
    position: 0,
    ...overrides,
  }
}

function draft(overrides: Partial<StageDraft> = {}): StageDraft {
  return { id: 's1', name: 'Lead', color: '#60A5FA', probability: 10, ...overrides }
}

describe('toStageDrafts', () => {
  it('sorts by position and strips pipeline fields', () => {
    const drafts = toStageDrafts([
      stage({ id: 's2', name: 'Won', position: 1 }),
      stage({ id: 's1', name: 'Lead', position: 0 }),
    ])

    expect(drafts.map((d) => d.id)).toEqual(['s1', 's2'])
    expect(drafts[0]).toEqual({ id: 's1', name: 'Lead', color: '#60A5FA', probability: 10 })
  })
})

describe('updateStageDraft', () => {
  it('patches only the matching draft', () => {
    const next = updateStageDraft([draft(), draft({ id: 's2' })], 's2', { probability: 80 })

    expect(next[0]?.probability).toBe(10)
    expect(next[1]?.probability).toBe(80)
  })
})

describe('removeStageDraft', () => {
  it('drops the matching draft', () => {
    expect(removeStageDraft([draft(), draft({ id: 's2' })], 's1').map((d) => d.id)).toEqual(['s2'])
  })
})

describe('moveStageDraft', () => {
  it('moves a draft down one position', () => {
    const next = moveStageDraft([draft(), draft({ id: 's2' }), draft({ id: 's3' })], 's1', 1)

    expect(next.map((d) => d.id)).toEqual(['s2', 's1', 's3'])
  })

  it('keeps order when moving past the edges', () => {
    const drafts = [draft(), draft({ id: 's2' })]

    expect(moveStageDraft(drafts, 's1', -1).map((d) => d.id)).toEqual(['s1', 's2'])
    expect(moveStageDraft(drafts, 's2', 1).map((d) => d.id)).toEqual(['s1', 's2'])
  })
})

describe('stageDraftsEqual', () => {
  it('detects changes in any field or order', () => {
    const a = [draft(), draft({ id: 's2' })]

    expect(stageDraftsEqual(a, [draft(), draft({ id: 's2' })])).toBe(true)
    expect(stageDraftsEqual(a, [draft({ id: 's2' }), draft()])).toBe(false)
    expect(stageDraftsEqual(a, [draft(), draft({ id: 's2', probability: 99 })])).toBe(false)
    expect(stageDraftsEqual(a, [draft()])).toBe(false)
  })
})

describe('stageDraftsValid', () => {
  it('rejects empty lists, blank names and out-of-range probabilities', () => {
    expect(stageDraftsValid([])).toBe(false)
    expect(stageDraftsValid([draft({ name: '   ' })])).toBe(false)
    expect(stageDraftsValid([draft({ probability: 101 })])).toBe(false)
    expect(stageDraftsValid([draft()])).toBe(true)
  })
})

describe('toStageInputs', () => {
  it('assigns positions by index and trims names', () => {
    const inputs = toStageInputs([draft({ name: ' Lead ' }), draft({ id: 's2', name: 'Won' })])

    expect(inputs).toEqual([
      { name: 'Lead', color: '#60A5FA', probability: 10, position: 0 },
      { name: 'Won', color: '#60A5FA', probability: 10, position: 1 },
    ])
  })
})

describe('clampProbability', () => {
  it('clamps to 0-100 and maps invalid input to 0', () => {
    expect(clampProbability('50')).toBe(50)
    expect(clampProbability('150')).toBe(100)
    expect(clampProbability('-5')).toBe(0)
    expect(clampProbability('abc')).toBe(0)
  })
})

describe('defaultStageInputs', () => {
  it('spreads probabilities evenly ending at 100', () => {
    const inputs = defaultStageInputs(['Lead', 'Proposal', 'Won'], ['#111111', '#222222'])

    expect(inputs.map((input) => input.probability)).toEqual([33, 67, 100])
    expect(inputs.map((input) => input.position)).toEqual([0, 1, 2])
    expect(inputs.map((input) => input.color)).toEqual(['#111111', '#222222', '#111111'])
  })
})
