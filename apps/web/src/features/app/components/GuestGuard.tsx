'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface GuestGuardProps {
  readonly children: React.ReactNode
}

/** Protects auth routes — redirects to dashboard if already authenticated */
export function GuestGuard({ children }: GuestGuardProps) {
  const { data, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && data) {
      router.replace(ROUTES.app.dashboard)
    }
  }, [isLoading, data, router])

  if (isLoading) return null
  if (data) return null

  return <>{children}</>
}
