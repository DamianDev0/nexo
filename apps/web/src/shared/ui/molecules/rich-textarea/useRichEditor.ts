'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type RichCommandState = {
  readonly bold: boolean
  readonly italic: boolean
  readonly underline: boolean
  readonly strikeThrough: boolean
}

const IDLE: RichCommandState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
}

function queryState(command: string): boolean {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

export function useRichEditor() {
  const ref = useRef<HTMLDivElement | null>(null)
  const savedRange = useRef<Range | null>(null)
  const [active, setActive] = useState<RichCommandState>(IDLE)

  const refresh = useCallback(() => {
    const el = ref.current
    if (!el || typeof document.queryCommandState !== 'function') return
    if (!el.contains(document.getSelection()?.anchorNode ?? null)) return
    setActive({
      bold: queryState('bold'),
      italic: queryState('italic'),
      underline: queryState('underline'),
      strikeThrough: queryState('strikeThrough'),
    })
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', refresh)
    return () => document.removeEventListener('selectionchange', refresh)
  }, [refresh])

  const exec = useCallback(
    (command: string, value?: string) => {
      const el = ref.current
      if (!el) return
      el.focus()
      document.execCommand?.(command, false, value)
      refresh()
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    [refresh],
  )

  const saveSelection = useCallback(() => {
    const selection = document.getSelection()
    savedRange.current =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null
  }, [])

  const restoreSelection = useCallback(() => {
    const range = savedRange.current
    if (!range) return
    const selection = document.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [])

  return { ref, active, exec, saveSelection, restoreSelection }
}

export type RichEditor = ReturnType<typeof useRichEditor>
