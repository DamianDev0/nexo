'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'

import { EMPTY_REASSIGN_FORM } from '../config/option-form.constants'
import { buildReassignSchema, type ReassignFormValues } from '../lib/option-form.schema'

import type { ReassignCandidate } from './types'

interface UseReassignFormArgs {
  readonly candidates: ReadonlyArray<ReassignCandidate>
  readonly onConfirm: (toKey: string) => void
}

export function useReassignForm({ candidates, onConfirm }: UseReassignFormArgs) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const schema = useMemo(() => buildReassignSchema(t, terms.lowerPlural), [t, terms.lowerPlural])

  const form = useForm<ReassignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_REASSIGN_FORM,
    mode: 'onChange',
  })

  const target = form.watch('target')

  return {
    control: form.control,
    selected: candidates.find((candidate) => candidate.key === target) ?? null,
    canSubmit: form.formState.isValid,
    submit: form.handleSubmit((values) => onConfirm(values.target)),
  }
}
