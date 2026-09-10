import {
  CalendarBlankIcon,
  CheckSquareIcon,
  ClockIcon,
  NotePencilIcon,
  TagIcon,
} from '@/shared/ui/icons'

import type { DetailPanelId } from '../config/detail-panels.constants'
import type { RailItem } from '@/shared/ui/organisms/record-layout'
import type { TFunction } from 'i18next'

export type DetailPanelCounts = Readonly<Record<DetailPanelId, number | undefined>>

const ICONS: Readonly<Record<DetailPanelId, React.ReactNode>> = {
  activity: <ClockIcon className="size-4" />,
  notes: <NotePencilIcon className="size-4" />,
  tasks: <CheckSquareIcon className="size-4" />,
  meetings: <CalendarBlankIcon className="size-4" />,
  tags: <TagIcon className="size-4" />,
}

const LABEL_KEYS: Readonly<Record<DetailPanelId, string>> = {
  activity: 'contacts.preview.sections.activity',
  notes: 'contacts.preview.sections.notes',
  tasks: 'contacts.preview.sections.tasks',
  meetings: 'contacts.preview.sections.meetings',
  tags: 'contacts.preview.sections.tags',
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
