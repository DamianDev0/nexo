import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { saveNavigationAction } from '../api/setup-steps.actions'
import { DEFAULT_MODULES } from '../config/navigation.constants'
import { moduleGroupKey } from '../lib/navigation'
import { useStepHydration } from '../query/useStepHydration'
import { useStepMutation } from '../query/useStepMutation'

import type { NavigationFormValues } from './types'
import type { SidebarConfig } from '@repo/shared-types'

export function useStepNavigation(onNext: () => void) {
  const {
    control,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<NavigationFormValues>({ defaultValues: { modules: [...DEFAULT_MODULES] } })
  const { fields, move, update } = useFieldArray({ control, name: 'modules' })
  const queryClient = useQueryClient()

  useStepHydration({
    queryKey: QUERY_KEYS.settings.navigation,
    queryFn: settingsService.getNavigation,
    skip: isDirty,
    hydrate: useCallback(
      (config: SidebarConfig) => {
        if (config.modules.length === 0) return
        reset({ modules: [...config.modules].sort((a, b) => a.order - b.order) })
      },
      [reset],
    ),
  })

  const handleToggle = useCallback(
    (key: string) => {
      const index = fields.findIndex((field) => field.key === key)
      if (index < 0) return
      const current = getValues(`modules.${index}`)
      if (current.required) return
      update(index, { ...current, enabled: !current.enabled })
    },
    [fields, getValues, update],
  )

  const handleReorder = useCallback(
    (activeKey: string, overKey: string) => {
      if (moduleGroupKey(activeKey) !== moduleGroupKey(overKey)) return
      const from = fields.findIndex((field) => field.key === activeKey)
      const to = fields.findIndex((field) => field.key === overKey)
      if (from < 0 || to < 0 || from === to) return
      move(from, to)
    },
    [fields, move],
  )

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      const result = await saveNavigationAction({
        modules: getValues('modules').map((module, index) => ({ ...module, order: index + 1 })),
      })
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onNext,
    onSuccess: () => {
      reset(getValues(), { keepValues: true })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.navigation })
    },
  })

  const handleReset = useCallback(() => reset(), [reset])

  return useMemo(
    () => ({ control, handleToggle, handleReorder, handleSave, handleReset, isDirty, isPending }),
    [control, handleToggle, handleReorder, handleSave, handleReset, isDirty, isPending],
  )
}
