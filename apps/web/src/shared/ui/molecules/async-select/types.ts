import type { AsyncOptionSource } from '@/shared/lib/hooks/useAsyncSelect'
import type { ReactNode } from 'react'

export type AsyncSelectSource<T> = AsyncOptionSource<T> & {
  readonly renderOption: (option: T) => ReactNode
}

export interface AsyncSelectView {
  readonly label: string
  readonly display?: ReactNode
  readonly placeholder: string
  readonly searchPlaceholder: string
  readonly empty: ReactNode | ((term: string) => ReactNode)
  readonly error?: ReactNode
  readonly triggerClassName?: string
}
