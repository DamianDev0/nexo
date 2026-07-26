import { PREVIEW_ROW_OVERLAY } from '@/shared/config/tokens/effects'

import { KPI_DATA, TABLE_ROWS, statusStyle } from './preview.constants'

import type { ThemeColors } from '@repo/shared-types'

interface PreviewMainProps {
  readonly colors: ThemeColors
  readonly radius: string
  readonly gap: string
}

export function PreviewMain({ colors, radius, gap }: Readonly<PreviewMainProps>) {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden p-3"
      style={{ gap, background: colors.secondary }}
    >
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
            borderRadius: radius,
            fontSize: '10px',
          }}
        >
          + New deal
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {KPI_DATA.map((kpi) => (
          <div
            key={kpi.label}
            className="p-2"
            style={{
              borderRadius: radius,
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
            <div className="mt-0.5 font-medium" style={{ fontSize: '9px', color: colors.primary }}>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex-1 overflow-hidden"
        style={{ borderRadius: radius, border: `1px solid ${colors.primary}10` }}
      >
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
        {TABLE_ROWS.map((row) => (
          <div
            key={row.name}
            className="flex items-center px-2.5 py-1.5"
            style={{
              fontSize: '10px',
              borderBottom: `1px solid ${colors.primary}08`,
              background: PREVIEW_ROW_OVERLAY,
            }}
          >
            <span className="w-2/5 font-medium" style={{ color: colors.sidebarForeground }}>
              {row.name}
            </span>
            <span className="w-1/5">
              <span
                className="inline-block px-1.5 py-0.5"
                style={{
                  ...statusStyle(row.status, colors.primary),
                  borderRadius: radius,
                  fontSize: '9px',
                  fontWeight: 500,
                }}
              >
                {row.status}
              </span>
            </span>
            <span className="w-1/5 text-right" style={{ color: `${colors.sidebarForeground}80` }}>
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
  )
}
