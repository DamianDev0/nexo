'use client'

import { useWatch } from 'react-hook-form'

import {
  AppearanceLivePreview,
  useAppearanceColors,
  useGoogleFont,
} from '@/features/setup-workspace'
import { PanelStack } from '@/shared/ui/molecules/panel-stack'

import { useManageSettings } from '../../../model/settings-context'

import type { ReactNode } from 'react'

export function AppearanceShell({ children }: Readonly<{ children: ReactNode }>) {
  const { appearance, navigation } = useManageSettings()
  const { control } = appearance
  const colors = useAppearanceColors(control)
  const navModules = useWatch({ control: navigation.control, name: 'modules' })
  const [darkMode, fontFamily, borderRadius, density, productName, logoPreview] = useWatch({
    control,
    name: ['darkMode', 'fontFamily', 'borderRadius', 'density', 'productName', 'logoPreview'],
  })

  useGoogleFont(fontFamily)

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
      <div className="w-full xl:max-w-sm">
        <PanelStack>{children}</PanelStack>
      </div>

      <div className="w-full xl:sticky xl:top-6 xl:flex-1 xl:self-start">
        <AppearanceLivePreview
          data={{
            colors,
            darkMode,
            fontFamily,
            borderRadius,
            density,
            productName,
            logoPreview,
            navModules,
          }}
        />
      </div>
    </div>
  )
}
