import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { CallDock } from '@/features/place-call'
import { LanguageSwitcher } from '@/features/switch-language'
import { APP_SCROLL_ID } from '@/shared/lib/hooks/useScrollTopOnChange'
import { prefetchAppShell } from '@/shared/query/prefetch-session'
import { ThemeToggle } from '@/shared/ui/atoms/theme-toggle'
import { Separator } from '@/shared/ui/shadcn/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/ui/shadcn/sidebar'
import {
  AppSidebar,
  HeaderBreadcrumb,
  HeaderNotifications,
  HeaderQuickCreate,
  HeaderSearch,
  HeaderSettingsLink,
  TenantThemeLoader,
} from '@/widgets/app-shell'

import { AppMotionProvider } from './AppMotionProvider'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = await prefetchAppShell({ requireOnboarded: true })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TenantThemeLoader />
      <AppMotionProvider>
        <SidebarProvider
          className="h-svh overflow-hidden"
          style={{ '--sidebar-width': '13.5rem' } as React.CSSProperties}
        >
          <AppSidebar />
          <SidebarInset className="min-w-0">
            <header className="relative z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
              <HeaderBreadcrumb />
              <Separator orientation="vertical" className="mx-5 hidden self-stretch md:block" />
              <HeaderSearch />
              <div className="flex-1" />
              <div className="flex items-center gap-0.5">
                <HeaderQuickCreate />
                <HeaderSettingsLink />
                <HeaderNotifications />
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </header>
            <div
              id={APP_SCROLL_ID}
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable] [&>*]:shrink-0"
            >
              {children}
            </div>
          </SidebarInset>
          <CallDock />
        </SidebarProvider>
      </AppMotionProvider>
    </HydrationBoundary>
  )
}
