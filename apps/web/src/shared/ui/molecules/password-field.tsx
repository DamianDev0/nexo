import { Eye, EyeOff } from 'lucide-react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'

import { FieldError } from './field-error'

interface PasswordFieldProps<T extends FieldValues> {
  readonly control: Control<T>
  readonly name: Path<T>
  readonly label: string
  readonly placeholder: string
  readonly autoComplete: string
  readonly showPassword: boolean
  readonly onToggle: () => void
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoComplete,
  showPassword,
  onToggle,
}: Readonly<PasswordFieldProps<T>>) {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <div className="relative mt-1.5">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className="h-10 border-border bg-surface-input pr-10 text-sm"
              {...field}
              value={field.value ?? ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={onToggle}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}
