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
        'flex flex-col items-center rounded-xl bg-card px-7 py-11 text-center',
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary-pale text-primary-deep">
        {icon}
      </div>
      <h2 className="mt-5 text-[26px] font-black leading-[1.1] tracking-[-0.03em] text-foreground">
        {title}
      </h2>
      <p className="mt-2.5 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-5.5 flex gap-2.5">{children}</div>}
    </section>
  )
}
