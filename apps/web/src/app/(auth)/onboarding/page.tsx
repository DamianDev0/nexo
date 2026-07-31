import { getT } from '@/shared/i18n/server'
import { OnboardingView } from '@/views/onboarding'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    title: t('auth.meta.onboardingTitle'),
    description: t('auth.meta.onboardingDescription'),
  }
}

export default function OnboardingPage() {
  return <OnboardingView />
}
