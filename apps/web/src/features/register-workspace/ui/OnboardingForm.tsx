import Link from 'next/link'
import { type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { LiquidButton } from '@/shared/ui/atoms/liquid-button'
import { AuthFooter } from '@/shared/ui/molecules/auth-footer'
import { ControlledField } from '@/shared/ui/molecules/controlled-field'
import { PasswordField } from '@/shared/ui/molecules/password-field'

import type { OnboardingFormValues } from '../model/onboarding.schema'

interface OnboardingFormProps {
  readonly control: Control<OnboardingFormValues>
  readonly onSubmit: () => void
  readonly isPending: boolean
  readonly showPassword: boolean
  readonly onTogglePassword: () => void
  readonly onBusinessNameChange: (value: string, onChange: (value: string) => void) => void
}

export function OnboardingForm({
  control,
  onSubmit,
  isPending,
  showPassword,
  onTogglePassword,
  onBusinessNameChange,
}: Readonly<OnboardingFormProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('auth.createAccount')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
            {t('auth.logIn')}
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <ControlledField
          control={control}
          name="businessName"
          label={t('auth.businessName')}
          placeholder="Nexo Acme"
          onValueChange={onBusinessNameChange}
        />

        <ControlledField
          control={control}
          name="slug"
          label={t('auth.workspaceUrl')}
          placeholder="nexo-acme"
          hintFormat={(value) => `nexo.app/${value || 'your-slug'}`}
        />

        <ControlledField
          control={control}
          name="ownerFullName"
          label={t('auth.fullName')}
          placeholder="Acme Corporation"
        />

        <ControlledField
          control={control}
          name="ownerEmail"
          label={t('auth.workEmail')}
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          autoComplete="email"
        />

        <PasswordField
          control={control}
          name="ownerPassword"
          label={t('auth.password')}
          placeholder={t('auth.passwordMinPlaceholder')}
          autoComplete="new-password"
          showPassword={showPassword}
          onToggle={onTogglePassword}
        />

        <LiquidButton
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 w-full rounded-lg text-sm font-bold"
        >
          {isPending ? t('auth.creatingWorkspace') : t('auth.createWorkspace')}
        </LiquidButton>
      </form>

      <AuthFooter />
    </div>
  )
}
