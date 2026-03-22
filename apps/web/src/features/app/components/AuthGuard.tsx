'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Skeleton } from '@/components/atoms/skeleton'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface AuthGuardProps {
  readonly children: React.ReactNode
}

/** Protects routes — redirects to login if not authenticated */
export function AuthGuard({ children }: AuthGuardProps) {
  const { data, isLoading, isError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace(ROUTES.auth.login)
    }
  }, [isLoading, isError, data, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-foreground" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              Nexo
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) return null

  return <>{children}</>
}
