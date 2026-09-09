'use client'

import { useEffect, useRef } from 'react'

export function useRestoreFocus(open: boolean): void {
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      const active = document.activeElement
      openerRef.current = active instanceof HTMLElement ? active : null
      return
    }
    const opener = openerRef.current
    openerRef.current = null
    if (opener?.isConnected) opener.focus({ preventScroll: true })
  }, [open])
}
