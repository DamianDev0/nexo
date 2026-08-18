'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback, useMemo, useState } from 'react'
import { sileo } from 'sileo'

import { revalidateContacts } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { applyMapping, missingRequiredFields } from '../lib/import-mapping'

import type { ImportMapping, ImportStep } from './types/import.types'
import type {
  AnalyzeResult,
  DuplicateStrategy,
  ImportResult,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'

export function useContactImport(onFinished: () => void) {
  const client = useQueryClient()
  const [step, setStep] = useState<ImportStep>('upload')
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null)
  const [mapping, setMapping] = useState<ImportMapping>({})
  const [preview, setPreview] = useState<ValidationPreview | null>(null)
  const [report, setReport] = useState<ValidationReport | null>(null)
  const [strategy, setStrategy] = useState<DuplicateStrategy>('skip')
  const [result, setResult] = useState<ImportResult | null>(null)

  const fileId = analysis?.fileId ?? ''

  const analyze = useMutation({
    mutationFn: (file: File) => contactsService.analyzeImport(file),
    onSuccess: (data) => {
      setAnalysis(data)
      setMapping(data.suggestedMapping)
      setPreview(data.validationPreview)
      setStep('configure')
    },
    onError: () => sileo.error({ title: t('contacts.import.errors.analyze') }),
  })

  const refreshPreview = useMutation({
    mutationFn: (next: ImportMapping) => contactsService.previewImport({ fileId, mapping: next }),
    onSuccess: setPreview,
  })

  const validate = useMutation({
    mutationFn: () => contactsService.validateImport({ fileId, mapping }),
    onSuccess: (data) => {
      setReport(data)
      setStep('review')
    },
    onError: () => sileo.error({ title: t('contacts.import.errors.validate') }),
  })

  const execute = useMutation({
    mutationFn: () =>
      contactsService.executeImport({ fileId, mapping, duplicateStrategy: strategy }),
    onSuccess: async (data) => {
      setResult(data)
      setStep('done')
      await revalidateContacts()
      await client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onError: () => sileo.error({ title: t('contacts.import.errors.execute') }),
  })

  const { mutate: previewMapping } = refreshPreview
  const remap = useCallback(
    (column: string, field: string) => {
      const next = applyMapping(mapping, column, field)
      setMapping(next)
      previewMapping(next)
    },
    [mapping, previewMapping],
  )

  const reset = useCallback(() => {
    setStep('upload')
    setAnalysis(null)
    setMapping({})
    setPreview(null)
    setReport(null)
    setResult(null)
    setStrategy('skip')
  }, [])

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
      setStep(next)
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
      onStrategy: setStrategy,
      onGoTo: goTo,
      onImport: () => execute.mutate(),
      onRestart: reset,
      onFinish: finish,
    },
  }
}

export type ContactImport = ReturnType<typeof useContactImport>
