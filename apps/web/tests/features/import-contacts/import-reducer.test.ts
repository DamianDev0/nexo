import { describe, expect, it } from 'vitest'

import type { AnalyzeResult, ImportResult, ValidationReport } from '@repo/shared-types'

import {
  importInitialState,
  importReducer,
  type ImportState,
} from '@/features/import-contacts/lib/import-reducer'

const ANALYSIS = {
  fileId: 'file-1',
  suggestedMapping: { Nombre: 'firstName' },
  validationPreview: { totals: { ready: 2, errors: 0 }, rows: [] },
} as unknown as AnalyzeResult

describe('importReducer', () => {
  it('moves to configure with mapping and preview from the analysis', () => {
    const state = importReducer(importInitialState, { type: 'analyzed', analysis: ANALYSIS })

    expect(state.step).toBe('configure')
    expect(state.analysis).toBe(ANALYSIS)
    expect(state.mapping).toBe(ANALYSIS.suggestedMapping)
    expect(state.preview).toBe(ANALYSIS.validationPreview)
  })

  it('moves to review when validated', () => {
    const report = { totals: { ready: 1 } } as unknown as ValidationReport
    const state = importReducer(importInitialState, { type: 'validated', report })

    expect(state.step).toBe('review')
    expect(state.report).toBe(report)
  })

  it('moves to done when imported', () => {
    const result = { created: 3 } as unknown as ImportResult
    const state = importReducer(importInitialState, { type: 'imported', result })

    expect(state.step).toBe('done')
    expect(state.result).toBe(result)
  })

  it('updates mapping, strategy and step independently', () => {
    let state: ImportState = importInitialState
    state = importReducer(state, { type: 'remapped', mapping: { Correo: 'email' } })
    state = importReducer(state, { type: 'strategyChanged', strategy: 'update' })
    state = importReducer(state, { type: 'stepChanged', step: 'configure' })

    expect(state.mapping).toEqual({ Correo: 'email' })
    expect(state.strategy).toBe('update')
    expect(state.step).toBe('configure')
  })

  it('returns the initial state on reset', () => {
    const dirty = importReducer(importInitialState, { type: 'analyzed', analysis: ANALYSIS })

    expect(importReducer(dirty, { type: 'reset' })).toBe(importInitialState)
  })
})
