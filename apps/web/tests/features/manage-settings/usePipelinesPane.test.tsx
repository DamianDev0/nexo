import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { CreatePipelineInput } from '@/shared/api/services/settings.service'
import type { Pipeline } from '@repo/shared-types'

import { usePipelinesPane } from '@/features/manage-settings/model/usePipelinesPane'

vi.mock('i18next', () => ({ t: (key: string) => key }))

vi.mock('sileo', () => ({ sileo: { error: vi.fn(), success: vi.fn() } }))

const server = createMswServer()

const PIPELINES: Pipeline[] = [
  {
    id: 'p1',
    name: 'Ventas',
    isDefault: true,
    stages: [
      { id: 's1', pipelineId: 'p1', name: 'Lead', color: '#60A5FA', probability: 10, position: 0 },
    ],
  },
  { id: 'p2', name: 'Alterno', isDefault: false, stages: [] },
]

function listHandler(data: Pipeline[]) {
  return http.get(`${API}/settings/pipelines`, () => HttpResponse.json({ data }))
}

describe('usePipelinesPane', () => {
  it('exposes the fetched pipelines', async () => {
    server.use(listHandler(PIPELINES))

    const { result } = renderHook(() => usePipelinesPane(), { wrapper })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.pipelines.map((pipeline) => pipeline.id)).toEqual(['p1', 'p2'])
  })

  it('creates a pipeline with translated default stages and closes the dialog', async () => {
    let created: CreatePipelineInput | null = null
    server.use(
      listHandler(PIPELINES),
      http.post(`${API}/settings/pipelines`, async ({ request }) => {
        created = (await request.json()) as CreatePipelineInput
        return HttpResponse.json({ data: PIPELINES[0] })
      }),
    )

    const { result } = renderHook(() => usePipelinesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.creator.openCreate())
    act(() => result.current.creator.onSubmit('  Embudo B2B  '))

    await waitFor(() => expect(created).not.toBeNull())
    expect(created!.name).toBe('Embudo B2B')
    expect(created!.stages).toHaveLength(3)
    expect(created!.stages.map((stage) => stage.position)).toEqual([0, 1, 2])
    expect(created!.stages.at(-1)?.probability).toBe(100)
    expect(result.current.creator.open).toBe(false)
  })

  it('renames with a trimmed name and ignores blank names', async () => {
    const patches: Array<{ name?: string }> = []
    server.use(
      listHandler(PIPELINES),
      http.patch(`${API}/settings/pipelines/p2`, async ({ request }) => {
        patches.push((await request.json()) as { name?: string })
        return HttpResponse.json({ data: PIPELINES[1] })
      }),
    )

    const { result } = renderHook(() => usePipelinesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.actions.onRename('p2', '   '))
    act(() => result.current.actions.onRename('p2', ' Postventa '))

    await waitFor(() => expect(patches).toEqual([{ name: 'Postventa' }]))
  })

  it('sets a pipeline as default', async () => {
    let patched: { isDefault?: boolean } | null = null
    server.use(
      listHandler(PIPELINES),
      http.patch(`${API}/settings/pipelines/p2`, async ({ request }) => {
        patched = (await request.json()) as { isDefault?: boolean }
        return HttpResponse.json({ data: PIPELINES[1] })
      }),
    )

    const { result } = renderHook(() => usePipelinesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.actions.onSetDefault('p2'))

    await waitFor(() => expect(patched).toEqual({ isDefault: true }))
  })

  it('toggles expansion per pipeline', async () => {
    server.use(listHandler(PIPELINES))

    const { result } = renderHook(() => usePipelinesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.actions.onToggleExpand('p1'))
    expect(result.current.expandedId).toBe('p1')

    act(() => result.current.actions.onToggleExpand('p1'))
    expect(result.current.expandedId).toBeNull()
  })

  it('deletes only after confirming the removal dialog', async () => {
    const deleted: string[] = []
    server.use(
      listHandler(PIPELINES),
      http.delete(`${API}/settings/pipelines/:id`, ({ params }) => {
        deleted.push(String(params.id))
        return HttpResponse.json({ data: null })
      }),
    )

    const { result } = renderHook(() => usePipelinesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.actions.onRequestRemove('p2'))
    expect(result.current.removal?.name).toBe('Alterno')

    act(() => result.current.removal?.cancel())
    expect(result.current.removal).toBeNull()
    expect(deleted).toEqual([])

    act(() => result.current.actions.onRequestRemove('p2'))
    act(() => result.current.removal?.confirm())

    await waitFor(() => expect(deleted).toEqual(['p2']))
    expect(result.current.removal).toBeNull()
  })
})
