'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import { revalidateContacts } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ImportMapping } from '../model/types/import.types'
import type {
  AnalyzeResult,
  DuplicateStrategy,
  ImportResult,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'

type ImportContext = {
  readonly fileId: () => string
  readonly mapping: () => ImportMapping
  readonly strategy: () => DuplicateStrategy
}

type ImportHandlers = {
  readonly onAnalyzed: (analysis: AnalyzeResult) => void
  readonly onPreviewed: (preview: ValidationPreview, variables: ImportMapping) => void
  readonly onValidated: (report: ValidationReport) => void
  readonly onImported: (result: ImportResult) => void
}

export function useImportMutations(context: ImportContext, handlers: ImportHandlers) {
  const client = useQueryClient()

  const analyze = useMutation({
    mutationFn: (file: File) => contactsService.analyzeImport(file),
    onSuccess: handlers.onAnalyzed,
    onError: () => sileo.error({ title: t('contacts.import.errors.analyze') }),
  })

  const preview = useMutation({
    mutationFn: (next: ImportMapping) =>
      contactsService.previewImport({ fileId: context.fileId(), mapping: next }),
    onSuccess: handlers.onPreviewed,
  })

  const validate = useMutation({
    mutationFn: () =>
      contactsService.validateImport({ fileId: context.fileId(), mapping: context.mapping() }),
    onSuccess: handlers.onValidated,
    onError: () => sileo.error({ title: t('contacts.import.errors.validate') }),
  })

  const execute = useMutation({
    mutationFn: () =>
      contactsService.executeImport({
        fileId: context.fileId(),
        mapping: context.mapping(),
        duplicateStrategy: context.strategy(),
      }),
    onSuccess: async (data) => {
      handlers.onImported(data)
      await revalidateContacts()
      await client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onError: () => sileo.error({ title: t('contacts.import.errors.execute') }),
  })

  return {
    analyzeFile: analyze.mutateAsync,
    previewMapping: preview.mutate,
    validateImport: validate.mutate,
    executeImport: execute.mutate,
    pending: {
      analyzing: analyze.isPending,
      previewing: preview.isPending,
      validating: validate.isPending,
      importing: execute.isPending,
    },
  }
}
