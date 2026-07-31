import { AppearanceLayout } from '@/views/settings'

import type { ReactNode } from 'react'

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppearanceLayout>{children}</AppearanceLayout>
}
