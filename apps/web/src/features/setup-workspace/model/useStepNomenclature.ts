import { useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { useFormFields } from '@/shared/lib/hooks/useFormFields'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { saveNomenclatureAction } from '../api/setup-steps.actions'
import { NOMENCLATURE_PRESETS } from '../config/nomenclature.constants'
import { buildDefaultNomenclature, isSeedNomenclature } from '../lib/nomenclature'
import { useStepHydration } from '../query/useStepHydration'
import { useStepMutation } from '../query/useStepMutation'

import type { NomenclatureState } from './types'
import type { NomenclatureConfig } from '@repo/shared-types'

export function useStepNomenclature(onNext: () => void) {
  const {
    control,
    setValue,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<NomenclatureState>({ defaultValues: buildDefaultNomenclature(t) })
  const { setField } = useFormFields(setValue)
  const queryClient = useQueryClient()

  useStepHydration({
    queryKey: QUERY_KEYS.settings.nomenclature,
    queryFn: settingsService.getNomenclature,
    skip: isDirty,
    hydrate: useCallback(
      (config: NomenclatureConfig) => {
        const localized = buildDefaultNomenclature(t)
        const incoming = {
          contact: config.contact ?? localized.contact,
          company: config.company ?? localized.company,
          deal: config.deal ?? localized.deal,
          activity: config.activity ?? localized.activity,
        }
        reset(isSeedNomenclature(incoming) ? localized : incoming)
      },
      [reset],
    ),
  })

  const handleUpdate = useCallback(
    (entity: keyof NomenclatureState, field: 'singular' | 'plural', value: string) => {
      setField(`${entity}.${field}`, value)
    },
    [setField],
  )

  const handlePreset = useCallback(
    (presetKey: string) => {
      const preset = NOMENCLATURE_PRESETS[presetKey]
      if (preset) reset(preset.values, { keepDefaultValues: true })
    },
    [reset],
  )

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      const result = await saveNomenclatureAction(getValues())
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onNext,
    onSuccess: () => {
      reset(getValues(), { keepValues: true })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.nomenclature })
    },
  })

  const handleReset = useCallback(() => reset(), [reset])

  return useMemo(
    () => ({ control, handleUpdate, handlePreset, handleSave, handleReset, isDirty, isPending }),
    [control, handleUpdate, handlePreset, handleSave, handleReset, isDirty, isPending],
  )
}
