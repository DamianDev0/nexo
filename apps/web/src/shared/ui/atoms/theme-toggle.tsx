'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback } from 'react'

import { Button } from '@/shared/ui/shadcn/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const handleToggle = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="relative text-foreground/60 hover:text-foreground"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
