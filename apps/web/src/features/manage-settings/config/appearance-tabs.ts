import type { SectionTab } from '@/shared/ui/molecules/section-tabs'

export const APPEARANCE_TAB_KEYS = ['brand', 'theme', 'typography'] as const

export type AppearanceTabKey = (typeof APPEARANCE_TAB_KEYS)[number]

export function buildAppearanceTabs(t: (key: string) => string): ReadonlyArray<SectionTab> {
  return APPEARANCE_TAB_KEYS.map((key) => ({
    key,
    label: t(`settings.appearanceTabs.${key}`),
  }))
}
