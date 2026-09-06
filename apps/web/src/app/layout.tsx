import { cookies } from 'next/headers'

import { Providers } from '@/app/providers'
import { safeTenantSlug, TENANT_COOKIE, tenantThemeHref } from '@/shared/config/tenant-cookie'
import { getLocale } from '@/shared/i18n/server'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'NexoCRM', template: '%s · NexoCRM' },
  description: 'CRM enterprise para Colombia',
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale()
  const tenantSlug = safeTenantSlug((await cookies()).get(TENANT_COOKIE)?.value)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="https://cdn.fontshare.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {tenantSlug && <link href={tenantThemeHref(tenantSlug)} rel="stylesheet" />}
      </head>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  )
}
