'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/shadcn/button'

import {
  DATA_TABLE_MAX_COLUMN_WIDTH,
  DATA_TABLE_MIN_COLUMN_WIDTH,
} from '../../config/table.constants'
import { clampColumnWidth } from '../../lib/column-size'
import { useColumnResize } from '../model/use-column-resize'

import type { Header } from '@tanstack/react-table'
import type { KeyboardEvent } from 'react'

const RESIZE_STEP = { ArrowLeft: -16, ArrowRight: 16 } as const

function isResizeKey(key: string): key is keyof typeof RESIZE_STEP {
  return key in RESIZE_STEP
}

export function ResizeHandle({ header }: Readonly<{ header: Header<unknown, unknown> }>) {
  const { t } = useTranslation()
  const { column } = header
  const { resizing, onPointerDown } = useColumnResize(header)
  const min = column.columnDef.minSize ?? DATA_TABLE_MIN_COLUMN_WIDTH
  const max = column.columnDef.maxSize ?? DATA_TABLE_MAX_COLUMN_WIDTH

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isResizeKey(event.key)) return
    event.preventDefault()
    const next = clampColumnWidth(column.getSize() + RESIZE_STEP[event.key], min, max)
    header.getContext().table.setColumnSizing((prev) => ({ ...prev, [column.id]: next }))
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      tabIndex={-1}
      role="slider"
      aria-label={t('common.table.resize')}
      aria-valuenow={Math.round(column.getSize())}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={onPointerDown}
      onDoubleClick={() => column.resetSize()}
      onKeyDown={handleKeyDown}
      className={cn(
        'absolute inset-y-0 right-0 z-30 h-full w-2 cursor-col-resize touch-none rounded-none p-0 hover:bg-transparent',
        'before:absolute before:inset-y-1.5 before:right-0.75 before:w-px before:rounded-full before:transition-[background-color,inset]',
        resizing
          ? 'before:inset-y-0 before:w-0.5 before:bg-primary'
          : 'before:bg-border hover:before:inset-y-0 hover:before:w-0.5 hover:before:bg-border-strong',
      )}
    />
  )
}
