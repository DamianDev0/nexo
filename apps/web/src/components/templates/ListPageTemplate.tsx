import { cn } from '@/utils'

interface ListPageTemplateProps {
  readonly title: string
  readonly description?: string
  readonly actions?: React.ReactNode
  readonly filters?: React.ReactNode
  readonly children: React.ReactNode
  readonly className?: string
}

export function ListPageTemplate({
  title,
  description,
  actions,
  filters,
  children,
  className,
}: ListPageTemplateProps) {
  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Filters bar */}
      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

      {/* Table / content area */}
      <div className="flex-1">{children}</div>
    </div>
  )
}
