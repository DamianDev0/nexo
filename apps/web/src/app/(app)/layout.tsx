'use client'

import { AuthGuard } from '@/entities/session'
import { LanguageSwitcher } from '@/features/switch-language'
import { ThemeToggle } from '@/shared/ui/atoms/theme-toggle'
import { Separator } from '@/shared/ui/shadcn/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/ui/shadcn/sidebar'
import { AppSidebar } from '@/widgets/app-shell'

import type { ReactNode } from 'react'

export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthGuard>
      <SidebarProvider style={{ '--sidebar-width': '15rem' } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <div className="flex-1" />
            <LanguageSwitcher />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
