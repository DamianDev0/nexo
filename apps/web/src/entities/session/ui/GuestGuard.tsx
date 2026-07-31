'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { ROUTES } from '@/shared/config/routes'

import { useAuth } from '../query/useAuth'

interface GuestGuardProps {
  readonly children: React.ReactNode
}

export function GuestGuard({ children }: Readonly<GuestGuardProps>) {
  const { data, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && data) {
      router.replace(data.onboardingCompleted ? ROUTES.app.dashboard : '/onboarding/setup')
    }
  }, [isLoading, data, router])

  if (isLoading) return null
  if (data) return null

  return <>{children}</>
}
