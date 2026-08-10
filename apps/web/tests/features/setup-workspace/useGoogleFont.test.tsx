import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useGoogleFont } from '@/features/setup-workspace/model/useGoogleFont'

afterEach(() => {
  document.head.querySelectorAll('link[id^="google-font-"]').forEach((link) => link.remove())
})

describe('useGoogleFont', () => {
  it('does nothing for the system font', () => {
    renderHook(() => useGoogleFont('system'))

    expect(document.head.querySelectorAll('link[id^="google-font-"]')).toHaveLength(0)
  })

  it('injects a stylesheet link with the mapped font family', () => {
    renderHook(() => useGoogleFont('roboto'))

    const link = document.getElementById('google-font-roboto') as HTMLLinkElement | null
    expect(link).not.toBeNull()
    expect(link?.rel).toBe('stylesheet')
    expect(link?.href).toBe(
      'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap',
    )
  })

  it('does not inject a duplicate link when one already exists for that font', () => {
    renderHook(() => useGoogleFont('poppins'))
    renderHook(() => useGoogleFont('poppins'))

    expect(document.head.querySelectorAll('#google-font-poppins')).toHaveLength(1)
  })

  it('injects a new link when the font family changes', () => {
    const { rerender } = renderHook(({ fontFamily }) => useGoogleFont(fontFamily), {
      initialProps: { fontFamily: 'inter' as const },
    })
    expect(document.getElementById('google-font-inter')).not.toBeNull()

    rerender({ fontFamily: 'nunito' })

    expect(document.getElementById('google-font-nunito')).not.toBeNull()
  })
})
