import type { ContactsSkeletonHint } from '@/entities/contact'

export const DEFAULT_SKELETON_HINT: ContactsSkeletonHint = {
  widths: [40, 220, 150, 190, 130, 110],
  rows: 8,
}

export const HEADER_TABS = [
  ['all', 'w-24'],
  ['new', 'w-16'],
  ['contacted', 'w-28'],
  ['qualified', 'w-20'],
  ['nurturing', 'w-20'],
] as const
