'use client'

import { useTranslation } from 'react-i18next'

import { LoginForm, useLoginForm } from '@/features/login'
import { usePasswordToggle } from '@/shared/lib/hooks/usePasswordToggle'
import { Text } from '@/shared/ui/atoms/text'
import { AuthSplitView } from '@/widgets/auth-shell'

import { LoginBranding } from './LoginBranding'

export function LoginView() {
  const { t } = useTranslation()
  const { control, handleSubmit, isPending } = useLoginForm()
  const { showPassword, togglePassword } = usePasswordToggle()

  return (
    <AuthSplitView branding={<LoginBranding />} innerClassName="relative z-1 items-center">
      <LoginForm
        control={control}
        onSubmit={handleSubmit}
        isPending={isPending}
        showPassword={showPassword}
        onTogglePassword={togglePassword}
      />
      <div className="mt-8 flex flex-col gap-1.5 text-center lg:hidden">
        <h2 className="text-xl font-light text-foreground">
          {t('auth.mobileHeadline')}{' '}
          <em className="italic text-foreground/35">{t('auth.mobileHeadlineEm')}</em>
        </h2>
        <Text as="p" variant="hint" className="leading-relaxed">
          {t('auth.mobileSubline')}
        </Text>
      </div>
    </AuthSplitView>
  )
}
