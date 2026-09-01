import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { FieldError } from './field-error'

export type ControlledFieldSpec = {
  readonly label: string
  readonly type?: string
  readonly placeholder?: string
  readonly autoComplete?: string
  readonly required?: boolean
}

export type ControlledFieldActions = {
  readonly onValueChange?: (value: string, onChange: (value: string) => void) => void
  readonly onBlur?: () => void
}

interface ControlledFieldProps<T extends FieldValues> {
  readonly control: Control<T>
  readonly name: Path<T>
  readonly field: ControlledFieldSpec
  readonly actions?: ControlledFieldActions
  readonly hintFormat?: (value: string) => string
}

export function ControlledField<T extends FieldValues>({
  control,
  name,
  field: spec,
  actions,
  hintFormat,
}: Readonly<ControlledFieldProps<T>>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel required={spec.required}>{spec.label}</FieldLabel>
          <Input
            type={spec.type}
            placeholder={spec.placeholder}
            autoComplete={spec.autoComplete}
            className="mt-1.5 h-10 border-border bg-surface-input text-sm"
            {...field}
            value={field.value ?? ''}
            onChange={
              actions?.onValueChange
                ? (e) => actions.onValueChange?.(e.target.value, field.onChange)
                : field.onChange
            }
            onBlur={() => {
              field.onBlur()
              actions?.onBlur?.()
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
