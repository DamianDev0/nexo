import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/config/query-keys'

import { saveNomenclatureAction } from '../api/setup-steps.actions'

import { DEFAULT_NOMENCLATURE, NOMENCLATURE_PRESETS } from './nomenclature.constants'
import { useStepHydration } from './useStepHydration'
import { useStepMutation } from './useStepMutation'

import type { NomenclatureState } from './nomenclature.constants'
import type { NomenclatureConfig } from '@repo/shared-types'

export function useStepNomenclature(onNext: () => void) {
  const { watch, setValue, getValues, reset } = useForm<NomenclatureState>({
    defaultValues: DEFAULT_NOMENCLATURE,
  })
  const nomen = watch()

  useStepHydration({
    queryKey: QUERY_KEYS.settings.nomenclature,
    queryFn: settingsService.getNomenclature,
    hydrate: useCallback(
      (config: NomenclatureConfig) =>
        reset({
          contact: config.contact ?? DEFAULT_NOMENCLATURE.contact,
          company: config.company ?? DEFAULT_NOMENCLATURE.company,
          deal: config.deal ?? DEFAULT_NOMENCLATURE.deal,
          activity: config.activity ?? DEFAULT_NOMENCLATURE.activity,
        }),
      [reset],
    ),
  })

  const handleUpdate = useCallback(
    (entity: keyof NomenclatureState, field: 'singular' | 'plural', value: string) => {
      setValue(`${entity}.${field}`, value)
    },
    [setValue],
  )

  const handlePreset = useCallback(
    (presetKey: string) => {
      const preset = NOMENCLATURE_PRESETS[presetKey]
      if (preset) reset(preset.values)
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

  return { nomen, handleUpdate, handlePreset, handleSave, isPending }
}
