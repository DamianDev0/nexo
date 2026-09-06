'use client'

import { useMemo } from 'react'

import { cn } from '@/shared/lib'

import { DialPadBackspace, DialPadCall } from './actions'
import { DialPadContext } from './context'
import { DialPadKeypad } from './keypad'

import type { ReactNode } from 'react'

type DialPadRootProps = {
  readonly value: string
  readonly onDigit: (digit: string) => void
  readonly onDelete: () => void
  readonly children: ReactNode
  readonly className?: string
}

function DialPadRoot({
  value,
  onDigit,
  onDelete,
  children,
  className,
}: Readonly<DialPadRootProps>) {
  const context = useMemo(() => ({ value, onDigit, onDelete }), [value, onDigit, onDelete])
  return (
    <DialPadContext.Provider value={context}>
      <div data-slot="dial-pad" className={cn('flex flex-col items-center gap-3', className)}>
        {children}
      </div>
    </DialPadContext.Provider>
  )
}

export const DialPad = Object.assign(DialPadRoot, {
  Keypad: DialPadKeypad,
  Call: DialPadCall,
  Backspace: DialPadBackspace,
})
