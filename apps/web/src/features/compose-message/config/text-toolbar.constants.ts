import { SHORTCUTS } from '@/shared/config/shortcuts'
import {
  LinkSimpleIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from '@/shared/ui/icons'

import type { MarkupActionId } from '../model/useBodyMarkup'
import type { AppIcon } from '@/shared/ui/icons'

export type TextToolbarButton = {
  readonly id: MarkupActionId
  readonly icon: AppIcon
  readonly keys: readonly string[]
}

export const TEXT_MARKUP_BUTTONS: ReadonlyArray<TextToolbarButton> = [
  { id: 'bold', icon: TextBIcon, keys: SHORTCUTS.bold },
  { id: 'italic', icon: TextItalicIcon, keys: SHORTCUTS.italic },
  { id: 'strike', icon: TextStrikethroughIcon, keys: SHORTCUTS.strikethrough },
  { id: 'bulletList', icon: ListBulletsIcon, keys: SHORTCUTS.bulletList },
  { id: 'numberedList', icon: ListNumbersIcon, keys: SHORTCUTS.numberedList },
  { id: 'insertLink', icon: LinkSimpleIcon, keys: SHORTCUTS.insertLink },
]
