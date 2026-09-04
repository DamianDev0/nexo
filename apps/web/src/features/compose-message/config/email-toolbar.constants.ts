import {
  ArrowClockwiseIcon,
  ArrowUUpLeftIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  ProhibitIcon,
  TextStrikethroughIcon,
} from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'

export type EmailToolbarCommand = {
  readonly id: string
  readonly command: string
  readonly icon: AppIcon
}

export const EMAIL_MORE_COMMANDS: ReadonlyArray<EmailToolbarCommand> = [
  { id: 'strike', command: 'strikeThrough', icon: TextStrikethroughIcon },
  { id: 'bulletList', command: 'insertUnorderedList', icon: ListBulletsIcon },
  { id: 'numberedList', command: 'insertOrderedList', icon: ListNumbersIcon },
  { id: 'undo', command: 'undo', icon: ArrowUUpLeftIcon },
  { id: 'redo', command: 'redo', icon: ArrowClockwiseIcon },
  { id: 'clearFormat', command: 'removeFormat', icon: ProhibitIcon },
]
