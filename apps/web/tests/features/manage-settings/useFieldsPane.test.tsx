import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { FieldDef } from '@repo/shared-types'

import { useFieldsPane } from '@/features/manage-settings/model/useFieldsPane'

vi.mock('i18next', () => ({ t: (key: string) => key }))

vi.mock('sileo', () => ({ sileo: { error: vi.fn(), success: vi.fn() } }))

const server = createMswServer()

const FIELDS: FieldDef[] = [
  {
    key: 'metros_cuadrados',
    label: 'Metros cuadrados',
    type: 'number',
    required: false,
    unique: false,
    order: 1,
    isActive: true,
  },
  {
    key: 'archivado',
    label: 'Archivado',
    type: 'text',
    required: false,
    unique: false,
    order: 2,
    isActive: false,
  },
]

function listHandler(data: FieldDef[]) {
  return http.get(`${API}/settings/custom-fields/:entity`, () => HttpResponse.json({ data }))
}

describe('useFieldsPane', () => {
  it('exposes only active fields for the selected entity', async () => {
    server.use(listHandler(FIELDS))

    const { result } = renderHook(() => useFieldsPane(), { wrapper })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.entity).toBe('contacts')
    expect(result.current.fields.map((field) => field.key)).toEqual(['metros_cuadrados'])
  })

  it('creates a field from the submitted label and type, closing the editor', async () => {
    let created: FieldDef | null = null
    server.use(
      listHandler([]),
      http.post(`${API}/settings/custom-fields/contacts`, async ({ request }) => {
        created = (await request.json()) as FieldDef
        return HttpResponse.json({ data: created })
      }),
    )

    const { result } = renderHook(() => useFieldsPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.editor.setOpen(true))
    act(() => result.current.onSubmit({ label: 'Tipo de techo', type: 'select' }))

    await waitFor(() => expect(created).not.toBeNull())
    expect(created!.key).toBe('tipo_de_techo')
    expect(created!.type).toBe('select')
    expect(result.current.editor.open).toBe(false)
  })

  it('archives a field through the settings API', async () => {
    let archivedKey: string | null = null
    server.use(
      listHandler(FIELDS),
      http.delete(`${API}/settings/custom-fields/contacts/:key`, ({ params }) => {
        archivedKey = params.key as string
        return HttpResponse.json({ data: null })
      }),
    )

    const { result } = renderHook(() => useFieldsPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.onArchive('metros_cuadrados'))

    await waitFor(() => expect(archivedKey).toBe('metros_cuadrados'))
  })
})
