import type { ReactNode } from 'react'

interface AsyncSelectSourceBase<T> {
  readonly getValue: (option: T) => string
  readonly renderOption: (option: T) => ReactNode
  readonly filterFn?: (option: T, query: string) => boolean
}

export type AsyncSelectSource<T> = AsyncSelectSourceBase<T> &
  (
    | { readonly options: ReadonlyArray<T>; readonly key?: never; readonly fetcher?: never }
    | {
        readonly options?: never
        readonly key: string
        readonly fetcher: (query: string) => Promise<ReadonlyArray<T>>
      }
  )

export interface AsyncSelectView {
  readonly display?: ReactNode
  readonly placeholder: string
  readonly searchPlaceholder: string
  readonly empty: ReactNode | ((term: string) => ReactNode)
  readonly error?: ReactNode
  readonly triggerClassName?: string
}
