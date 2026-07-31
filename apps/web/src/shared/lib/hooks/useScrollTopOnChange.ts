'use client'

import { useEffect } from 'react'

import type { RefObject } from 'react'

export const APP_SCROLL_ID = 'app-scroll'

export function useScrollTopOnChange(key: string, ref?: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const target = ref?.current ?? document.getElementById(APP_SCROLL_ID)
    if (target) target.scrollTop = 0
  }, [key, ref])
}
