import { useCallback, useState } from 'react'

export function useHighlightKey() {
  const [key, setKey] = useState<string | null>(null)
  const highlight = useCallback((next: string) => setKey(next), [])
  const clear = useCallback(() => setKey(null), [])
  return { key, highlight, clear }
}
