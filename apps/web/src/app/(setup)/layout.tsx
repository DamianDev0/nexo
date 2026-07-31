import { AuthGuard } from '@/entities/session'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function SetupLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AuthGuard>{children}</AuthGuard>
}
