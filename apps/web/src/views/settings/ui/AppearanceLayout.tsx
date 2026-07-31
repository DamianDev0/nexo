import { AppearanceShell } from '@/features/manage-settings'

import type { ReactNode } from 'react'

export function AppearanceLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppearanceShell>{children}</AppearanceShell>
}
