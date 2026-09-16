import type { ReactNode } from 'react'

export function PageState({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      {children}
    </div>
  )
}
