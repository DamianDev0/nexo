import { useCallback, useRef, useState } from 'react'

import {
  BYTES_PER_MB,
  PROGRESS_CEILING,
  PROGRESS_COMPLETE,
  PROGRESS_RESET_DELAY_MS,
  PROGRESS_STEP_MAX,
  PROGRESS_TICK_MS,
} from './constants'
import { notifyFileTooLarge, notifyUploadProgress } from './upload-toasts'

import type { ChangeEvent, DragEvent } from 'react'

interface UseFileUploadOptions {
  readonly maxSizeMb: number
  readonly onUpload: (file: File) => Promise<unknown>
}

export function useFileUpload({ maxSizeMb, onUpload }: UseFileUploadOptions) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)

  const processFile = useCallback(
    (file: File) => {
      if (file.size > maxSizeMb * BYTES_PER_MB) {
        notifyFileTooLarge(maxSizeMb, file.size)
        return
      }

      setProgress(0)

      const progressInterval = globalThis.setInterval(() => {
        setProgress((prev) => {
          if (prev === null || prev >= PROGRESS_CEILING) return prev
          return prev + Math.round(Math.random() * PROGRESS_STEP_MAX)
        })
      }, PROGRESS_TICK_MS)

      const uploadPromise = onUpload(file)
        .then(() => {
          setProgress(PROGRESS_COMPLETE)
        })
        .finally(() => {
          globalThis.clearInterval(progressInterval)
          globalThis.setTimeout(() => setProgress(null), PROGRESS_RESET_DELAY_MS)
        })

      notifyUploadProgress(uploadPromise, file)
    },
    [onUpload, maxSizeMb],
  )

  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent): void {
    e.preventDefault()
    setIsDragging(false)
  }

  function openPicker(): void {
    inputRef.current?.click()
  }

  return {
    inputRef,
    isDragging,
    progress,
    handleInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    openPicker,
  }
}
