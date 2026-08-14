import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

interface StepHydrationOptions<TData> {
  readonly queryKey: readonly unknown[]
  readonly queryFn: () => Promise<TData>
  readonly hydrate: (data: TData) => void
  readonly skip?: boolean
}

export function useStepHydration<TData>({
  queryKey,
  queryFn,
  hydrate,
  skip,
}: StepHydrationOptions<TData>) {
  const { data } = useQuery({ queryKey, queryFn, staleTime: Number.POSITIVE_INFINITY })
  const hydrated = useRef<TData | undefined>(undefined)

  useEffect(() => {
    if (data === undefined || skip || data === hydrated.current) return
    hydrated.current = data
    hydrate(data)
  }, [data, hydrate, skip])
}
