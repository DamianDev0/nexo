import { cn } from '@/shared/lib'
import { Label } from '@/shared/ui/shadcn/label'

import type { ComponentProps } from 'react'

type FieldLabelProps = ComponentProps<typeof Label> & {
  readonly required?: boolean
}

export function FieldLabel({ required, className, children, ...props }: FieldLabelProps) {
  return (
    <Label className={cn('text-xs font-semibold text-body', className)} {...props}>
      {children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  )
}
