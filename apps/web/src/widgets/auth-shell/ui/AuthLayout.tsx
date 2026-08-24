import { LanguageSwitcher } from '@/features/switch-language'
import { Text } from '@/shared/ui/atoms/text'
import { ThemeToggle } from '@/shared/ui/atoms/theme-toggle'

interface AuthLayoutProps {
  readonly children: React.ReactNode
}

export function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-foreground" />
          <Text variant="overline">Nexo</Text>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {children}
    </div>
  )
}
