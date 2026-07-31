import { t } from 'i18next'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
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
    watch,
    setValue,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<NomenclatureState>({ defaultValues: buildDefaultNomenclature(t) })
  const nomen = watch()

  useStepHydration({
    queryKey: QUERY_KEYS.settings.nomenclature,
    queryFn: settingsService.getNomenclature,
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
      setValue(`${entity}.${field}`, value, { shouldDirty: true })
    },
    [setValue],
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
  })

  return {
    nomen,
    handleUpdate,
    handlePreset,
    handleSave,
    handleReset: () => reset(),
    isDirty,
    isPending,
  }
}
