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

    act(() => result.current.editor.openCreate())
    act(() =>
      result.current.onSubmit({
        label: 'Tipo de techo',
        type: 'select',
        required: true,
        showInForm: true,
        optionLabels: ['Teja', 'Zinc'],
      }),
    )

    await waitFor(() => expect(created).not.toBeNull())
    expect(created!.key).toBe('tipo_de_techo')
    expect(created!.type).toBe('select')
    expect(created!.required).toBe(true)
    expect(created!.options?.map((option) => option.label)).toEqual(['Teja', 'Zinc'])
    expect(result.current.editor.open).toBe(false)
  })

  it('patches the edited field instead of creating a new one', async () => {
    let patchedKey: string | null = null
    let patchBody: Partial<FieldDef> | null = null
    server.use(
      listHandler(FIELDS),
      http.patch(`${API}/settings/custom-fields/contacts/:key`, async ({ params, request }) => {
        patchedKey = params.key as string
        patchBody = (await request.json()) as Partial<FieldDef>
        return HttpResponse.json({ data: patchBody })
      }),
    )

    const { result } = renderHook(() => useFieldsPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.onEdit('metros_cuadrados'))
    expect(result.current.editor.initial?.label).toBe('Metros cuadrados')

    act(() =>
      result.current.onSubmit({
        label: 'Área construida',
        type: 'number',
        required: true,
        showInForm: true,
        optionLabels: [],
      }),
    )

    await waitFor(() => expect(patchedKey).toBe('metros_cuadrados'))
    expect(patchBody).toEqual({ label: 'Área construida', required: true, showInForm: true })
    expect(result.current.editor.open).toBe(false)
  })

  it('persists a reorder through the replace endpoint', async () => {
    let replaced: FieldDef[] | null = null
    const twoFields: FieldDef[] = [
      { ...FIELDS[0]! },
      { ...FIELDS[0]!, key: 'presupuesto', label: 'Presupuesto', order: 2 },
    ]
    server.use(
      listHandler(twoFields),
      http.patch(`${API}/settings/custom-fields/contacts`, async ({ request }) => {
        ;({ fields: replaced } = (await request.json()) as { fields: FieldDef[] })
        return HttpResponse.json({ data: null })
      }),
    )

    const { result } = renderHook(() => useFieldsPane(), { wrapper })
    await waitFor(() => expect(result.current.fields).toHaveLength(2))

    act(() => result.current.onReorder('presupuesto', 'metros_cuadrados'))

    await waitFor(() => expect(replaced).not.toBeNull())
    const orders = Object.fromEntries(replaced!.map((field) => [field.key, field.order]))
    expect(orders).toEqual({ presupuesto: 1, metros_cuadrados: 2 })
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
