import type { RowData } from '@tanstack/react-table'
import type { RefObject } from 'react'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- module augmentation must repeat the upstream type parameters
  interface ColumnMeta<TData extends RowData, TValue> {
    grow?: boolean
    align?: 'start' | 'center' | 'end'
    label?: string
    description?: string
    lockable?: boolean
  }

  // eslint-disable-next-line unused-imports/no-unused-vars -- module augmentation must repeat the upstream type parameters
  interface TableMeta<TData extends RowData> {
    selectionAnchor?: RefObject<string | null>
  }
}

export {}
