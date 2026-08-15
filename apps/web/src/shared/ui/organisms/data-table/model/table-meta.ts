import type { RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- module augmentation must repeat the upstream type parameters
  interface ColumnMeta<TData extends RowData, TValue> {
    grow?: boolean
    align?: 'start' | 'center' | 'end'
    label?: string
    description?: string
    lockable?: boolean
  }
}

export {}
