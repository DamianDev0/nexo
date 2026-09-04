'use client'

import { useEffect, useState } from 'react'

export function useCallClock(startedAt: number | null): number {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (startedAt === null) {
      setNow(null)
      return
    }
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [startedAt])

  if (startedAt === null || now === null) return 0
  return Math.max(0, Math.floor((now - startedAt) / 1000))
}
