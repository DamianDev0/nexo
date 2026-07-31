import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AuthGuard } from '@/entities/session'
import { LanguageSwitcher } from '@/features/switch-language'
import { APP_SCROLL_ID } from '@/shared/lib/hooks/useScrollTopOnChange'
import { prefetchAppShell } from '@/shared/query/prefetch-session'
import { ThemeToggle } from '@/shared/ui/atoms/theme-toggle'
import { Separator } from '@/shared/ui/shadcn/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/ui/shadcn/sidebar'
import { AppSidebar, HeaderSearch, HeaderTitle, TenantThemeLoader } from '@/widgets/app-shell'

import { AppMotionProvider } from './AppMotionProvider'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = await prefetchAppShell()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthGuard>
        <TenantThemeLoader />
        <AppMotionProvider>
          <SidebarProvider
            className="h-svh overflow-hidden"
            style={{ '--sidebar-width': '15rem' } as React.CSSProperties}
          >
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
                <SidebarTrigger className="-ml-1 md:hidden" />
                <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
                <HeaderTitle />
                <Separator orientation="vertical" className="mx-5 hidden self-stretch md:block" />
                <HeaderSearch />
                <div className="flex-1" />
                <LanguageSwitcher />
                <ThemeToggle />
              </header>
              <div
                id={APP_SCROLL_ID}
                className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]"
              >
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AppMotionProvider>
      </AuthGuard>
    </HydrationBoundary>
  )
}
