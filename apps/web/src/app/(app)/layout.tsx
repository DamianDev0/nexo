'use client'

import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/organisms/sidebar'
import { Separator } from '@/components/atoms/separator'
import { ThemeToggle } from '@/components/atoms/theme-toggle'
import { AuthGuard } from '@/features/app/components/AuthGuard'
import { AppSidebar } from '@/features/app/components/AppSidebar'

export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
