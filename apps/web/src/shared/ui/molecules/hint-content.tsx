import { TooltipContent } from '@/shared/ui/shadcn/tooltip'

import type { ComponentProps, ReactNode } from 'react'

type HintContentProps = Omit<ComponentProps<typeof TooltipContent>, 'children'> & {
  readonly children: ReactNode
}

export function HintContent({ children, ...props }: Readonly<HintContentProps>) {
  return (
    <TooltipContent sideOffset={6} className="max-w-64 text-pretty" {...props}>
      <span className="line-clamp-5 block whitespace-pre-line break-words">{children}</span>
    </TooltipContent>
  )
}
