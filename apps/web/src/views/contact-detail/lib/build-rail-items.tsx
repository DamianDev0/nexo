import {
  BriefcaseIcon,
  CalendarBlankIcon,
  CheckSquareIcon,
  NotePencilIcon,
} from '@/shared/ui/icons'

import type { DetailPanelId } from '../config/detail-panels.constants'
import type { RailItem } from '@/shared/ui/organisms/record-layout'
import type { TFunction } from 'i18next'

export type DetailPanelCounts = Readonly<Record<DetailPanelId, number | undefined>>

const ICONS: Readonly<Record<DetailPanelId, React.ReactNode>> = {
  notes: <NotePencilIcon />,
  tasks: <CheckSquareIcon />,
  meetings: <CalendarBlankIcon />,
  deals: <BriefcaseIcon />,
}

const LABEL_KEYS: Readonly<Record<DetailPanelId, string>> = {
  notes: 'contacts.preview.sections.notes',
  tasks: 'contacts.preview.sections.tasks',
  meetings: 'contacts.preview.sections.meetings',
  deals: 'contacts.preview.sections.deals',
}

export function buildDetailRailItems(
  t: TFunction,
  counts: DetailPanelCounts,
  panels: ReadonlyArray<DetailPanelId>,
): ReadonlyArray<RailItem> {
  return panels.map((id) => ({
    id,
    label: t(LABEL_KEYS[id]),
    icon: ICONS[id],
    count: counts[id] === 0 ? undefined : counts[id],
  }))
}
