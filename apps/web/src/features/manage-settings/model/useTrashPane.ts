'use client'

import { useState } from 'react'

import { TRASH_TABS, type TrashTab } from '../config/trash.constants'

function isTrashTab(value: string): value is TrashTab {
  return TRASH_TABS.some((tab) => tab === value)
}

export function useTrashPane() {
  const [tab, setTab] = useState<TrashTab>('contacts')

  return {
    tab,
    tabs: TRASH_TABS,
    onTabChange: (value: string) => {
      if (isTrashTab(value)) setTab(value)
    },
  }
}
