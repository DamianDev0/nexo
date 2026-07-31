import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type VsTooltipElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  variant?: 'solid' | 'fluent' | 'glass' | 'outline'
  radius?: 'none' | 'subtle' | 'rounded' | 'pill' | 'squircle'
  offset?: number | string
  delay?: number | string
  'hide-delay'?: number | string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'vs-tooltip': VsTooltipElementProps
    }
  }
}

export {}
