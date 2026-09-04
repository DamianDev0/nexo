'use client'

import { useCallback, useMemo, useReducer, useRef } from 'react'

import { applyMapping, missingRequiredFields } from '../lib/import-mapping'
import { importInitialState, importReducer } from '../lib/import-reducer'
import { useImportMutations } from '../query/useImportMutations'

import type { ImportMapping, ImportStep } from './types/import.types'
import type { DuplicateStrategy } from '@repo/shared-types'

export function useContactImport(onFinished: () => void) {
  const [{ step, analysis, mapping, preview, report, strategy, result }, dispatch] = useReducer(
    importReducer,
    importInitialState,
  )

  const live = useRef({ fileId: '', mapping, strategy })
  live.current = { fileId: analysis?.fileId ?? '', mapping, strategy }

  const latestMapping = useRef<ImportMapping | null>(null)

  const mutations = useImportMutations(
    {
      fileId: () => live.current.fileId,
      mapping: () => live.current.mapping,
      strategy: () => live.current.strategy,
    },
    {
      onAnalyzed: (data) => dispatch({ type: 'analyzed', analysis: data }),
      onPreviewed: (data, variables) => {
        if (variables !== latestMapping.current) return
        dispatch({ type: 'previewed', preview: data })
      },
      onValidated: (data) => dispatch({ type: 'validated', report: data }),
      onImported: (data) => dispatch({ type: 'imported', result: data }),
    },
  )

  const { previewMapping, validateImport } = mutations
  const remap = useCallback(
    (column: string, field: string) => {
      const next = applyMapping(mapping, column, field)
      dispatch({ type: 'remapped', mapping: next })
      latestMapping.current = next
      previewMapping(next)
    },
    [mapping, previewMapping],
  )

  const reset = useCallback(() => dispatch({ type: 'reset' }), [])

  const missing = useMemo(
    () => (analysis ? missingRequiredFields(mapping, analysis.availableFields) : []),
    [analysis, mapping],
  )

  const goTo = useCallback(
    (next: ImportStep) => {
      if (next === 'review') {
        validateImport()
        return
      }
      dispatch({ type: 'stepChanged', step: next })
    },
    [validateImport],
  )

  const finish = useCallback(() => {
    reset()
    onFinished()
  }, [reset, onFinished])

  const mapState = useMemo(
    () => ({
      mapping,
      preview: preview ?? analysis?.validationPreview ?? null,
      missingFields: missing,
      isPreviewing: mutations.pending.previewing,
    }),
    [mapping, preview, analysis, missing, mutations.pending.previewing],
  )

  return {
    state: {
      step,
      analysis,
      mapping,
      preview,
      mapState,
      report,
      strategy,
      result,
      missingFields: missing,
      canContinueFromMap: missing.length === 0,
      isAnalyzing: mutations.pending.analyzing,
      isPreviewing: mutations.pending.previewing,
      isValidating: mutations.pending.validating,
      isImporting: mutations.pending.importing,
    },
    actions: {
      onFile: (file: File) => mutations.analyzeFile(file),
      onRemap: remap,
      onStrategy: (next: DuplicateStrategy) =>
        dispatch({ type: 'strategyChanged', strategy: next }),
      onGoTo: goTo,
      onImport: () => mutations.executeImport(),
      onRestart: reset,
      onFinish: finish,
    },
  }
}

export type ContactImport = ReturnType<typeof useContactImport>
