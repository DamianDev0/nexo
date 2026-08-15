'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { RefObject } from 'react'

export interface ExpandableSearch {
  readonly open: boolean
  readonly toggle: () => void
  readonly containerRef: RefObject<HTMLDivElement | null>
  readonly inputRef: RefObject<HTMLInputElement | null>
}

export function useExpandableSearch(
  value: string,
  onChange: (value: string) => void,
): ExpandableSearch {
  const [open, setOpen] = useState(value !== '')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    onChange('')
  }, [onChange])

  const toggle = useCallback(() => {
    if (open) close()
    else setOpen(true)
  }, [open, close])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (value === '' && !containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, value, close])

  return { open, toggle, containerRef, inputRef }
}
