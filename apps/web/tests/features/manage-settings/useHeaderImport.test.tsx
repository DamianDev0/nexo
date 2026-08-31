import { act, renderHook, waitFor } from '@testing-library/react'
import { sileo } from 'sileo'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { CustomFieldHeaderAnalysis, FieldDef } from '@repo/shared-types'

import { useHeaderImport } from '@/features/manage-settings/model/useHeaderImport'

vi.mock('i18next', () => ({ t: (key: string) => key }))

vi.mock('sileo', () => ({ sileo: { error: vi.fn(), success: vi.fn() } }))

const { getCustomFields, replaceCustomFields, analyzeCustomFieldHeaders } = vi.hoisted(() => ({
  getCustomFields: vi.fn(),
  replaceCustomFields: vi.fn(),
  analyzeCustomFieldHeaders: vi.fn(),
}))

vi.mock('@/shared/api/services/settings.service', () => ({
  default: { getCustomFields, replaceCustomFields, analyzeCustomFieldHeaders },
}))

const EXISTING: FieldDef[] = [
  {
    key: 'ciudad',
    label: 'Ciudad',
    type: 'text',
    required: false,
    unique: false,
    order: 1,
    isActive: true,
  },
]

const ANALYSIS: CustomFieldHeaderAnalysis = {
  entity: 'contacts',
  totalRows: 40,
  suggestions: [
    {
      column: 'Presupuesto',
      sampleValues: ['100', '200'],
      fillRate: 0.9,
      suggestedKey: 'presupuesto',
      suggestedLabel: 'Presupuesto',
      suggestedType: 'number',
      existingFieldKey: null,
    },
    {
      column: 'Ciudad',
      sampleValues: ['Bogotá'],
      fillRate: 1,
      suggestedKey: 'ciudad',
      suggestedLabel: 'Ciudad',
      suggestedType: 'text',
      existingFieldKey: 'ciudad',
    },
  ],
}

const CSV_FILE = new File(['Presupuesto,Ciudad\n100,Bogotá'], 'datos.csv', { type: 'text/csv' })

beforeEach(() => {
  vi.clearAllMocks()
  getCustomFields.mockResolvedValue(EXISTING)
  replaceCustomFields.mockResolvedValue(undefined)
  analyzeCustomFieldHeaders.mockResolvedValue(ANALYSIS)
})

async function analyzed() {
  const rendered = renderHook(() => useHeaderImport('contacts'), { wrapper })
  await waitFor(() => expect(rendered.result.current.fieldsPending).toBe(false))

  act(() => rendered.result.current.openImport())
  await act(async () => rendered.result.current.upload(CSV_FILE))
  return rendered
}

