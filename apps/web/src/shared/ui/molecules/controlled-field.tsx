import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { FieldError } from './field-error'

interface ControlledFieldProps<T extends FieldValues> {
  readonly control: Control<T>
  readonly name: Path<T>
  readonly label: string
  readonly type?: string
  readonly placeholder?: string
  readonly autoComplete?: string
  readonly onValueChange?: (value: string, onChange: (value: string) => void) => void
  readonly hintFormat?: (value: string) => string
  readonly required?: boolean
  readonly onBlur?: () => void
}

export function ControlledField<T extends FieldValues>({
  control,
  name,
  label,
  type,
  placeholder,
  autoComplete,
  onValueChange,
  hintFormat,
  required,
  onBlur,
}: Readonly<ControlledFieldProps<T>>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel required={required}>{label}</FieldLabel>
          <Input
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="mt-1.5 h-10 border-border bg-surface-input text-sm"
            {...field}
            value={field.value ?? ''}
            onChange={
              onValueChange ? (e) => onValueChange(e.target.value, field.onChange) : field.onChange
            }
            onBlur={() => {
              field.onBlur()
              onBlur?.()
            }}
          />
          {hintFormat && (
            <span className="mt-1 block text-xs text-muted-foreground/50">
              {hintFormat(field.value ?? '')}
            </span>
          )}
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}
