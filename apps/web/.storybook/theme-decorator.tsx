import React, { useEffect } from 'react'

import type { Decorator } from '@storybook/nextjs-vite'

export const TENANT_PRESETS = {
  nexo: {
    primary: '#A5E96F',
    primaryForeground: '#0E0F0C',
    primaryPale: '#E4F7D6',
    fontUi: "'Satoshi', system-ui, sans-serif",
  },
  ochre: {
    primary: '#F0B429',
    primaryForeground: '#0E0F0C',
    primaryPale: '#FBEED0',
    fontUi: "'Satoshi', system-ui, sans-serif",
  },
  indigo: {
    primary: '#8AA2FF',
    primaryForeground: '#FFFFFF',
    primaryPale: '#E3E9FF',
    fontUi: "'Satoshi', system-ui, sans-serif",
  },
} as const

export type TenantPreset = keyof typeof TENANT_PRESETS

function applyTenant(root: HTMLElement, preset: TenantPreset) {
  const tenant = TENANT_PRESETS[preset]
  root.style.setProperty('--primary', tenant.primary)
  root.style.setProperty('--primary-foreground', tenant.primaryForeground)
  root.style.setProperty('--primary-pale', tenant.primaryPale)
  root.style.setProperty('--font-ui', tenant.fontUi)
}

function ThemeFrame({
  mode,
  density,
  tenant,
  children,
}: Readonly<{
  mode: 'light' | 'dark'
  density: string
  tenant: TenantPreset
  children: React.ReactNode
}>) {
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) applyTenant(ref.current, tenant)
  }, [tenant])

  return (
    <div
      ref={ref}
      className={mode === 'dark' ? 'dark' : undefined}
      data-density={density}
      style={{ background: 'var(--background)', padding: 24 }}
    >
      <div className="bg-background text-foreground font-[family-name:var(--font-ui)]">
        {children}
      </div>
    </div>
  )
}

export const withNexoTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as 'light' | 'dark' | 'side-by-side'
  const density = (context.globals.density ?? 'comfortable') as string
  const tenant = (context.globals.tenant ?? 'nexo') as TenantPreset

  if (theme === 'side-by-side') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <ThemeFrame mode="light" density={density} tenant={tenant}>
          <Story />
        </ThemeFrame>
        <ThemeFrame mode="dark" density={density} tenant={tenant}>
          <Story />
        </ThemeFrame>
      </div>
    )
  }

  return (
    <ThemeFrame mode={theme} density={density} tenant={tenant}>
      <Story />
    </ThemeFrame>
  )
}
