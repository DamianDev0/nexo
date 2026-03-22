import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'
import settingsService from '@/core/services/settings.service'

export function useStepAppearance(onNext: () => void) {
  const [primaryColor, setPrimaryColor] = useState<string>(BRAND_COLOR_OPTIONS[0])
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'system'>('light')
  const [productName, setProductName] = useState('')
  const [tagline, setTagline] = useState('')

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      settingsService.updateTheme({
        colors: {
          primary: primaryColor,
          primaryForeground: '#ffffff',
          secondary: '#f5f5f5',
          accent: '#f5f5f5',
          sidebar: '#fafafa',
          sidebarForeground: '#0a0a0a',
        },
        darkModeDefault: darkMode,
        branding: {
          companyName: productName || 'NexoCRM',
          loginTagline: tagline || null,
          logoUrl: null,
          faviconUrl: null,
          loginBgUrl: null,
        },
      }),
    onSuccess: () => onNext(),
    onError: (err) => sileo.error({ title: 'Failed to save', description: err.message }),
  })

  const handleSave = useCallback(() => save(), [save])

  return {
    primaryColor,
    setPrimaryColor,
    darkMode,
    setDarkMode,
    productName,
    setProductName,
    tagline,
    setTagline,
    handleSave,
    isPending,
  }
}
