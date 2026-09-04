'use client'

import { useCallback } from 'react'

type FilePickerOptions = {
  readonly accept?: string
  readonly multiple?: boolean
  readonly onFiles: (files: readonly File[]) => void
}

export function useFilePicker({ accept, multiple = false, onFiles }: Readonly<FilePickerOptions>) {
  return useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    if (accept) input.accept = accept
    input.multiple = multiple
    input.onchange = () => {
      const files = Array.from(input.files ?? [])
      if (files.length > 0) onFiles(files)
    }
    input.click()
  }, [accept, multiple, onFiles])
}
