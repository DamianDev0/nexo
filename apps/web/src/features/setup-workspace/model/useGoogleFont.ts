import { useEffect } from 'react'

import { GOOGLE_FONT_MAP } from '../model/appearance.constants'

import type { ThemeTypography } from '@repo/shared-types'

export function useGoogleFont(fontFamily: ThemeTypography['fontFamily']) {
  useEffect(() => {
    if (fontFamily === 'system') return

    const fontName = GOOGLE_FONT_MAP[fontFamily]

    const id = `google-font-${fontFamily}`
    if (document.getElementById(id)) return

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;600;700&display=swap`
    document.head.appendChild(link)
  }, [fontFamily])
}
