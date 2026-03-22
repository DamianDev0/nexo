'use client'

import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { createQueryClient } from './query-client'

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
