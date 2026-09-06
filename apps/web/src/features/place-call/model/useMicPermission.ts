'use client'

import { useCallback, useEffect, useState } from 'react'

export type MicPermissionState = 'unknown' | 'granted' | 'denied'

export function useMicPermission() {
  const [state, setState] = useState<MicPermissionState>('unknown')

  useEffect(() => {
    let cancelled = false
    const query = navigator.permissions?.query?.bind(navigator.permissions)
    if (!query) return
    query({ name: 'microphone' as PermissionName })
      .then((status) => {
        if (cancelled) return
        if (status.state === 'granted') setState('granted')
        if (status.state === 'denied') setState('denied')
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const request = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setState('granted')
      return true
    } catch {
      setState('denied')
      return false
    }
  }, [])

  return { state, request }
}
