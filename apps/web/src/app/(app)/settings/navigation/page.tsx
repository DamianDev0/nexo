import { getT } from '@/shared/i18n/server'
import { SettingsView } from '@/views/settings'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('nav.settings') }
}

export default function SettingsPage() {
  return <SettingsView section="navigation" />
}
