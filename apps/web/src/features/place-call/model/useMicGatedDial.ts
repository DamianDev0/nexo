'use client'

import { useCallback, useRef, useState } from 'react'

import { useMicPermission } from './useMicPermission'

export function useMicGatedDial() {
  const mic = useMicPermission()
  const [modalOpen, setModalOpen] = useState(false)
  const pending = useRef<(() => void) | null>(null)

  const requestDial = useCallback(
    (dial: () => void) => {
      if (mic.state === 'granted') {
        dial()
        return
      }
      pending.current = dial
      setModalOpen(true)
    },
    [mic.state],
  )

  const allow = useCallback(async () => {
    const granted = await mic.request()
    if (!granted) return
    setModalOpen(false)
    pending.current?.()
    pending.current = null
  }, [mic])

  const dismiss = useCallback(() => {
    setModalOpen(false)
    pending.current = null
  }, [])

  return { denied: mic.state === 'denied', modalOpen, requestDial, allow, dismiss }
}
