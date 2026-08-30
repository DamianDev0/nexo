'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback, useMemo, useReducer, useRef } from 'react'
import { sileo } from 'sileo'

import { revalidateContacts } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { applyMapping, missingRequiredFields } from '../lib/import-mapping'
import { importInitialState, importReducer } from '../lib/import-reducer'

import type { ImportMapping, ImportStep } from './types/import.types'
import type { DuplicateStrategy } from '@repo/shared-types'

export function useContactImport(onFinished: () => void) {
  const client = useQueryClient()
  const [{ step, analysis, mapping, preview, report, strategy, result }, dispatch] = useReducer(
    importReducer,
    importInitialState,
  )

  const fileId = analysis?.fileId ?? ''

  const analyze = useMutation({
    mutationFn: (file: File) => contactsService.analyzeImport(file),
    onSuccess: (data) => dispatch({ type: 'analyzed', analysis: data }),
    onError: () => sileo.error({ title: t('contacts.import.errors.analyze') }),
  })

  const latestMapping = useRef<ImportMapping | null>(null)
  const refreshPreview = useMutation({
    mutationFn: (next: ImportMapping) => contactsService.previewImport({ fileId, mapping: next }),
    onSuccess: (data, variables) => {
      if (variables !== latestMapping.current) return
      dispatch({ type: 'previewed', preview: data })
    },
  })

  const validate = useMutation({
    mutationFn: () => contactsService.validateImport({ fileId, mapping }),
    onSuccess: (data) => dispatch({ type: 'validated', report: data }),
    onError: () => sileo.error({ title: t('contacts.import.errors.validate') }),
  })

  const execute = useMutation({
    mutationFn: () =>
      contactsService.executeImport({ fileId, mapping, duplicateStrategy: strategy }),
    onSuccess: async (data) => {
      dispatch({ type: 'imported', result: data })
      await revalidateContacts()
      await client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onError: () => sileo.error({ title: t('contacts.import.errors.execute') }),
  })

  const { mutate: previewMapping } = refreshPreview
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
        validate.mutate()
        return
      }
      dispatch({ type: 'stepChanged', step: next })
    },
    [validate],
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
      isPreviewing: refreshPreview.isPending,
    }),
    [mapping, preview, analysis, missing, refreshPreview.isPending],
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
      isAnalyzing: analyze.isPending,
      isPreviewing: refreshPreview.isPending,
      isValidating: validate.isPending,
      isImporting: execute.isPending,
    },
    actions: {
      onFile: (file: File) => analyze.mutateAsync(file),
      onRemap: remap,
      onStrategy: (next: DuplicateStrategy) =>
        dispatch({ type: 'strategyChanged', strategy: next }),
      onGoTo: goTo,
      onImport: () => execute.mutate(),
      onRestart: reset,
      onFinish: finish,
    },
  }
}

export type ContactImport = ReturnType<typeof useContactImport>
