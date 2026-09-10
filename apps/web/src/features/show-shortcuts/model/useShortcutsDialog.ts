'use client'

import { useCallback, useState } from 'react'

import { useHotkey } from '@/shared/lib/hooks/useHotkey'

import { SHORTCUT_HELP_KEY } from '../config/shortcut-groups'

export function useShortcutsDialog() {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((current) => !current), [])

  useHotkey(SHORTCUT_HELP_KEY, toggle)

  return { open, setOpen }
}
