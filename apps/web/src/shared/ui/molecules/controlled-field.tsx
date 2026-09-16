'use client'

import { useId } from 'react'
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
  const fieldId = useId()
  const errorId = `${fieldId}-error`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel htmlFor={fieldId} required={spec.required}>
            {spec.label}
          </FieldLabel>
          <Input
            id={fieldId}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={fieldState.error ? errorId : undefined}
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
            <span className="mt-1 block text-xs text-faint">{hintFormat(field.value ?? '')}</span>
          )}
          <FieldError id={errorId} message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}
