'use client'

import { motion, type HTMLMotionProps } from 'motion/react'

import { cn } from '@/shared/lib'

type LiquidButtonProps = HTMLMotionProps<'button'> & {
  readonly fillDelay?: string
}

export function LiquidButton({
  className,
  fillDelay = '0.3s',
  ...props
}: Readonly<LiquidButtonProps>) {
  return (
    <motion.button
      data-slot="liquid-button"
      whileTap={{ scale: 0.97 }}
      whileHover={{
        '--liquid-fill-width': '100%',
        '--liquid-fill-height': '100%',
        '--liquid-delay': fillDelay,
        transition: {
          '--liquid-fill-width': { duration: 0 },
          '--liquid-fill-height': { duration: 0 },
          '--liquid-delay': { duration: 0 },
        },
      }}
      style={
        {
          '--liquid-fill-width': '-1%',
          '--liquid-fill-height': '3px',
          '--liquid-delay': '0s',
          background:
            'linear-gradient(var(--liquid-color) 0 0) no-repeat calc(200% - var(--liquid-fill-width, -1%)) 100% / 200% var(--liquid-fill-height, 0.2em)',
          backgroundColor: 'var(--liquid-bg)',
          transition: `background ${fillDelay} var(--liquid-delay, 0s), color ${fillDelay} ${fillDelay}, background-position ${fillDelay} calc(${fillDelay} - var(--liquid-delay, 0s))`,
        } as React.CSSProperties
      }
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        '[--liquid-bg:var(--primary)] [--liquid-color:var(--primary-deep)] text-primary-foreground hover:text-primary',
        className,
      )}
      {...props}
    />
  )
}
