import Image from 'next/image'

import { SIDEBAR_ICON_MAP } from '../../model/icon-map.constants'

import type { PreviewDensity } from './preview.constants'
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
}: PreviewSidebarProps) {
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
        <span className="text-xs font-bold" style={{ color: colors.sidebarForeground }}>
          {productName || 'Nexo CRM'}
        </span>
      </div>

      {modules.map((mod, i) => {
        const Icon = SIDEBAR_ICON_MAP[mod.icon]
        const isActive = i === 0
        return (
          <div
            key={mod.key}
            className="flex items-center gap-2"
            style={{
              padding: `${density.py} ${density.px}`,
              borderRadius: radius,
              fontSize: '11px',
              background: isActive ? colors.primary : 'transparent',
              color: isActive ? colors.primaryForeground : `${colors.sidebarForeground}99`,
              fontWeight: isActive ? 500 : 400,
            }}
          >
            {Icon ? <Icon style={{ width: 13, height: 13 }} /> : null}
            <span>{mod.label}</span>
          </div>
        )
      })}
    </div>
  )
}
