import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { SIDEBAR_ICON_MAP } from '../../model/icon-map.constants'
import { groupModules } from '../../model/navigation.constants'

import { previewForegrounds, type PreviewDensity } from './preview.constants'

import type { SidebarModule, ThemeColors } from '@repo/shared-types'

interface PreviewSidebarProps {
  readonly colors: ThemeColors
  readonly radius: string
  readonly density: PreviewDensity
  readonly productName: string
  readonly logoPreview: string | null
  readonly modules: ReadonlyArray<SidebarModule>
}

export function PreviewSidebar({
  colors,
  radius,
  density,
  productName,
  logoPreview,
  modules,
}: Readonly<PreviewSidebarProps>) {
  const { t } = useTranslation()
  const fg = previewForegrounds(colors)

  return (
    <div
      className="flex w-40 shrink-0 flex-col border-r p-2.5"
      style={{
        gap: density.gap,
        background: colors.sidebar,
        borderColor: `${colors.sidebarForeground}15`,
      }}
    >
      <div className="mb-1 flex items-center gap-2 px-1.5 py-1">
        {logoPreview ? (
          <Image
            src={logoPreview}
            alt=""
            width={16}
            height={16}
            className="size-4 rounded object-contain"
          />
        ) : (
          <div className="size-4" style={{ background: colors.primary, borderRadius: radius }} />
        )}
        <span className="text-xs font-bold" style={{ color: fg.sidebar }}>
          {productName || 'Nexo CRM'}
        </span>
      </div>

      {groupModules(modules).map((group, gi) => (
        <div key={group.key} style={{ marginTop: gi > 0 ? density.gap : undefined }}>
          <p
            className="mb-0.5 px-1.5 font-semibold"
            style={{ fontSize: '9px', color: `${fg.sidebar}66` }}
          >
            {t(`nav.groups.${group.key}`)}
          </p>
          {group.modules.map((mod) => {
            const Icon = SIDEBAR_ICON_MAP[mod.icon]
            const isActive = mod.key === 'dashboard'
            return (
              <div
                key={mod.key}
                className="flex items-center gap-2"
                style={{
                  padding: `${density.py} ${density.px}`,
                  borderRadius: radius,
                  fontSize: '11px',
                  background: isActive ? colors.primary : 'transparent',
                  color: isActive ? colors.primaryForeground : `${fg.sidebar}B3`,
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {Icon ? <Icon style={{ width: 13, height: 13 }} /> : null}
                <span>{t(`nav.${mod.key}`, { defaultValue: mod.label })}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
