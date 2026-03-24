import Image from 'next/image'
import type { SidebarModule, ThemeColors } from '@repo/shared-types'
import { SIDEBAR_ICON_MAP } from '../constants/icon-map.constants'
import { GOOGLE_FONT_MAP, RADIUS_MAP, DENSITY_MAP } from '../constants/appearance.constants'
import { deriveDarkPalette } from '../constants/palette.utils'

interface AppearanceLivePreviewProps {
  readonly colors: ThemeColors
  readonly darkMode: 'light' | 'dark' | 'system'
  readonly fontFamily: string
  readonly borderRadius: string
  readonly density: string
  readonly productName: string
  readonly logoPreview: string | null
  readonly navModules: ReadonlyArray<SidebarModule>
}

const KPI_DATA = [
  { label: 'Revenue', value: '$24.5K', trend: '+12%' },
  { label: 'Contacts', value: '1,284', trend: '+8%' },
  { label: 'Deals', value: '86', trend: '+23%' },
] as const

const TABLE_ROWS = [
  { name: 'Acme Corp', status: 'Won', value: '$12,400' },
  { name: 'TechFlow Inc', status: 'Active', value: '$8,200' },
  { name: 'DataSync Ltd', status: 'Active', value: '$4,100' },
  { name: 'CloudBase', status: 'Lost', value: '$3,600' },
] as const

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Won: { bg: '#05966920', text: '#059669' },
  Active: { bg: 'PRIMARY_TINT', text: 'PRIMARY' },
  Lost: { bg: '#DC262620', text: '#DC2626' },
}

export function AppearanceLivePreview({
  colors: lightColors,
  darkMode,
  fontFamily,
  borderRadius,
  density,
  productName,
  logoPreview,
  navModules,
}: AppearanceLivePreviewProps) {
  const isDark = darkMode === 'dark'
  const colors = isDark ? deriveDarkPalette(lightColors) : lightColors

  const fontFace =
    fontFamily === 'system' ? 'system-ui' : (GOOGLE_FONT_MAP[fontFamily] ?? 'system-ui')
  const r = RADIUS_MAP[borderRadius] ?? '8px'
  const d = DENSITY_MAP[density] ?? DENSITY_MAP.comfortable
  if (!d) return null

  const enabledModules = navModules.filter((m) => m.enabled)

  function statusStyle(status: string) {
    const s = STATUS_STYLES[status]
    if (!s) return {}
    return {
      background: s.bg === 'PRIMARY_TINT' ? `${colors.primary}18` : s.bg,
      color: s.text === 'PRIMARY' ? colors.primary : s.text,
    }
  }

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Live preview</span>
        <span className="text-xs text-muted-foreground">Updates in real time</span>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border shadow-sm"
        style={{ fontFamily: `'${fontFace}', system-ui, sans-serif` }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full bg-red-400/80" />
            <div className="size-2 rounded-full bg-amber-400/80" />
            <div className="size-2 rounded-full bg-emerald-400/80" />
          </div>
          <div className="ml-3 flex-1 rounded bg-background/60 px-2 py-0.5 text-center text-xs text-muted-foreground/60">
            app.nexo.com
          </div>
        </div>

        {/* App layout */}
        <div className="flex min-h-80">
          {/* Sidebar */}
          <div
            className="flex w-40 shrink-0 flex-col border-r p-2.5"
            style={{
              gap: d.gap,
              background: colors.sidebar,
              borderColor: `${colors.sidebarForeground}15`,
            }}
          >
            {/* Logo */}
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
                <div className="size-4" style={{ background: colors.primary, borderRadius: r }} />
              )}
              <span className="text-xs font-bold" style={{ color: colors.sidebarForeground }}>
                {productName || 'Nexo CRM'}
              </span>
            </div>

            {/* Nav items */}
            {enabledModules.map((mod, i) => {
              const Icon = SIDEBAR_ICON_MAP[mod.icon]
              const isActive = i === 0
              return (
                <div
                  key={mod.key}
                  className="flex items-center gap-2"
                  style={{
                    padding: `${d.py} ${d.px}`,
                    borderRadius: r,
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

          {/* Main content */}
          <div
            className="flex flex-1 flex-col overflow-hidden p-3"
            style={{ gap: d.gap, background: colors.secondary }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold" style={{ color: colors.sidebarForeground }}>
                  Dashboard
                </div>
                <div style={{ fontSize: '10px', color: `${colors.sidebarForeground}60` }}>
                  Welcome back
                </div>
              </div>
              <div
                className="px-2 py-1 text-xs font-medium"
                style={{
                  background: colors.primary,
                  color: colors.primaryForeground,
                  borderRadius: r,
                  fontSize: '10px',
                }}
              >
                + New deal
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-1.5">
              {KPI_DATA.map((kpi) => (
                <div
                  key={kpi.label}
                  className="p-2"
                  style={{
                    borderRadius: r,
                    background: colors.accent,
                    border: `1px solid ${colors.primary}12`,
                  }}
                >
                  <div style={{ fontSize: '9px', color: `${colors.sidebarForeground}70` }}>
                    {kpi.label}
                  </div>
                  <div
                    className="mt-0.5 font-bold"
                    style={{ fontSize: '12px', color: colors.sidebarForeground }}
                  >
                    {kpi.value}
                  </div>
                  <div
                    className="mt-0.5 font-medium"
                    style={{ fontSize: '9px', color: colors.primary }}
                  >
                    {kpi.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div
              className="flex-1 overflow-hidden"
              style={{ borderRadius: r, border: `1px solid ${colors.primary}10` }}
            >
              {/* Header */}
              <div
                className="flex px-2.5 py-1.5"
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: `${colors.sidebarForeground}60`,
                  background: colors.accent,
                  borderBottom: `1px solid ${colors.primary}10`,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase' as const,
                }}
              >
                <span className="w-2/5">Company</span>
                <span className="w-1/5">Status</span>
                <span className="w-1/5 text-right">Value</span>
                <span className="w-1/5 text-right">Stage</span>
              </div>
              {/* Rows */}
              {TABLE_ROWS.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center px-2.5 py-1.5"
                  style={{
                    fontSize: '10px',
                    borderBottom: `1px solid ${colors.primary}08`,
                    background: '#ffffff05',
                  }}
                >
                  <span className="w-2/5 font-medium" style={{ color: colors.sidebarForeground }}>
                    {row.name}
                  </span>
                  <span className="w-1/5">
                    <span
                      className="inline-block px-1.5 py-0.5"
                      style={{
                        ...statusStyle(row.status),
                        borderRadius: r,
                        fontSize: '9px',
                        fontWeight: 500,
                      }}
                    >
                      {row.status}
                    </span>
                  </span>
                  <span
                    className="w-1/5 text-right"
                    style={{ color: `${colors.sidebarForeground}80` }}
                  >
                    {row.value}
                  </span>
                  <span className="w-1/5 text-right">
                    <div
                      className="ml-auto h-1 w-10 overflow-hidden rounded-full"
                      style={{ background: `${colors.primary}20` }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: '60%', background: colors.primary }}
                      />
                    </div>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
