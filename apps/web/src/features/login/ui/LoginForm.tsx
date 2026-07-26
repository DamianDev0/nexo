import Link from 'next/link'
import { type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AuthFooter } from '@/shared/ui/molecules/auth-footer'
import { ControlledField } from '@/shared/ui/molecules/controlled-field'
import { PasswordField } from '@/shared/ui/molecules/password-field'
import { Button } from '@/shared/ui/shadcn/button'
import { Checkbox } from '@/shared/ui/shadcn/checkbox'
import { Label } from '@/shared/ui/shadcn/label'

import type { LoginFormValues } from '../model/login.schema'

interface LoginFormProps {
  readonly control: Control<LoginFormValues>
  readonly onSubmit: () => void
  readonly isPending: boolean
  readonly showPassword: boolean
  readonly onTogglePassword: () => void
}

export function LoginForm({
  control,
  onSubmit,
  isPending,
  showPassword,
  onTogglePassword,
}: LoginFormProps) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div>
        <span className="text-sm font-medium text-muted-foreground">{t('auth.welcomeBack')}</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {t('auth.logIn')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link
            href="/onboarding"
            className="font-medium text-foreground underline underline-offset-2"
          >
            {t('auth.signUpFree')}
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <ControlledField
          control={control}
          name="email"
          label={t('auth.email')}
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          autoComplete="email"
        />

        <PasswordField
          control={control}
          name="password"
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="current-password"
          showPassword={showPassword}
          onToggle={onTogglePassword}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="remember"
              className="border-foreground/40 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground"
            />
            <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
              {t('auth.rememberMe')}
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 w-full rounded-lg text-sm font-bold"
        >
          {isPending ? t('auth.loggingIn') : t('auth.logInToNexo')}
        </Button>
      </form>

      <AuthFooter />
    </div>
  )
}
