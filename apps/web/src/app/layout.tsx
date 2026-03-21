import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from '@/lib/providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'NexoCRM',
  description: 'CRM enterprise para Colombia',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
