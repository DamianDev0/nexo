import { cn } from '@/shared/lib'
import { Text } from '@/shared/ui/atoms/text'

import type { CSSProperties, ReactNode } from 'react'

const TRAFFIC_LIGHTS = ['bg-red-400/90', 'bg-amber-400/90', 'bg-emerald-400/90'] as const

type BrowserFrameProps = {
  readonly address: string
  readonly children: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
}

export function BrowserFrame({ address, children, className, style }: Readonly<BrowserFrameProps>) {
  return (
    <div
      aria-hidden
      style={style}
      className={cn('overflow-hidden rounded-xl border border-border shadow-sm', className)}
    >
      <div className="flex h-8 items-center justify-between border-b border-border bg-muted/40 px-3">
        <div className="flex gap-1.5">
          {TRAFFIC_LIGHTS.map((tone) => (
            <div key={tone} className={cn('size-2 rounded-full', tone)} />
          ))}
        </div>
        <Text variant="micro" className="font-medium tracking-wide text-faint">
          {address}
        </Text>
      </div>
      {children}
    </div>
  )
}
