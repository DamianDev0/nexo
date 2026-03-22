'use client'

import { ThemeToggle } from '@/components/atoms/theme-toggle'

interface AuthLayoutProps {
  readonly children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-foreground" />
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">Nexo</span>
        </div>
        <ThemeToggle />
      </div>

      {children}
    </div>
  )
}
