import { useCallback } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'

import { DEFAULT_MODULES } from './navigation.constants'
import { useStepMutation } from './useStepMutation'

import type { SidebarModule } from '@repo/shared-types'

interface NavigationFormValues {
  modules: SidebarModule[]
}

export function useStepNavigation(onNext: () => void) {
  const { control, watch, getValues } = useForm<NavigationFormValues>({
    defaultValues: { modules: [...DEFAULT_MODULES] },
  })
  const { fields, move, update } = useFieldArray({ control, name: 'modules' })
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
      const from = fields.findIndex((f) => f.key === activeKey)
      const to = fields.findIndex((f) => f.key === overKey)
      if (from < 0 || to < 0 || from === to) return
      move(from, to)
    },
    [fields, move],
  )

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () =>
      settingsService.updateNavigation({
        modules: getValues('modules').map((module, index) => ({ ...module, order: index + 1 })),
      }),
    onNext,
  })

  return {
    modules,
    handleToggle,
    handleReorder,
    handleSave,
    isPending,
  }
}
