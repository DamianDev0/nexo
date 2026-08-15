import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { ReactNode } from 'react'

import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

export function queryWrapper({ children }: Readonly<{ children: ReactNode }>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}
