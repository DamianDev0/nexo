'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'

import { ONBOARDING_GLOW_DARK, ONBOARDING_GLOW_LIGHT } from '@/shared/config/tokens/effects'

const ColombiaMap = dynamic(() => import('./ColombiaMap').then((m) => m.ColombiaMap), {
  ssr: false,
})

export function OnboardingBranding() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 z-0 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: isDark ? ONBOARDING_GLOW_DARK : ONBOARDING_GLOW_LIGHT,
        }}
      />

      <ColombiaMap />

      <div className="relative z-1 bg-linear-to-t from-background via-background/70 to-transparent px-8 pb-8 pt-16">
        <h2 className="text-2xl font-light text-foreground">
          {t('onboarding.branding.title')}{' '}
          <em className="italic text-foreground/35">{t('onboarding.branding.titleAccent')}</em>
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t('onboarding.branding.line1')}
          <br />
          {t('onboarding.branding.line2')}
        </p>
      </div>
    </div>
  )
}
