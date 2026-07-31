'use client'

import { cn } from '@/shared/lib'
import { CloudArrowUpIcon } from '@/shared/ui/icons'

import { DEFAULT_ACCEPT, DEFAULT_MAX_SIZE_MB } from './constants'
import { FilePreview } from './file-preview'
import { useFileUpload } from './useFileUpload'

interface FileUploadProps {
  readonly accept?: string
  readonly maxSizeMb?: number
  readonly preview: string | null
  readonly fileName: string | null
  readonly onUpload: (file: File) => Promise<unknown>
  readonly onRemove: () => void
  readonly className?: string
}

export function FileUpload({
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  preview,
  fileName,
  onUpload,
  onRemove,
  className,
}: Readonly<FileUploadProps>) {
  const {
    inputRef,
    isDragging,
    progress,
    handleInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    openPicker,
  } = useFileUpload({ maxSizeMb, onUpload })

  if (preview) {
    return (
      <FilePreview
        preview={preview}
        fileName={fileName}
        onRemove={onRemove}
        className={className}
      />
    )
  }

  return (
    <div className={cn('mt-2', className)}>
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
        disabled={progress !== null}
        className={cn(
          'relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed p-6 text-sm transition-all',
          isDragging
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
          progress !== null && 'pointer-events-none border-primary/30',
        )}
      >
        <CloudArrowUpIcon
          className={cn('size-6 transition-transform', isDragging && '-translate-y-1')}
        />
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-medium">
            {isDragging ? 'Drop file here' : 'Click or drag to upload'}
          </span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG, SVG or WebP · Max {maxSizeMb}MB
          </span>
        </div>

        {progress !== null && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </button>
    </div>
  )
}
