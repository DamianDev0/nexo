'use client'

import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/atoms/theme-toggle'
import { AUTH_BG_LIGHT, AUTH_BG_DARK, PANEL_GLOW_LIGHT, PANEL_GLOW_DARK } from '@/utils/effects'
import { LoginBranding } from '../components/LoginBranding'
import { LoginForm } from '../components/LoginForm'
import { OrbNetwork } from '../components/OrbNetwork'

export function LoginView() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: isDark ? AUTH_BG_DARK : AUTH_BG_LIGHT }}
      />

      {/* Glow behind form */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 z-1 hidden h-4/5 w-96 -translate-y-1/2 lg:block"
        style={{ background: isDark ? PANEL_GLOW_DARK : PANEL_GLOW_LIGHT }}
      />

      {/* Brand bar — NEXO left, toggle right — spans full width */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-foreground" />
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">Nexo</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Left panel: branding — lg only */}
      <div className="hidden flex-1 lg:flex">
        <LoginBranding />
      </div>

      {/* Right panel: form */}
      <div className="relative z-3 mx-auto flex w-full items-center justify-center px-6 py-16 sm:max-w-md sm:px-0 lg:mx-0 lg:w-150 lg:max-w-none lg:shrink-0 lg:justify-start lg:pl-0 lg:pr-10 xl:w-160">
        {/* Mobile: subtle orb behind form */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-20 lg:hidden">
          <div className="size-64 sm:size-80">
            <OrbNetwork />
          </div>
        </div>

        <div className="relative z-1 flex flex-col items-center gap-8">
          <LoginForm />

          {/* Mobile tagline */}
          <div className="flex flex-col gap-1.5 text-center lg:hidden">
            <h2 className="text-xl font-lights">
              Your pipeline, <em className="italic text-foreground/35">always on.</em>
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The CRM built for teams that move fast.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
