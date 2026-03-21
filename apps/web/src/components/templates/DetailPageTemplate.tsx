import { cn } from '@/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/molecules/breadcrumb'

interface BreadcrumbSegment {
  readonly label: string
  readonly href?: string
}

interface DetailPageTemplateProps {
  readonly breadcrumbs: BreadcrumbSegment[]
  readonly title: string
  readonly subtitle?: React.ReactNode
  readonly badge?: React.ReactNode
  readonly actions?: React.ReactNode
  readonly sidebar?: React.ReactNode
  readonly tabs?: React.ReactNode
  readonly children: React.ReactNode
  readonly className?: string
}

export function DetailPageTemplate({
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
  sidebar,
  tabs,
  children,
  className,
}: DetailPageTemplateProps) {
  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((segment, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <BreadcrumbItem key={segment.label}>
                {isLast ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={segment.href}>{segment.label}</BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Detail header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {badge}
            </div>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Tabs (if any) */}
      {tabs}

      {/* Two-column layout: main (2/3) + sidebar (1/3) */}
      {sidebar ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">{children}</div>
          <aside className="space-y-6">{sidebar}</aside>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  )
}
