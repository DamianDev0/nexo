import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { AnalyzeResult, ImportResult, ValidationPreview } from '@repo/shared-types'

import { useContactImport } from '@/features/import-contacts/model/useContactImport'

const ANALYSIS: AnalyzeResult = {
  fileId: 'file-1',
  fileName: 'contactos.csv',
  totalRows: 3,
  columns: ['Nombre', 'Correo'],
  sampleRows: [{ Nombre: 'Ana', Correo: 'ana@empresa.co' }],
  suggestedMapping: { Nombre: 'firstName', Correo: 'email' },
  availableFields: [
    { field: 'firstName', label: 'First name', required: true, aliases: [] },
    { field: 'email', label: 'Email', required: false, aliases: [] },
  ],
  columnAnalysis: [
    { csvColumn: 'Nombre', suggestedField: 'firstName', sampleValues: ['Ana'], fillRate: 1 },
    { csvColumn: 'Correo', suggestedField: 'email', sampleValues: ['ana@empresa.co'], fillRate: 1 },
  ],
  validationPreview: { totalSampleRows: 1, validRows: 1, invalidRows: 0, rows: [] },
  unmappedColumns: [],
  missingRequiredFields: [],
}

const REMAPPED_PREVIEW: ValidationPreview = {
  totalSampleRows: 1,
  validRows: 0,
  invalidRows: 1,
  rows: [],
}

const RESULT: ImportResult = { imported: 2, updated: 0, skipped: 1, errors: [] }

const analyzeImport = vi.fn()
const previewImport = vi.fn()
const executeImport = vi.fn()
const validateImport = vi.fn()

vi.mock('@/shared/api/services/contacts.service', () => ({
  default: {
    analyzeImport: (file: File) => analyzeImport(file),
    previewImport: (data: unknown) => previewImport(data),
    validateImport: (data: unknown) => validateImport(data),
    executeImport: (data: unknown) => executeImport(data),
  },
}))

const REPORT = {
  totalRows: 3,
  readyRows: 2,
  warningRows: 0,
  errorRows: 1,
  issues: [],
  truncatedIssues: false,
}

beforeEach(() => {
  analyzeImport.mockResolvedValue(ANALYSIS)
  previewImport.mockResolvedValue(REMAPPED_PREVIEW)
  validateImport.mockResolvedValue(REPORT)
  executeImport.mockResolvedValue(RESULT)
})

function csv(): File {
  return new File(['Nombre,Correo\nAna,ana@empresa.co'], 'contactos.csv', { type: 'text/csv' })
}

async function analyzed(onFinished = vi.fn()) {
  const view = renderHook(() => useContactImport(onFinished), { wrapper })

  await act(async () => {
    await view.result.current.actions.onFile(csv())
  })
  await waitFor(() => expect(view.result.current.state.step).toBe('configure'))

  return { ...view, onFinished }
}

describe('useContactImport', () => {
  it('starts on the upload step with nothing loaded', () => {
    const { result } = renderHook(() => useContactImport(vi.fn()), { wrapper })

    expect(result.current.state.step).toBe('upload')
    expect(result.current.state.analysis).toBeNull()
  })

  it('moves to the configure step and seeds the suggested mapping', async () => {
    const { result } = await analyzed()

    expect(result.current.state.analysis?.fileName).toBe('contactos.csv')
    expect(result.current.state.mapping).toEqual({ Nombre: 'firstName', Correo: 'email' })
    expect(result.current.state.preview).toEqual(ANALYSIS.validationPreview)
  })

  it('validates the whole file before showing the review step', async () => {
    const { result } = await analyzed()

    act(() => result.current.actions.onGoTo('review'))

    await waitFor(() => expect(result.current.state.step).toBe('review'))
    expect(result.current.state.report?.readyRows).toBe(2)
  })

  it('refreshes the preview from the server when the user remaps a column', async () => {
    const { result } = await analyzed()

    act(() => result.current.actions.onRemap('Correo', 'firstName'))

    await waitFor(() => expect(result.current.state.preview).toEqual(REMAPPED_PREVIEW))
    expect(result.current.state.mapping).toEqual({ Nombre: null, Correo: 'firstName' })
  })

  it('keeps the chosen duplicate strategy', async () => {
    const { result } = await analyzed()

    act(() => result.current.actions.onStrategy('update'))

    expect(result.current.state.strategy).toBe('update')
  })

  it('reports the counts the server returned once the import runs', async () => {
    const { result } = await analyzed()

    act(() => result.current.actions.onImport())

    await waitFor(() => expect(result.current.state.step).toBe('done'))
    expect(result.current.state.result).toEqual(RESULT)
    expect(executeImport).toHaveBeenCalledWith({
      fileId: 'file-1',
      mapping: ANALYSIS.suggestedMapping,
      duplicateStrategy: 'skip',
    })
  })

  it('clears everything when the user picks another file', async () => {
    const { result } = await analyzed()

    act(() => result.current.actions.onRestart())

    expect(result.current.state.step).toBe('upload')
    expect(result.current.state.analysis).toBeNull()
    expect(result.current.state.mapping).toEqual({})
  })

  it('closes the wizard and resets after finishing', async () => {
    const { result, onFinished } = await analyzed()

    act(() => result.current.actions.onFinish())

    expect(onFinished).toHaveBeenCalled()
    expect(result.current.state.step).toBe('upload')
  })

  it('stays on upload when the file cannot be read', async () => {
    analyzeImport.mockRejectedValue(new Error('bad file'))
    const { result } = renderHook(() => useContactImport(vi.fn()), { wrapper })

    await act(async () => {
      await result.current.actions.onFile(csv()).catch(() => undefined)
    })

    expect(result.current.state.step).toBe('upload')
  })
})
