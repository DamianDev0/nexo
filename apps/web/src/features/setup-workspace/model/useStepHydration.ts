import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

interface StepHydrationOptions<TData> {
  readonly queryKey: readonly unknown[]
  readonly queryFn: () => Promise<TData>
  readonly hydrate: (data: TData) => void
}

export function useStepHydration<TData>({
  queryKey,
  queryFn,
  hydrate,
}: StepHydrationOptions<TData>) {
  const { data } = useQuery({ queryKey, queryFn, staleTime: Number.POSITIVE_INFINITY })
  const hydrated = useRef(false)

  useEffect(() => {
    if (data === undefined || hydrated.current) return
    hydrated.current = true
    hydrate(data)
  }, [data, hydrate])
}
