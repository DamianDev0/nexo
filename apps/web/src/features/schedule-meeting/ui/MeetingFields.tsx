'use client'

import { cn } from '@/shared/lib'
import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { FieldError } from '@/shared/ui/molecules/field-error'

import type { ReactNode } from 'react'

type MeetingFieldProps = {
  readonly label: string
  readonly children: ReactNode
  readonly error?: string
  readonly className?: string
}

export function MeetingField({ label, children, error, className }: Readonly<MeetingFieldProps>) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex min-w-0 items-center rounded-md border border-input px-2">
        {children}
      </div>
      <FieldError message={error} />
    </div>
  )
}
