'use client'

import { AppearanceLivePreview, useGoogleFont } from '@/features/setup-workspace'

import { useManageSettings } from '../../../model/settings-context'

import type { ReactNode } from 'react'

export function AppearanceShell({ children }: Readonly<{ children: ReactNode }>) {
  const { appearance, navigation } = useManageSettings()

  useGoogleFont(appearance.fontFamily)

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
      <div className="w-full xl:max-w-sm">
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          {children}
        </div>
      </div>

      <div className="w-full xl:sticky xl:top-6 xl:flex-1 xl:self-start">
        <AppearanceLivePreview
          data={{
            colors: appearance.colors,
            darkMode: appearance.darkMode,
            fontFamily: appearance.fontFamily,
            borderRadius: appearance.borderRadius,
            density: appearance.density,
            productName: appearance.productName,
            logoPreview: appearance.logoPreview,
            navModules: navigation.modules,
          }}
        />
      </div>
    </div>
  )
}
