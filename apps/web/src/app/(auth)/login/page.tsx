import { getT } from '@/shared/i18n/server'
import { LoginView } from '@/views/login'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    title: t('auth.meta.loginTitle'),
    description: t('auth.meta.loginDescription'),
  }
}

export default function LoginPage() {
  return <LoginView />
}
