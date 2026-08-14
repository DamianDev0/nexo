'use client'

import { useCallback, useRef } from 'react'

import type { FieldValues, Path, PathValue, UseFormSetValue } from 'react-hook-form'

export type FieldSetter<T extends FieldValues> = <N extends Path<T>>(
  name: N,
  value: PathValue<T, N>,
) => void

export type FieldBinder<T extends FieldValues> = <N extends Path<T>>(
  name: N,
) => (value: PathValue<T, N>) => void

export function useFormFields<T extends FieldValues>(setValue: UseFormSetValue<T>) {
  const setField = useCallback<FieldSetter<T>>(
    (name, value) => setValue(name, value, { shouldDirty: true }),
    [setValue],
  )

  const handlers = useRef(new Map<string, (value: never) => void>())

  const bindField = useCallback<FieldBinder<T>>(
    (name) => {
      const cached = handlers.current.get(name)
      if (cached) return cached
      const handler = (value: PathValue<T, typeof name>) => setField(name, value)
      handlers.current.set(name, handler as (value: never) => void)
      return handler
    },
    [setField],
  )

  return { setField, bindField }
}
