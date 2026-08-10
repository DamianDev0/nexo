import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { delay, HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'

import type { ContactTaxonomy } from '@repo/shared-types'
import type { ReactNode } from 'react'

import { useContactTaxonomySection } from '@/features/manage-settings/model/useContactTaxonomySection'
import { QUERY_KEYS } from '@/shared/query/query-keys'

vi.mock('i18next', () => ({ t: (key: string) => key }))

const sileoError = vi.fn()
const sileoSuccess = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: (...args: unknown[]) => sileoSuccess(...args),
  },
}))

const server = createMswServer()

const TAXONOMY: ContactTaxonomy = {
  statuses: [{ key: 'new', label: 'Nuevo', color: '#3B82F6', order: 1, isSystem: true }],
  sources: [{ key: 'manual', label: 'Manual', color: '#22C55E', order: 1, isSystem: true }],
}

function getHandler(data: ContactTaxonomy) {
  return http.get(`${API}/settings/contact-taxonomy`, () => HttpResponse.json({ data }))
}

function patchHandler(onPatch?: (body: ContactTaxonomy) => void) {
  return http.patch(`${API}/settings/contact-taxonomy`, async ({ request }) => {
    const body = (await request.json()) as ContactTaxonomy
    onPatch?.(body)
    return HttpResponse.json({ data: body })
  })
}

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, Wrapper }
}

beforeEach(() => {
  sileoError.mockClear()
  sileoSuccess.mockClear()
})

describe('useContactTaxonomySection', () => {
  it('loads the taxonomy from the server and reports isDirty false', async () => {
    server.use(getHandler(TAXONOMY), patchHandler())
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.taxonomy).toEqual(TAXONOMY)
    expect(result.current.isDirty).toBe(false)
  })

  it('ignores an edit attempted before the taxonomy has loaded', async () => {
    server.use(getHandler(TAXONOMY), patchHandler())
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })

    act(() => result.current.handleAdd('statuses', 'Nuevo estado'))

    expect(result.current.taxonomy).toBeNull()
    expect(result.current.isDirty).toBe(false)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('handleAdd stages a new option in the draft and marks it dirty', async () => {
    server.use(getHandler(TAXONOMY), patchHandler())
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleAdd('statuses', 'Contactado'))

    expect(result.current.taxonomy?.statuses).toHaveLength(2)
    expect(result.current.taxonomy?.statuses[1]?.label).toBe('Contactado')
    expect(result.current.taxonomy?.sources).toEqual(TAXONOMY.sources)
    expect(result.current.isDirty).toBe(true)
  })

  it('handlePatch edits an option in place', async () => {
    server.use(getHandler(TAXONOMY), patchHandler())
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handlePatch('statuses', 'new', { label: 'Nuevo!' }))

    expect(result.current.taxonomy?.statuses[0]?.label).toBe('Nuevo!')
  })

  it('handleRemove drops a non-system option', async () => {
    const seeded: ContactTaxonomy = {
      statuses: TAXONOMY.statuses,
      sources: [
        ...TAXONOMY.sources,
        { key: 'ads', label: 'Ads', color: '#F97316', order: 2, isSystem: false },
      ],
    }
    server.use(getHandler(seeded), patchHandler())
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.taxonomy?.sources).toHaveLength(2))

    act(() => result.current.handleRemove('sources', 'ads'))

    expect(result.current.taxonomy?.sources.map((option) => option.key)).toEqual(['manual'])
  })

  it('handleReorder moves an option within its kind', async () => {
    const seeded: ContactTaxonomy = {
      statuses: [
        { key: 'a', label: 'A', color: '#3B82F6', order: 1, isSystem: false },
        { key: 'b', label: 'B', color: '#22C55E', order: 2, isSystem: false },
      ],
      sources: TAXONOMY.sources,
    }
    server.use(getHandler(seeded), patchHandler())
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.taxonomy?.statuses).toHaveLength(2))

    act(() => result.current.handleReorder('statuses', 'b', 'a'))

    expect(result.current.taxonomy?.statuses.map((option) => option.key)).toEqual(['b', 'a'])
  })

  it('handleReset discards the draft', async () => {
    server.use(getHandler(TAXONOMY), patchHandler())
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleAdd('statuses', 'Contactado'))
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.handleReset())

    expect(result.current.isDirty).toBe(false)
    expect(result.current.taxonomy).toEqual(TAXONOMY)
  })

  it('handleSave does nothing without a dirty draft', async () => {
    let patched = false
    server.use(
      getHandler(TAXONOMY),
      patchHandler(() => {
        patched = true
      }),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleSave())

    expect(patched).toBe(false)
  })

  it('handleSave persists the draft, updates the cache, clears the draft and calls onSaved', async () => {
    let patchedBody: ContactTaxonomy | null = null
    server.use(
      getHandler(TAXONOMY),
      patchHandler((body) => {
        patchedBody = body
      }),
    )
    const { client, Wrapper } = makeWrapper()
    const onSaved = vi.fn()
    const { result } = renderHook(() => useContactTaxonomySection(onSaved), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleAdd('statuses', 'Contactado'))
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.handleSave())

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(patchedBody?.statuses).toHaveLength(2)
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(result.current.isDirty).toBe(false)
    expect(client.getQueryData(QUERY_KEYS.settings.contactTaxonomy)).toEqual(patchedBody)
  })

  it('shows a toast with the server error message when saving fails', async () => {
    server.use(
      getHandler(TAXONOMY),
      http.patch(`${API}/settings/contact-taxonomy`, () =>
        HttpResponse.json(
          {
            statusCode: 500,
            message: 'boom',
            error: 'Internal Server Error',
            timestamp: '',
            path: '/settings/contact-taxonomy',
            method: 'PATCH',
          },
          { status: 500 },
        ),
      ),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleAdd('statuses', 'Contactado'))
    act(() => result.current.handleSave())

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(sileoError).toHaveBeenCalledWith({ title: 'common.saveFailed', description: 'boom' })
    expect(result.current.isDirty).toBe(true)
  })

  it('handleSave is a no-op while a save is already pending', async () => {
    let patchCount = 0
    server.use(
      getHandler(TAXONOMY),
      http.patch(`${API}/settings/contact-taxonomy`, async ({ request }) => {
        patchCount += 1
        const body = await request.json()
        await delay(50)
        return HttpResponse.json({ data: body })
      }),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(vi.fn()), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleAdd('statuses', 'Contactado'))
    act(() => result.current.handleSave())
    await waitFor(() => expect(result.current.isPending).toBe(true))
    act(() => result.current.handleSave())

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(patchCount).toBe(1)
  })
})
