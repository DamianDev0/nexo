import type { ImportMapping, ImportStep } from '../model/types/import.types'
import type {
  AnalyzeResult,
  DuplicateStrategy,
  ImportResult,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'

export type ImportState = {
  readonly step: ImportStep
  readonly analysis: AnalyzeResult | null
  readonly mapping: ImportMapping
  readonly preview: ValidationPreview | null
  readonly report: ValidationReport | null
  readonly strategy: DuplicateStrategy
  readonly result: ImportResult | null
}

export type ImportAction =
  | { readonly type: 'analyzed'; readonly analysis: AnalyzeResult }
  | { readonly type: 'remapped'; readonly mapping: ImportMapping }
  | { readonly type: 'previewed'; readonly preview: ValidationPreview }
  | { readonly type: 'validated'; readonly report: ValidationReport }
  | { readonly type: 'strategyChanged'; readonly strategy: DuplicateStrategy }
  | { readonly type: 'imported'; readonly result: ImportResult }
  | { readonly type: 'stepChanged'; readonly step: ImportStep }
  | { readonly type: 'reset' }

export const importInitialState: ImportState = {
  step: 'upload',
  analysis: null,
  mapping: {},
  preview: null,
  report: null,
  strategy: 'skip',
  result: null,
}

export function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case 'analyzed':
      return {
        ...state,
        step: 'configure',
        analysis: action.analysis,
        mapping: action.analysis.suggestedMapping,
        preview: action.analysis.validationPreview,
      }
    case 'remapped':
      return { ...state, mapping: action.mapping }
    case 'previewed':
      return { ...state, preview: action.preview }
    case 'validated':
      return { ...state, step: 'review', report: action.report }
    case 'strategyChanged':
      return { ...state, strategy: action.strategy }
    case 'imported':
      return { ...state, step: 'done', result: action.result }
    case 'stepChanged':
      return { ...state, step: action.step }
    case 'reset':
      return importInitialState
  }
}
