import { ManageSettingsProvider, SettingsShell } from '@/features/manage-settings'

import type { ReactNode } from 'react'

export function SettingsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ManageSettingsProvider>
      <SettingsShell>{children}</SettingsShell>
    </ManageSettingsProvider>
  )
}
