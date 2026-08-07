'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const fallback = useRef(initial)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      setValue(stored === null ? fallback.current : (JSON.parse(stored) as T))
    } catch {
      setValue(fallback.current)
    }
  }, [key])

  const update = useCallback(
    (next: T) => {
      setValue(next)
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        return
      }
    },
    [key],
  )

  return [value, update] as const
}
