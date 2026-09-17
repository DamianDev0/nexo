'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import { useObjectDescriptor } from '@/entities/object-descriptor'

import type { ImportMapping } from '../model/types/import.types'
import type { ObjectImportConfig } from '@/entities/object-descriptor'
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

function requireImports(imports: ObjectImportConfig | null): ObjectImportConfig {
  if (!imports) throw new Error('This record type has no import configuration')
  return imports
}

export function useImportMutations(context: ImportContext, handlers: ImportHandlers) {
  const client = useQueryClient()
  const descriptor = useObjectDescriptor()
  const imports = descriptor.imports

  const analyze = useMutation({
    mutationFn: (file: File) => requireImports(imports).analyze(file),
    onSuccess: handlers.onAnalyzed,
    onError: () => sileo.error({ title: t('imports.errors.analyze') }),
  })

  const preview = useMutation({
    mutationFn: (next: ImportMapping) =>
      requireImports(imports).preview({ fileId: context.fileId(), mapping: next }),
    onSuccess: handlers.onPreviewed,
  })

  const validate = useMutation({
    mutationFn: () =>
      requireImports(imports).validate({ fileId: context.fileId(), mapping: context.mapping() }),
    onSuccess: handlers.onValidated,
    onError: () => sileo.error({ title: t('imports.errors.validate') }),
  })

  const execute = useMutation({
    mutationFn: () =>
      requireImports(imports).execute({
        fileId: context.fileId(),
        mapping: context.mapping(),
        duplicateStrategy: context.strategy(),
      }),
    onSuccess: async (data) => {
      handlers.onImported(data)
      await descriptor.revalidate()
      await descriptor.invalidateRecords(client)
    },
    onError: () => sileo.error({ title: t('imports.errors.execute') }),
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
