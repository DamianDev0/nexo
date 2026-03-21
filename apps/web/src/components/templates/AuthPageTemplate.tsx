import { cn } from '@/utils'

interface AuthPageTemplateProps {
  readonly title: string
  readonly description?: string
  readonly footer?: React.ReactNode
  readonly children: React.ReactNode
  readonly className?: string
}

export function AuthPageTemplate({
  title,
  description,
  footer,
  children,
  className,
}: AuthPageTemplateProps) {
  return (
    <div
      className={cn('flex min-h-screen items-center justify-center bg-background p-4', className)}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>

        {/* Form area */}
        <div className="rounded-lg border border-border bg-card p-6">{children}</div>

        {/* Footer (links, legal, etc.) */}
        {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}
