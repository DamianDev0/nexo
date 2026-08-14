import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'

import type { ContactTaxonomy } from '@repo/shared-types'
import type { ReactNode } from 'react'

import { useContactTaxonomySection } from '@/features/manage-settings/model/useContactTaxonomySection'

vi.mock('i18next', () => ({ t: (key: string) => key }))

const sileoError = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: vi.fn(),
  },
}))

const server = createMswServer()

const TAXONOMY: ContactTaxonomy = {
  statuses: [
    {
      key: 'new',
      label: 'Nuevo',
      description: null,
      color: '#3B82F6',
      order: 1,
      isSystem: true,
      enabled: true,
    },
  ],
  sources: [
    {
      key: 'manual',
      label: 'Manual',
      description: null,
      color: '#22C55E',
      order: 1,
      isSystem: true,
      enabled: true,
    },
  ],
  types: [
    {
      key: 'customer',
      label: 'Cliente',
      description: null,
      color: '#8B5CF6',
      order: 1,
      isSystem: true,
      enabled: true,
    },
  ],
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
})

describe('useContactTaxonomySection', () => {
  it('loads the taxonomy from the server', async () => {
    server.use(getHandler(TAXONOMY))
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useContactTaxonomySection(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.taxonomy).toEqual(TAXONOMY)
  })

  it('applies edits optimistically and autosaves after the debounce', async () => {
    server.use(getHandler(TAXONOMY))
    let saved: ContactTaxonomy | null = null
    server.use(patchHandler((body) => (saved = body)))
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useContactTaxonomySection(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handlePatch('statuses', 'new', { enabled: false }))

    expect(result.current.taxonomy?.statuses[0]?.enabled).toBe(false)
    expect(saved).toBeNull()

    await waitFor(() => expect(saved).not.toBeNull(), { timeout: 2000 })
    expect(saved!.statuses[0]?.enabled).toBe(false)
  })

  it('coalesces rapid edits into a single save with the latest state', async () => {
    server.use(getHandler(TAXONOMY))
    const bodies: ContactTaxonomy[] = []
    server.use(patchHandler((body) => bodies.push(body)))
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useContactTaxonomySection(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handlePatch('statuses', 'new', { label: 'N' }))
    act(() => result.current.handlePatch('statuses', 'new', { label: 'Nu' }))
    act(() => result.current.handlePatch('statuses', 'new', { label: 'Nue' }))

    await waitFor(() => expect(bodies.length).toBeGreaterThan(0), { timeout: 2000 })
    expect(bodies).toHaveLength(1)
    expect(bodies[0]?.statuses[0]?.label).toBe('Nue')
  })

  it('autosaves adds, removes and reorders', async () => {
    server.use(getHandler(TAXONOMY))
    let saved: ContactTaxonomy | null = null
    server.use(patchHandler((body) => (saved = body)))
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useContactTaxonomySection(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleAdd('statuses', 'Dormido', 'Sin contacto'))

    await waitFor(() => expect(saved).not.toBeNull(), { timeout: 2000 })
    expect(saved!.statuses.map((option) => option.key)).toEqual(['new', 'dormido'])
    expect(saved!.statuses[1]?.description).toBe('Sin contacto')
  })

  it('rolls back to server truth and toasts on save failure', async () => {
    server.use(getHandler(TAXONOMY))
    server.use(
      http.patch(`${API}/settings/contact-taxonomy`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    )
    const { Wrapper } = makeWrapper()

    const { result } = renderHook(() => useContactTaxonomySection(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handlePatch('statuses', 'new', { enabled: false }))
    expect(result.current.taxonomy?.statuses[0]?.enabled).toBe(false)

    await waitFor(() => expect(sileoError).toHaveBeenCalled(), { timeout: 2000 })
    await waitFor(() => expect(result.current.taxonomy?.statuses[0]?.enabled).toBe(true))
  })

  it('ignores a slow save whose response lands after a newer one', async () => {
    const releases: Array<() => void> = []
    let seen = 0
    let firstDelivered = false
    server.use(
      getHandler(TAXONOMY),
      http.patch(`${API}/settings/contact-taxonomy`, async ({ request }) => {
        const body = (await request.json()) as ContactTaxonomy
        seen += 1
        if (seen === 1) {
          await new Promise<void>((resolve) => releases.push(resolve))
          firstDelivered = true
        }
        return HttpResponse.json({ data: body })
      }),
    )
    const { client, Wrapper } = makeWrapper()
    const { result } = renderHook(() => useContactTaxonomySection(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.taxonomy).not.toBeNull())

    act(() => result.current.handlePatch('statuses', 'new', { label: 'Primero' }))
    await waitFor(() => expect(releases).toHaveLength(1))

    act(() => result.current.handlePatch('statuses', 'new', { label: 'Segundo' }))
    await waitFor(() => {
      const cached = client.getQueryData<ContactTaxonomy>(['settings', 'contact-taxonomy'])
      expect(cached?.statuses[0]?.label).toBe('Segundo')
    })

    act(() => releases[0]?.())
    await waitFor(() => expect(firstDelivered).toBe(true))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30))
    })

    const cached = client.getQueryData<ContactTaxonomy>(['settings', 'contact-taxonomy'])
    expect(cached?.statuses[0]?.label).toBe('Segundo')
    expect(result.current.taxonomy?.statuses[0]?.label).toBe('Segundo')
  })
})
