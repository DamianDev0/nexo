import { ContactSource, LifecycleStage } from '@repo/shared-types'

import { ChartLineUpIcon, ShareNetworkIcon } from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'

export const QUICK_FILTER_IDS = ['lifecycleStage', 'source'] as const

export type QuickFilterId = (typeof QUICK_FILTER_IDS)[number]

export const QUICK_FILTER_OPTIONS: Readonly<Record<QuickFilterId, ReadonlyArray<string>>> = {
  lifecycleStage: Object.values(LifecycleStage),
  source: Object.values(ContactSource),
}

export type QuickFilterState = Readonly<Record<QuickFilterId, ReadonlyArray<string>>>

export const EMPTY_QUICK_FILTERS: QuickFilterState = {
  lifecycleStage: [],
  source: [],
}

export const QUICK_FILTER_ICONS: Readonly<Record<QuickFilterId, AppIcon>> = {
  lifecycleStage: ChartLineUpIcon,
  source: ShareNetworkIcon,
}
