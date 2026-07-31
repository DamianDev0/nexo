import { GuestGuard } from '@/entities/session'

import type { ReactNode } from 'react'

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <GuestGuard>{children}</GuestGuard>
}
