import { useState, useCallback, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import type { ThemeTypography, ThemeColors, TenantTheme } from '@repo/shared-types'
import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'
import settingsService from '@/core/services/settings.service'
import { derivePalette } from '../constants/palette.utils'

type ColorOverrides = Partial<Omit<ThemeColors, 'primary' | 'primaryForeground'>>

export function useStepAppearance(onNext: () => void) {
  const [primaryColor, setPrimaryColor] = useState<string>(BRAND_COLOR_OPTIONS[0])
  const [colorOverrides, setColorOverrides] = useState<ColorOverrides>({})
  const [grainIntensity, setGrainIntensity] = useState(0)
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'system'>('system')
  const [fontFamily, setFontFamily] = useState<ThemeTypography['fontFamily']>('inter')
  const [borderRadius, setBorderRadius] = useState<ThemeTypography['borderRadius']>('lg')
  const [density, setDensity] = useState<ThemeTypography['density']>('comfortable')
  const [productName, setProductName] = useState('')
  const [tagline, setTagline] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const colors = useMemo(
    () => derivePalette(primaryColor, colorOverrides),
    [primaryColor, colorOverrides],
  )

  const handleColorOverride = useCallback((key: keyof ColorOverrides, value: string) => {
    setColorOverrides((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handlePrimaryChange = useCallback((value: string) => {
    setPrimaryColor(value)
    setColorOverrides({})
  }, [])

  const [logoFileName, setLogoFileName] = useState<string | null>(null)

  const handleLogoUpload = useCallback(async (file: File) => {
    setLogoPreview(URL.createObjectURL(file))
    setLogoFileName(file.name)
    const data = await settingsService.uploadLogo(file)
    setLogoUrl(data.url)
  }, [])

  const handleLogoRemove = useCallback(() => {
    setLogoUrl(null)
    setLogoPreview(null)
  }, [])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      settingsService.updateTheme({
        colors,
        typography: { fontFamily, borderRadius, density },
        branding: {
          companyName: productName || 'NexoCRM',
          loginTagline: tagline || null,
          logoUrl,
          faviconUrl: null,
          loginBgUrl: null,
        },
        iconPack: 'outline',
        darkModeDefault: darkMode,
      }),
    onSuccess: () => onNext(),
    onError: (err) => sileo.error({ title: 'Failed to save', description: err.message }),
  })

  const handleSave = useCallback(() => save(), [save])

  const handleRestoreTheme = useCallback((config: Partial<TenantTheme>) => {
    if (config.colors?.primary) setPrimaryColor(config.colors.primary)
    if (config.colors) {
      const { primary: _p, primaryForeground: _pf, ...rest } = config.colors
      setColorOverrides(rest)
    }
    if (config.typography?.fontFamily) setFontFamily(config.typography.fontFamily)
    if (config.typography?.borderRadius) setBorderRadius(config.typography.borderRadius)
    if (config.typography?.density) setDensity(config.typography.density)
    if (config.darkModeDefault) setDarkMode(config.darkModeDefault)
    if (config.branding?.companyName) setProductName(config.branding.companyName)
    if (config.branding?.loginTagline) setTagline(config.branding.loginTagline)
    sileo.success({ title: 'Theme restored' })
  }, [])

  return {
    primaryColor,
    colors,
    grainIntensity,
    setGrainIntensity,
    darkMode,
    setDarkMode,
    fontFamily,
    setFontFamily,
    borderRadius,
    setBorderRadius,
    density,
    setDensity,
    productName,
    setProductName,
    tagline,
    setTagline,
    logoPreview,
    logoFileName,
    handlePrimaryChange,
    handleColorOverride,
    handleLogoUpload,
    handleLogoRemove,
    handleRestoreTheme,
    handleSave,
    isPending,
  }
}
