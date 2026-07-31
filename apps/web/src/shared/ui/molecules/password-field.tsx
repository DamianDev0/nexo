import { AnimatePresence, motion } from 'motion/react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { EyeIcon, EyeSlashIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'

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
          <Label className="text-xs text-muted-foreground">{copy.label}</Label>
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={visibility.shown ? 'off' : 'on'}
                  initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="flex"
                >
                  {visibility.shown ? (
                    <EyeSlashIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
          {showStrength && <PasswordStrengthMeter value={field.value ?? ''} />}
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}
