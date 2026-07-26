import { Check, X } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui/shadcn/button'

interface FilePreviewProps {
  readonly preview: string
  readonly fileName: string | null
  readonly onRemove: () => void
  readonly className?: string
}

export function FilePreview({ preview, fileName, onRemove, className }: FilePreviewProps) {
  return (
    <div
      className={cn('mt-2 flex items-center gap-3 rounded-lg border border-border p-3', className)}
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
