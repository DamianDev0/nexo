'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { CloudUpload, X, Check } from 'lucide-react'
import { sileo } from 'sileo'

import { Button } from '@/components/atoms/button'
import { cn } from '@/utils'

/* ─── Toast content ────────────────────────────────────────── */

function UploadToastContent({
  fileName,
  fileSize,
  status,
}: {
  readonly fileName: string
  readonly fileSize: string
  readonly status: 'loading' | 'success'
}) {
  const isSuccess = status === 'success'
  const accentColor = isSuccess ? '#22c55e' : '#3b82f6'

  return (
    <div className="-mt-1.5 flex flex-col gap-4">
      <div className="-mb-4 flex items-center justify-between">
        <div className="text-[13px] font-medium leading-none tracking-tight opacity-50">
          {fileSize}
        </div>
      </div>

      <div className="relative flex items-center justify-between overflow-visible">
        {/* Source: file icon */}
        <svg className="mt-4 size-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <title>File</title>
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
            fill={`${accentColor}20`}
            stroke={accentColor}
            strokeWidth="1.5"
          />
          <path d="M14 2v6h6" stroke={accentColor} strokeWidth="1.5" />
        </svg>

        {/* Curved path */}
        <div className="relative mx-1 flex max-h-2.5 flex-1 items-center overflow-visible">
          <svg
            viewBox="0 0 300 120"
            fill="none"
            preserveAspectRatio="none"
            className="absolute inset-x-0 -mb-5 bottom-0 h-20 w-full overflow-visible"
          >
            <title>Upload path</title>
            <path
              d="M 4 118 Q 150 -20 296 118"
              stroke={accentColor}
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeOpacity="0.5"
              fill="none"
              vectorEffect="non-scaling-stroke"
              shapeRendering="geometricPrecision"
            />
          </svg>
          <div
            className="absolute left-3 -bottom-4 z-10 flex size-5 items-center justify-center rounded-full"
            style={{ background: `${accentColor}30` }}
          >
            <svg className="size-3" viewBox="0 0 24 24" fill="none" style={{ color: accentColor }}>
              <title>Arrow</title>
              <path
                d="m7 17 9.2-9.2M17 17V7H7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className="absolute right-3 -bottom-4 z-10 flex size-5 items-center justify-center rounded-full"
            style={{ background: `${accentColor}30` }}
          >
            <svg
              className="size-3 rotate-90"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: accentColor }}
            >
              <title>Arrow</title>
              <path
                d="m7 17 9.2-9.2M17 17V7H7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Destination: cloud icon */}
        <svg className="mt-4 size-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <title>Cloud</title>
          <path
            d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"
            fill={`${accentColor}20`}
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {!isSuccess && (
            <path
              d="M12 13v5M9 16l3-3 3 3"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          )}
          {isSuccess && (
            <path
              d="m9 15 2.5 2.5L15 13"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      <div className="truncate text-center text-xs font-medium tracking-tight opacity-60">
        {fileName}
      </div>
    </div>
  )
}

/* ─── Props ────────────────────────────────────────────────── */

interface FileUploadProps {
  readonly accept?: string
  readonly maxSizeMb?: number
  readonly preview: string | null
  readonly fileName: string | null
  readonly onUpload: (file: File) => Promise<unknown>
  readonly onRemove: () => void
  readonly className?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({
  accept = 'image/png,image/jpeg,image/svg+xml,image/webp',
  maxSizeMb = 5,
  preview,
  fileName,
  onUpload,
  onRemove,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)

  const processFile = useCallback(
    (file: File) => {
      if (file.size > maxSizeMb * 1024 * 1024) {
        sileo.error({
          title: 'File too large',
          description: `Max size is ${maxSizeMb}MB. Your file is ${formatFileSize(file.size)}.`,
        })
        return
      }

      setProgress(0)

      const progressInterval = globalThis.setInterval(() => {
        setProgress((prev) => {
          if (prev === null || prev >= 90) return prev
          return prev + Math.round(Math.random() * 12)
        })
      }, 150)

      const uploadPromise = onUpload(file)
        .then(() => {
          setProgress(100)
        })
        .finally(() => {
          globalThis.clearInterval(progressInterval)
          globalThis.setTimeout(() => setProgress(null), 500)
        })

      sileo.promise(uploadPromise, {
        loading: {
          title: 'Uploading to cloud',
          icon: <CloudUpload className="size-3.5" />,
          description: (
            <UploadToastContent
              fileName={file.name}
              fileSize={formatFileSize(file.size)}
              status="loading"
            />
          ),
        },
        success: {
          title: 'Uploaded',
          icon: <Check className="size-3.5" />,
          description: (
            <UploadToastContent
              fileName={file.name}
              fileSize={formatFileSize(file.size)}
              status="success"
            />
          ),
        },
        error: { title: 'Upload failed' },
      })
    },
    [onUpload, maxSizeMb],
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  if (preview) {
    return (
      <div
        className={cn(
          'mt-2 flex items-center gap-3 rounded-lg border border-border p-3',
          className,
        )}
      >
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={preview}
            alt="Preview"
            width={48}
            height={48}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {fileName ?? 'Uploaded file'}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="size-3" />
            Uploaded
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      </div>
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
        onClick={() => inputRef.current?.click()}
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
        <CloudUpload
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

        {/* Progress bar */}
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
