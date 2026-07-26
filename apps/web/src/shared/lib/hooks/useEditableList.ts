import { useCallback, useState } from 'react'

export type Identified<T> = T & { readonly id: string }

function identify<T extends object>(item: T): Identified<T> {
  return { ...item, id: crypto.randomUUID() }
}

export function useEditableList<T extends object>(initial: readonly T[], makeItem: () => T) {
  const [items, setItems] = useState<Identified<T>[]>(() => initial.map(identify))

  const add = useCallback(() => {
    setItems((prev) => [...prev, identify(makeItem())])
  }, [makeItem])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  return { items, add, remove, update }
}
