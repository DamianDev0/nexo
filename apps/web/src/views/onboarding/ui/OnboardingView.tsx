'use client'

import { OnboardingForm, useOnboardingForm } from '@/features/register-workspace'
import { usePasswordToggle } from '@/shared/lib/hooks/usePasswordToggle'
import { AuthSplitView } from '@/widgets/auth-shell'

import { OnboardingBranding } from './OnboardingBranding'

export function OnboardingView() {
  const { control, handleSubmit, handleBusinessNameChange, isPending } = useOnboardingForm()
  const { showPassword, togglePassword } = usePasswordToggle()

  return (
    <AuthSplitView branding={<OnboardingBranding />} brandingClassName="border-r border-border/20">
      <OnboardingForm
        control={control}
        onSubmit={handleSubmit}
        isPending={isPending}
        showPassword={showPassword}
        onTogglePassword={togglePassword}
        onBusinessNameChange={handleBusinessNameChange}
      />
    </AuthSplitView>
  )
}
