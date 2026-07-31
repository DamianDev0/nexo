'use client'

import { ThinkingOrb } from 'thinking-orbs'

import { cn } from '@/shared/lib/cn'
import { usePrimaryOrbTheme } from '@/shared/lib/hooks/usePrimaryOrbTheme'
import { Button } from '@/shared/ui/shadcn/button'

import type { ComponentProps, ReactNode } from 'react'

interface SubmitButtonProps {
  readonly onSubmit: () => void
  readonly isPending: boolean | undefined
  readonly disabled?: boolean
  readonly children: ReactNode
  readonly size?: ComponentProps<typeof Button>['size']
}

export function SubmitButton({
  onSubmit,
  isPending,
  disabled,
  children,
  size,
}: Readonly<SubmitButtonProps>) {
  const orbTheme = usePrimaryOrbTheme()
  const blocked = isPending || disabled === true

  return (
    <Button
      size={size}
      aria-disabled={blocked}
      aria-busy={isPending}
      onClick={() => !blocked && onSubmit()}
      className={cn('min-w-24 gap-2', blocked && 'cursor-not-allowed opacity-60')}
    >
      {isPending && <ThinkingOrb state="working" size={20} theme={orbTheme} aria-hidden="true" />}
      {children}
    </Button>
  )
}
