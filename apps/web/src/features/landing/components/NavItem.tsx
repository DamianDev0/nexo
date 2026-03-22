import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  readonly href: string
  readonly icon: LucideIcon
  readonly title: string
  readonly description: string
}

export function NavItem({ href, icon: Icon, title, description }: NavItemProps) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
    >
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
        <Icon className="size-4 text-foreground/70" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </a>
  )
}
