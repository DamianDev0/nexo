import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { prefetchSetupWizard } from '@/shared/query/prefetch-session'
import { SetupWizardView } from '@/views/onboarding-setup'

export default async function SetupPage() {
  const queryClient = await prefetchSetupWizard()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SetupWizardView />
    </HydrationBoundary>
  )
}
