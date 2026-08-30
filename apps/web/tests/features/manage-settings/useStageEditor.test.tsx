import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { PipelineStageInput } from '@/shared/api/services/settings.service'
import type { PipelineStage } from '@repo/shared-types'

import { useStageEditor } from '@/features/manage-settings/model/useStageEditor'

vi.mock('i18next', () => ({ t: (key: string) => key }))

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

const STAGES = [stage(), stage({ id: 's2', name: 'Won', probability: 100, position: 1 })]

describe('useStageEditor', () => {
  it('initializes drafts from the stages sorted by position', () => {
    const { result } = renderHook(() =>
      useStageEditor({ stages: [STAGES[1]!, STAGES[0]!], onSave: vi.fn() }),
    )

    expect(result.current.drafts.map((draft) => draft.id)).toEqual(['s1', 's2'])
    expect(result.current.dirty).toBe(false)
    expect(result.current.valid).toBe(true)
  })

  it('tracks edits as dirty and saves positions by draft order', () => {
    const onSave = vi.fn<(stages: PipelineStageInput[]) => void>()
    const { result } = renderHook(() => useStageEditor({ stages: STAGES, onSave }))

    act(() => result.current.update('s1', { name: 'Contactado' }))
    act(() => result.current.move('s1', 1))
    expect(result.current.dirty).toBe(true)

    act(() => result.current.save())

    expect(onSave).toHaveBeenCalledWith([
      { name: 'Won', color: '#60A5FA', probability: 100, position: 0 },
      { name: 'Contactado', color: '#60A5FA', probability: 10, position: 1 },
    ])
  })

  it('adds a draft with defaults and invalidates on blank names', () => {
    const { result } = renderHook(() => useStageEditor({ stages: STAGES, onSave: vi.fn() }))

    act(() => result.current.add())
    expect(result.current.drafts).toHaveLength(3)
    expect(result.current.drafts.at(-1)?.name).toBe('settings.pipelines.newStageName')
    expect(result.current.valid).toBe(true)

    const addedId = result.current.drafts.at(-1)!.id
    act(() => result.current.update(addedId, { name: '  ' }))
    expect(result.current.valid).toBe(false)
  })

  it('discards edits back to the initial drafts', () => {
    const { result } = renderHook(() => useStageEditor({ stages: STAGES, onSave: vi.fn() }))

    act(() => result.current.remove('s1'))
    expect(result.current.dirty).toBe(true)

    act(() => result.current.discard())
    expect(result.current.drafts.map((draft) => draft.id)).toEqual(['s1', 's2'])
    expect(result.current.dirty).toBe(false)
  })

  it('resets drafts when the incoming stages change', () => {
    const { result, rerender } = renderHook(
      ({ stages }: { stages: PipelineStage[] }) => useStageEditor({ stages, onSave: vi.fn() }),
      { initialProps: { stages: STAGES } },
    )

    act(() => result.current.update('s1', { probability: 55 }))
    expect(result.current.dirty).toBe(true)

    rerender({ stages: [stage({ probability: 55 })] })
    expect(result.current.drafts).toEqual([
      { id: 's1', name: 'Lead', color: '#60A5FA', probability: 55 },
    ])
    expect(result.current.dirty).toBe(false)
  })
})
