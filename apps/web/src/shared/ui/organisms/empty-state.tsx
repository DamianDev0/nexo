import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

interface EmptyStateProps {
  readonly icon?: ReactNode
  readonly title: string
  readonly description: string
  readonly children?: ReactNode
  readonly className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: Readonly<EmptyStateProps>) {
  return (
    <section
      data-slot="empty-state"
      className={cn(
        'relative flex flex-col items-center overflow-hidden rounded-xl bg-card px-7 py-11 text-center',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl dark:bg-primary/15"
      />
      <div className="relative flex size-11 items-center justify-center rounded-xl bg-primary-pale text-primary-deep ring-1 ring-primary/25 dark:text-primary">
        {icon}
      </div>
      <h2 className="relative mt-5 text-[26px] font-black leading-[1.1] tracking-[-0.03em] text-foreground">
        {title}
      </h2>
      <p className="relative mt-2.5 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && (
        <div className="relative mt-5.5 flex flex-col items-center gap-6">{children}</div>
      )}
    </section>
  )
}
