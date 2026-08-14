'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { CREATE_PARAM } from '@/shared/config/routes'

export function useCreateFromUrl(openCreate: () => void) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const requested = params.get(CREATE_PARAM) === '1'

  useEffect(() => {
    if (!requested) return

    openCreate()

    const next = new URLSearchParams(params)
    next.delete(CREATE_PARAM)
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [requested, openCreate, params, pathname, router])
}
