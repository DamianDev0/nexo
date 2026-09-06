'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from 'next-themes'
import { useState, type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from 'sileo'

import { TOAST_FILL_DARK, TOAST_FILL_LIGHT } from '@/shared/config/tokens/effects'
import { createLocaleInstance } from '@/shared/i18n/config'
import { createQueryClient } from '@/shared/query/query-client'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import type { Locale } from '@/shared/i18n/locale'

const LIGHT_TOAST_OPTIONS = {
  fill: TOAST_FILL_LIGHT,
  styles: {
    title: 'text-black!',
    description: 'text-black/70!',
    badge: 'bg-black/5!',
    button: 'bg-black/5! hover:bg-black/10!',
  },
} as const

const DARK_TOAST_OPTIONS = {
  fill: TOAST_FILL_DARK,
  styles: {
    title: 'text-white!',
    description: 'text-white/75!',
    badge: 'bg-white/10!',
    button: 'bg-white/10! hover:bg-white/15!',
  },
} as const

function SileoToaster() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Toaster
      position="top-center"
      theme={isDark ? 'dark' : 'light'}
      options={isDark ? DARK_TOAST_OPTIONS : LIGHT_TOAST_OPTIONS}
    />
  )
}

type ProvidersProps = {
  readonly locale: Locale
  readonly children: ReactNode
}

export function Providers({ locale, children }: Readonly<ProvidersProps>) {
  const [queryClient] = useState(createQueryClient)
  const [i18n] = useState(() => createLocaleInstance(locale))

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={400}>{children}</TooltipProvider>
          <SileoToaster />
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}
