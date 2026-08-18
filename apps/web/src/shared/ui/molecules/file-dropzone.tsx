'use client'

import { cn } from '@/shared/lib/cn'
import { CloudArrowUpIcon } from '@/shared/ui/icons'
import { useFileUpload } from '@/shared/ui/molecules/file-upload/useFileUpload'

export type FileDropzoneLabels = {
  readonly cta: string
  readonly busy: string
  readonly hint: string
}

interface FileDropzoneProps {
  readonly accept: string
  readonly maxSizeMb: number
  readonly labels: FileDropzoneLabels
  readonly onFile: (file: File) => Promise<unknown>
  readonly isBusy?: boolean
}

export function FileDropzone({
  accept,
  maxSizeMb,
  labels,
  onFile,
  isBusy,
}: Readonly<FileDropzoneProps>) {
  const {
    inputRef,
    isDragging,
    error,
    handleInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    openPicker,
  } = useFileUpload({ maxSizeMb, onUpload: onFile })

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      <button
        type="button"
        onClick={openPicker}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={isBusy}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-sm transition-all',
          isDragging
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
          isBusy && 'pointer-events-none opacity-60',
        )}
      >
        <CloudArrowUpIcon
          className={cn('size-7 transition-transform', isDragging && '-translate-y-1')}
        />
        <span className="font-medium">{isBusy ? labels.busy : labels.cta}</span>
        <span className="text-xs text-muted-foreground">{labels.hint}</span>
      </button>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