describe('useHeaderImport', () => {
  it('starts closed, in upload step, with no rows', () => {
    const rendered = renderHook(() => useHeaderImport('contacts'), { wrapper })

    expect(rendered.result.current.open).toBe(false)
    expect(rendered.result.current.step).toBe('upload')
    expect(rendered.result.current.rows).toHaveLength(0)
  })

  it('reopening the import resets the previous analysis', async () => {
    const { result } = await analyzed()

    act(() => result.current.onOpenChange(false))
    act(() => result.current.openImport())

    expect(result.current.open).toBe(true)
    expect(result.current.step).toBe('upload')
    expect(result.current.rows).toHaveLength(0)
  })

  it('keeps the analysis when the dialog reports itself open', async () => {
    const { result } = await analyzed()

    act(() => result.current.onOpenChange(true))

    expect(result.current.step).toBe('review')
    expect(result.current.rows).toHaveLength(2)
  })

  it('does not commit while the field list is still loading', async () => {
    getCustomFields.mockReturnValue(new Promise(() => {}))
    const rendered = renderHook(() => useHeaderImport('contacts'), { wrapper })

    act(() => rendered.result.current.openImport())
    await act(async () => rendered.result.current.upload(CSV_FILE))
    act(() => rendered.result.current.confirm())

    expect(replaceCustomFields).not.toHaveBeenCalled()
  })

  it('moves to review with rows after analyzing a file', async () => {
    const { result } = await analyzed()

    expect(analyzeCustomFieldHeaders).toHaveBeenCalledWith('contacts', CSV_FILE)
    expect(result.current.step).toBe('review')
    expect(result.current.totalRows).toBe(40)
    expect(result.current.rows.map((row) => row.include)).toEqual([true, false])
  })

  it('commits included rows in one replace call and closes the dialog', async () => {
    const { result } = await analyzed()

    act(() => result.current.onUpdateRow('Presupuesto', { label: 'Presupuesto anual' }))
    act(() => result.current.confirm())

    await waitFor(() => expect(replaceCustomFields).toHaveBeenCalledTimes(1))
    const [entity, fields] = replaceCustomFields.mock.calls[0] as [string, FieldDef[]]
    expect(entity).toBe('contacts')
    expect(fields.map((field) => field.key)).toEqual(['ciudad', 'presupuesto'])
    expect(fields[1]?.label).toBe('Presupuesto anual')
    expect(fields[1]?.order).toBe(2)
    expect(result.current.open).toBe(false)
    expect(sileo.success).toHaveBeenCalledWith({ title: 'settings.fields.import.done' })
  })

  it('does nothing on confirm when every row is excluded', async () => {
    const { result } = await analyzed()

    act(() => result.current.onUpdateRow('Presupuesto', { include: false }))
    act(() => result.current.confirm())

    expect(replaceCustomFields).not.toHaveBeenCalled()
    expect(result.current.open).toBe(true)
  })

  it('discards a slow first analysis that resolves after a newer upload', async () => {
    let resolveFirst: (analysis: CustomFieldHeaderAnalysis) => void = () => {}
    analyzeCustomFieldHeaders
      .mockImplementationOnce(
        () =>
          new Promise<CustomFieldHeaderAnalysis>((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockResolvedValueOnce(ANALYSIS)

    const rendered = renderHook(() => useHeaderImport('contacts'), { wrapper })
    await waitFor(() => expect(rendered.result.current.fieldsPending).toBe(false))
    act(() => rendered.result.current.openImport())

    let firstUpload: Promise<void> = Promise.resolve()
    act(() => {
      firstUpload = rendered.result.current.upload(CSV_FILE)
    })
    await act(async () => rendered.result.current.upload(CSV_FILE))
    expect(rendered.result.current.totalRows).toBe(40)

    await act(async () => {
      resolveFirst({ ...ANALYSIS, totalRows: 999, suggestions: [] })
      await firstUpload
    })

    expect(rendered.result.current.totalRows).toBe(40)
    expect(rendered.result.current.rows).toHaveLength(2)
  })

  it('ignores an analysis that resolves after the dialog was closed', async () => {
    let resolveLate: (analysis: CustomFieldHeaderAnalysis) => void = () => {}
    analyzeCustomFieldHeaders.mockImplementationOnce(
      () =>
        new Promise<CustomFieldHeaderAnalysis>((resolve) => {
          resolveLate = resolve
        }),
    )

    const rendered = renderHook(() => useHeaderImport('contacts'), { wrapper })
    await waitFor(() => expect(rendered.result.current.fieldsPending).toBe(false))
    act(() => rendered.result.current.openImport())

    let lateUpload: Promise<void> = Promise.resolve()
    act(() => {
      lateUpload = rendered.result.current.upload(CSV_FILE)
    })
    await waitFor(() => expect(analyzeCustomFieldHeaders).toHaveBeenCalledTimes(1))
    act(() => rendered.result.current.onOpenChange(false))

    resolveLate(ANALYSIS)
    await act(async () => {
      await lateUpload
    })

    expect(rendered.result.current.step).toBe('upload')
    expect(rendered.result.current.rows).toHaveLength(0)
  })
})
