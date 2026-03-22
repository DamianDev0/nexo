'use client'

import type { ReactNode } from 'react'
import { AuthGuard } from '@/features/app/components/AuthGuard'

export default function SetupLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AuthGuard>{children}</AuthGuard>
}
