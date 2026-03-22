import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from '@/lib/providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'NexoCRM',
  description: 'CRM enterprise para Colombia',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
