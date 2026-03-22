'use client'

import type { ReactNode } from 'react'
import { GuestGuard } from '@/features/app/components/GuestGuard'

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <GuestGuard>{children}</GuestGuard>
}
