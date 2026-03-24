'use client'

import { motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { PANEL_GLOW_LIGHT, PANEL_GLOW_DARK } from '@/utils/effects'
import { fade, slideRight, smoothEase } from '@/utils/animations'
import { usePasswordToggle } from '@/hooks/usePasswordToggle'
import { useMounted } from '@/hooks/useMounted'
import { AuthLayout } from '../components/AuthLayout'
import { OnboardingBranding } from '../components/OnboardingBranding'
import { OnboardingForm } from '../components/OnboardingForm'
import { useOnboardingForm } from '../hooks/useOnboardingForm'

export function OnboardingView() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const isDark = mounted && resolvedTheme === 'dark'
  const { control, handleSubmit, handleBusinessNameChange, isPending } = useOnboardingForm()
  const { showPassword, togglePassword } = usePasswordToggle()

  return (
    <AuthLayout>
      {mounted && (
        <div
          className="pointer-events-none absolute right-0 top-1/2 z-1 hidden h-4/5 w-96 -translate-y-1/2 lg:block"
          style={{ background: isDark ? PANEL_GLOW_DARK : PANEL_GLOW_LIGHT }}
        />
      )}

      <motion.div
        initial="initial"
        animate="animate"
        variants={fade}
        transition={smoothEase}
        className="hidden flex-1 border-r border-border/20 lg:flex"
      >
        <OnboardingBranding />
      </motion.div>

      <div className="relative z-3 flex w-full items-center justify-center px-6 py-20 lg:w-130 lg:shrink-0 lg:px-12 xl:w-140">
        <motion.div
          initial="initial"
          animate="animate"
          variants={slideRight}
          transition={smoothEase}
          className="flex w-full max-w-md flex-col"
        >
          <OnboardingForm
            control={control}
            onSubmit={handleSubmit}
            isPending={isPending}
            showPassword={showPassword}
            onTogglePassword={togglePassword}
            onBusinessNameChange={handleBusinessNameChange}
          />
        </motion.div>
      </div>
    </AuthLayout>
  )
}
