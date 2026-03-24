import { useEffect } from 'react'
import { GOOGLE_FONT_MAP } from '../constants/appearance.constants'

export function useGoogleFont(fontFamily: string) {
  useEffect(() => {
    if (fontFamily === 'system') return

    const fontName = GOOGLE_FONT_MAP[fontFamily]
    if (!fontName) return

    const id = `google-font-${fontFamily}`
    if (document.getElementById(id)) return

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;600;700&display=swap`
    document.head.appendChild(link)
  }, [fontFamily])
}
