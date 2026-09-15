import type { ContactsSkeletonHint } from '@/entities/contact'

export const DEFAULT_SKELETON_HINT: ContactsSkeletonHint = {
  widths: [40, 240, 150, 210, 130, 160, 150, 130, 150, 120, 130],
  rows: 10,
}

export const HEADER_TABS = [
  ['all', 'w-24'],
  ['new', 'w-16'],
  ['contacted', 'w-28'],
  ['qualified', 'w-20'],
  ['nurturing', 'w-20'],
] as const
