import { cn } from '@/shared/lib'
import { Label } from '@/shared/ui/shadcn/label'

import type { ComponentProps } from 'react'

const FIELD_LABEL_VARIANTS = {
  field: 'text-xs font-semibold text-body',
  section: 'text-[11px] font-semibold tracking-wide text-muted-foreground',
} as const

type FieldLabelProps = ComponentProps<typeof Label> & {
  readonly required?: boolean
  readonly variant?: keyof typeof FIELD_LABEL_VARIANTS
}

export function FieldLabel({
  required,
  variant = 'field',
  className,
  children,
  ...props
}: FieldLabelProps) {
  return (
    <Label className={cn(FIELD_LABEL_VARIANTS[variant], className)} {...props}>
      {children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  )
}
