import { useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/config/query-keys'

import { saveThemeAction } from '../api/setup-steps.actions'
import { derivePalette } from '../model/palette.utils'

import {
  APPEARANCE_DEFAULT_VALUES as DEFAULT_VALUES,
  withPreset,
  type AppearanceFormValues,
} from './appearance-form'
import { matchingPresetKey, type ThemePreset } from './appearance.constants'
import { useStepHydration } from './useStepHydration'
import { useStepMutation } from './useStepMutation'

import type { ColorOverrides, OverridableColorKey, ThemeMode } from './appearance.types'
import type { TenantTheme, ThemeConfig, ThemeTypography } from '@repo/shared-types'

export function useStepAppearance(onNext: () => void) {
  const queryClient = useQueryClient()
  const { watch, setValue, getValues, reset } = useForm<AppearanceFormValues>({
    defaultValues: DEFAULT_VALUES,
  })
  const values = watch()

  useStepHydration({
    queryKey: QUERY_KEYS.settings.theme,
    queryFn: settingsService.getTheme,
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

  const colors = useMemo(
    () => derivePalette(values.primaryColor, values.colorOverrides),
    [values.primaryColor, values.colorOverrides],
  )

  const handlePrimaryChange = useCallback(
    (value: string) => {
      setValue('primaryColor', value)
      setValue('colorOverrides', {})
    },
    [setValue],
  )

  const handleColorOverride = useCallback(
    (key: OverridableColorKey, value: string) => {
      setValue('colorOverrides', { ...getValues('colorOverrides'), [key]: value })
    },
    [setValue, getValues],
  )

  const handleLogoUpload = useCallback(
    async (file: File) => {
      setValue('logoPreview', URL.createObjectURL(file))
      setValue('logoFileName', file.name)
      const data = await settingsService.uploadLogo(file)
      setValue('logoUrl', data.url)
    },
    [setValue],
  )

  const handleLogoRemove = useCallback(() => {
    setValue('logoUrl', null)
    setValue('logoPreview', null)
    setValue('logoFileName', null)
  }, [setValue])

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
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.theme })
    },
  })

  const handleApplyPreset = useCallback(
    (preset: ThemePreset) => reset(withPreset(getValues(), preset)),
    [getValues, reset],
  )

  const activePresetKey = useMemo(
    () =>
      matchingPresetKey({
        primaryColor: values.primaryColor,
        fontFamily: values.fontFamily,
        borderRadius: values.borderRadius,
        density: values.density,
      }),
    [values.primaryColor, values.fontFamily, values.borderRadius, values.density],
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

  return {
    primaryColor: values.primaryColor,
    colors,
    grainIntensity: values.grainIntensity,
    setGrainIntensity: (v: number) => setValue('grainIntensity', v),
    darkMode: values.darkMode,
    setDarkMode: (v: ThemeMode) => setValue('darkMode', v),
    fontFamily: values.fontFamily,
    setFontFamily: (v: ThemeTypography['fontFamily']) => setValue('fontFamily', v),
    borderRadius: values.borderRadius,
    setBorderRadius: (v: ThemeTypography['borderRadius']) => setValue('borderRadius', v),
    density: values.density,
    setDensity: (v: ThemeTypography['density']) => setValue('density', v),
    productName: values.productName,
    setProductName: (v: string) => setValue('productName', v),
    tagline: values.tagline,
    setTagline: (v: string) => setValue('tagline', v),
    logoPreview: values.logoPreview,
    logoFileName: values.logoFileName,
    activePresetKey,
    handleApplyPreset,
    handlePrimaryChange,
    handleColorOverride,
    handleLogoUpload,
    handleLogoRemove,
    handleRestoreTheme,
    handleSave,
    isPending,
  }
}
