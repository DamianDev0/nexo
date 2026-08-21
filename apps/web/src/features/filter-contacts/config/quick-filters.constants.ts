import { ChartLineUpIcon, ShareNetworkIcon } from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'

export const QUICK_FILTER_IDS = ['lifecycleStage', 'source'] as const

export type QuickFilterId = (typeof QUICK_FILTER_IDS)[number]

export type QuickFilterState = Readonly<Record<QuickFilterId, ReadonlyArray<string>>>

export const EMPTY_QUICK_FILTERS: QuickFilterState = {
  lifecycleStage: [],
  source: [],
}

export const QUICK_FILTER_ICONS: Readonly<Record<QuickFilterId, AppIcon>> = {
  lifecycleStage: ChartLineUpIcon,
  source: ShareNetworkIcon,
}
