'use client'

import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from 'sileo'
import { createQueryClient } from './query-client'

const LIGHT_TOAST_OPTIONS = {
  fill: '#FFFFFF',
  styles: {
    title: 'text-black!',
    description: 'text-black/70!',
    badge: 'bg-black/5!',
    button: 'bg-black/5! hover:bg-black/10!',
  },
} as const

const DARK_TOAST_OPTIONS = {
  fill: '#171717',
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

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <SileoToaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
