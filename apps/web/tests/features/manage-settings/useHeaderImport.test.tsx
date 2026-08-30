import { act, renderHook, waitFor } from '@testing-library/react'
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
  })

  it('does nothing on confirm when every row is excluded', async () => {
    const { result } = await analyzed()

    act(() => result.current.onUpdateRow('Presupuesto', { include: false }))
    act(() => result.current.confirm())

    expect(replaceCustomFields).not.toHaveBeenCalled()
    expect(result.current.open).toBe(true)
  })
})
