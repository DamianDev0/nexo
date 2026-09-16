'use client'

import { useEffect } from 'react'

import { APP_SCROLL_ID } from '@/shared/config/dom-ids'

import type { RefObject } from 'react'

export { APP_SCROLL_ID }

export function useScrollTopOnChange(key: string, ref?: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const target = ref?.current ?? document.getElementById(APP_SCROLL_ID)
    if (target) target.scrollTop = 0
  }, [key, ref])
}
