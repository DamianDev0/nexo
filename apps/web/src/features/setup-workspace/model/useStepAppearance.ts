import { useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { useFormFields } from '@/shared/lib/hooks/useFormFields'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { saveThemeAction } from '../api/setup-steps.actions'
import { APPEARANCE_DEFAULT_VALUES as DEFAULT_VALUES } from '../config/appearance.constants'
import { withPreset } from '../lib/appearance'
import { derivePalette } from '../lib/palette'
import { useStepHydration } from '../query/useStepHydration'
import { useStepMutation } from '../query/useStepMutation'

import { useLogoField } from './useLogoField'

import type {
  AppearanceFormValues,
  ColorOverrides,
  OverridableColorKey,
  ThemePreset,
} from './types'
import type { TenantTheme, ThemeConfig } from '@repo/shared-types'

export function useStepAppearance(onNext: () => void) {
  const queryClient = useQueryClient()
  const {
    control,
    setValue,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<AppearanceFormValues>({ defaultValues: DEFAULT_VALUES })
  const { setField, bindField } = useFormFields(setValue)

  useStepHydration({
    queryKey: QUERY_KEYS.settings.theme,
    queryFn: settingsService.getTheme,
    skip: isDirty,
    hydrate: useCallback(
      (theme: ThemeConfig) => {
        const { primary, primaryForeground: _pf, ...overrides } = theme.colors ?? {}
        reset({
          ...DEFAULT_VALUES,
          primaryColor: primary ?? DEFAULT_VALUES.primaryColor,
          colorOverrides: theme.colors ? (overrides as ColorOverrides) : {},
          fontFamily: theme.typography?.fontFamily ?? DEFAULT_VALUES.fontFamily,
          borderRadius: theme.typography?.borderRadius ?? DEFAULT_VALUES.borderRadius,
          density: theme.typography?.density ?? DEFAULT_VALUES.density,
          darkMode: theme.darkModeDefault ?? DEFAULT_VALUES.darkMode,
          productName: theme.branding?.companyName ?? '',
          tagline: theme.branding?.loginTagline ?? '',
          logoUrl: theme.branding?.logoUrl ?? null,
        })
      },
      [reset],
    ),
  })

  const handlePrimaryChange = useCallback(
    (value: string) => {
      setField('primaryColor', value)
      setField('colorOverrides', {})
    },
    [setField],
  )

  const handleColorOverride = useCallback(
    (key: OverridableColorKey, value: string) => {
      setField('colorOverrides', { ...getValues('colorOverrides'), [key]: value })
    },
    [setField, getValues],
  )

  const { handleLogoUpload, handleLogoRemove } = useLogoField({ setField, getValues })

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      const form = getValues()
      const result = await saveThemeAction({
        colors: derivePalette(form.primaryColor, form.colorOverrides),
        typography: {
          fontFamily: form.fontFamily,
          borderRadius: form.borderRadius,
          density: form.density,
        },
        branding: {
          companyName: form.productName || 'NexoCRM',
          loginTagline: form.tagline || null,
          logoUrl: form.logoUrl,
          faviconUrl: null,
          loginBgUrl: null,
        },
        iconPack: 'outline',
        darkModeDefault: form.darkMode,
      })
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onNext,
    onSuccess: () => {
      reset(getValues(), { keepValues: true })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.theme })
    },
  })

  const handleApplyPreset = useCallback(
    (preset: ThemePreset) => reset(withPreset(getValues(), preset), { keepDefaultValues: true }),
    [getValues, reset],
  )

  const handleRestoreTheme = useCallback(
    (config: Partial<TenantTheme>) => {
      const current = getValues()
      const { primary, primaryForeground: _pf, ...overrides } = config.colors ?? {}
      reset({
        ...current,
        primaryColor: primary ?? current.primaryColor,
        colorOverrides: config.colors ? overrides : current.colorOverrides,
        fontFamily: config.typography?.fontFamily ?? current.fontFamily,
        borderRadius: config.typography?.borderRadius ?? current.borderRadius,
        density: config.typography?.density ?? current.density,
        darkMode: config.darkModeDefault ?? current.darkMode,
        productName: config.branding?.companyName ?? current.productName,
        tagline: config.branding?.loginTagline ?? current.tagline,
      })
      sileo.success({ title: t('auth.toasts.themeRestored') })
    },
    [getValues, reset],
  )

  const handleReset = useCallback(() => reset(), [reset])

  return useMemo(
    () => ({
      control,
      bindField,
      handlePrimaryChange,
      handleColorOverride,
      handleLogoUpload,
      handleLogoRemove,
      handleApplyPreset,
      handleRestoreTheme,
      handleSave,
      handleReset,
      isDirty,
      isPending,
    }),
    [
      control,
      bindField,
      handlePrimaryChange,
      handleColorOverride,
      handleLogoUpload,
      handleLogoRemove,
      handleApplyPreset,
      handleRestoreTheme,
      handleSave,
      handleReset,
      isDirty,
      isPending,
    ],
  )
}
