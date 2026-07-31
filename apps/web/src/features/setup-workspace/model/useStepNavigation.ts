import { useCallback } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { saveNavigationAction } from '../api/setup-steps.actions'
import { DEFAULT_MODULES } from '../config/navigation.constants'
import { moduleGroupKey } from '../lib/navigation'
import { useStepHydration } from '../query/useStepHydration'
import { useStepMutation } from '../query/useStepMutation'

import type { SidebarConfig, SidebarModule } from '@repo/shared-types'

interface NavigationFormValues {
  modules: SidebarModule[]
}

export function useStepNavigation(onNext: () => void) {
  const {
    control,
    watch,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<NavigationFormValues>({ defaultValues: { modules: [...DEFAULT_MODULES] } })
  const { fields, move, update } = useFieldArray({ control, name: 'modules' })

  useStepHydration({
    queryKey: QUERY_KEYS.settings.navigation,
    queryFn: settingsService.getNavigation,
    hydrate: useCallback(
      (config: SidebarConfig) => {
        if (config.modules.length === 0) return
        reset({ modules: [...config.modules].sort((a, b) => a.order - b.order) })
      },
      [reset],
    ),
  })
  const watchedModules = watch('modules')

  const modules = fields.map((field, index) => watchedModules[index] ?? field)

  const handleToggle = useCallback(
    (key: string) => {
      const index = fields.findIndex((f) => f.key === key)
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
      const from = fields.findIndex((f) => f.key === activeKey)
      const to = fields.findIndex((f) => f.key === overKey)
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
  })

  return {
    modules,
    handleToggle,
    handleReorder,
    handleSave,
    handleReset: () => reset(),
    isDirty,
    isPending,
  }
}
