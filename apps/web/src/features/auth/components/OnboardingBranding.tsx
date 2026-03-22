'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const ColombiaMap = dynamic(() => import('./ColombiaMap').then((m) => m.ColombiaMap), {
  ssr: false,
})

export function OnboardingBranding() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 z-0 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(233,133,32,0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(200,92,16,0.06) 0%, transparent 70%)',
        }}
      />

      <ColombiaMap />

      <div className="relative z-1 bg-linear-to-t from-background via-background/70 to-transparent px-8 pb-8 pt-16">
        <h2 className="text-2xl font-light text-foreground">
          Build your workspace, <em className="italic text-foreground/35">grow across Colombia.</em>
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Set up your CRM in minutes.
          <br />
          Start managing contacts, deals, and teams today.
        </p>
      </div>
    </div>
  )
}
