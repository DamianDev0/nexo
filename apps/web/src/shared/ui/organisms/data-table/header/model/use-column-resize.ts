'use client'

import { useCallback, useRef, useState } from 'react'

import {
  DATA_TABLE_MAX_COLUMN_WIDTH,
  DATA_TABLE_MIN_COLUMN_WIDTH,
} from '../../config/table.constants'
import { clampColumnWidth } from '../../lib/column-size'

import type { Header } from '@tanstack/react-table'
import type { PointerEvent as ReactPointerEvent } from 'react'

export function useColumnResize(header: Header<unknown, unknown>) {
  const [resizing, setResizing] = useState(false)
  const frame = useRef(0)

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return

      const { column } = header
      const table = event.currentTarget.closest('table')
      const col = table?.querySelector<HTMLTableColElement>(`col[data-col-id="${column.id}"]`)
      if (!table || !col) return

      event.preventDefault()
      event.stopPropagation()

      const min = column.columnDef.minSize ?? DATA_TABLE_MIN_COLUMN_WIDTH
      const max = column.columnDef.maxSize ?? DATA_TABLE_MAX_COLUMN_WIDTH
      const startX = event.clientX
      const startWidth = column.getSize()
      const startTotal = header.getContext().table.getTotalSize()
      let width = startWidth

      setResizing(true)

      const paint = () => {
        col.style.width = `${width}px`
        table.style.minWidth = `${startTotal + width - startWidth}px`
      }

      const onMove = (move: PointerEvent) => {
        width = clampColumnWidth(startWidth + move.clientX - startX, min, max)
        cancelAnimationFrame(frame.current)
        frame.current = requestAnimationFrame(paint)
      }

      const onUp = () => {
        cancelAnimationFrame(frame.current)
        paint()
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        setResizing(false)
        header.getContext().table.setColumnSizing((prev) => ({ ...prev, [column.id]: width }))
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [header],
  )

  return { resizing, onPointerDown }
}
