import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { EyeMorph, EyeSlashMorph, MorphIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { FieldError } from './field-error'
import { PasswordStrengthMeter } from './password-strength'

interface PasswordVisibility {
  readonly shown: boolean
  readonly onToggle: () => void
}

interface PasswordFieldCopy {
  readonly label: string
  readonly placeholder: string
  readonly autoComplete: string
}

interface PasswordFieldProps<T extends FieldValues> {
  readonly control: Control<T>
  readonly name: Path<T>
  readonly copy: PasswordFieldCopy
  readonly visibility: PasswordVisibility
  readonly showStrength?: boolean
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  copy,
  visibility,
  showStrength = false,
}: Readonly<PasswordFieldProps<T>>) {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel>{copy.label}</FieldLabel>
          <div className="relative mt-1.5">
            <Input
              type={visibility.shown ? 'text' : 'password'}
              placeholder={copy.placeholder}
              autoComplete={copy.autoComplete}
              className="h-10 border-border bg-surface-input pr-10 text-sm"
              {...field}
              value={field.value ?? ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={visibility.onToggle}
              aria-label={visibility.shown ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              <MorphIcon
                icon={visibility.shown ? EyeSlashMorph : EyeMorph}
                reducedMotion="user"
                className="size-4"
              />
            </Button>
          </div>
          {showStrength && <PasswordStrengthMeter value={field.value ?? ''} />}
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}
