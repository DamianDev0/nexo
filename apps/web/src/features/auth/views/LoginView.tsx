'use client'

import { useTheme } from 'next-themes'
import { PANEL_GLOW_LIGHT, PANEL_GLOW_DARK } from '@/utils/effects'
import { usePasswordToggle } from '@/hooks/usePasswordToggle'
import { useMounted } from '@/hooks/useMounted'
import { AuthLayout } from '../components/AuthLayout'
import { LoginBranding } from '../components/LoginBranding'
import { LoginForm } from '../components/LoginForm'
import { useLoginForm } from '../hooks/useLoginForm'

export function LoginView() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const isDark = mounted && resolvedTheme === 'dark'
  const { control, handleSubmit, isPending } = useLoginForm()
  const { showPassword, togglePassword } = usePasswordToggle()

  return (
    <AuthLayout>
      {mounted && (
        <div
          className="pointer-events-none absolute right-0 top-1/2 z-1 hidden h-4/5 w-96 -translate-y-1/2 lg:block"
          style={{ background: isDark ? PANEL_GLOW_DARK : PANEL_GLOW_LIGHT }}
        />
      )}

      <div className="hidden flex-1 lg:flex">
        <LoginBranding />
      </div>

      <div className="relative z-3 flex w-full items-center justify-center overflow-y-auto px-6 py-20 lg:w-130 lg:shrink-0 lg:px-12 xl:w-140">
        <div className="relative z-1 flex w-full flex-col items-center gap-8">
          <LoginForm
            control={control}
            onSubmit={handleSubmit}
            isPending={isPending}
            showPassword={showPassword}
            onTogglePassword={togglePassword}
          />
          <div className="flex flex-col gap-1.5 text-center lg:hidden">
            <h2 className="text-xl font-light text-foreground">
              Welcome back, <em className="italic text-foreground/35">let&apos;s close deals.</em>
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">Your team is waiting.</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
