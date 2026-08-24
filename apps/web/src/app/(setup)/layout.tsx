import { redirect } from 'next/navigation'

import { getMe } from '@/shared/api/dal/auth'
import { ROUTES } from '@/shared/config/routes'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SetupLayout({ children }: Readonly<{ children: ReactNode }>) {
  const me = await getMe().catch(() => null)
  if (!me) redirect(ROUTES.auth.login)

  return <>{children}</>
}
