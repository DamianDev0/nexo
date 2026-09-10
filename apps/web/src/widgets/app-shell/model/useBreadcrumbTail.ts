'use client'

import { useEffect } from 'react'

import { useBreadcrumbTailStore } from './breadcrumb-tail.store'

export function useBreadcrumbTail(label: string | null): void {
  const setLabel = useBreadcrumbTailStore((state) => state.setLabel)

  useEffect(() => {
    setLabel(label)
    return () => setLabel(null)
  }, [label, setLabel])
}
