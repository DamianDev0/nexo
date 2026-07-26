import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'

import { DEFAULT_NOMENCLATURE, NOMENCLATURE_PRESETS } from './nomenclature.constants'
import { useStepMutation } from './useStepMutation'

import type { NomenclatureState } from './nomenclature.constants'

export function useStepNomenclature(onNext: () => void) {
  const { watch, setValue, getValues, reset } = useForm<NomenclatureState>({
    defaultValues: DEFAULT_NOMENCLATURE,
  })
  const nomen = watch()

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
    mutationFn: () => settingsService.updateNomenclature(getValues()),
    onNext,
  })

  return { nomen, handleUpdate, handlePreset, handleSave, isPending }
}
