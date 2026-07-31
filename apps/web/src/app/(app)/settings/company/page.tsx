import { getT } from '@/shared/i18n/server'
import { SettingsView } from '@/views/settings'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('settings.sections.company') }
}

export default function Page() {
  return <SettingsView pane="company" />
}
