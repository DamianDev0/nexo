'use client'

import data from '@emoji-mart/data'
import en from '@emoji-mart/data/i18n/en.json'
import es from '@emoji-mart/data/i18n/es.json'
import Picker from '@emoji-mart/react'
import { useTheme } from 'next-themes'

const I18N: Record<string, unknown> = { es, en }

export type EmojiPickerPanelProps = {
  readonly onPick: (emoji: string) => void
  readonly locale?: string
}

export function EmojiPickerPanel({ onPick, locale = 'es' }: Readonly<EmojiPickerPanelProps>) {
  const { resolvedTheme } = useTheme()
  return (
    <Picker
      data={data}
      i18n={I18N[locale] ?? I18N.es}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      onEmojiSelect={(emoji: { native: string }) => onPick(emoji.native)}
      previewPosition="none"
      skinTonePosition="search"
      navPosition="top"
      set="native"
      autoFocus
    />
  )
}
