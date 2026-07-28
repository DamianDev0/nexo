import { getT } from '@/shared/i18n/server'
import { DashboardView } from '@/views/dashboard'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('nav.dashboard') }
}

export default function DashboardPage() {
  return <DashboardView />
}
