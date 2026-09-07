'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { SmoothInput } from '@/shared/ui/smoothui/input'

import type { CONTACT_DETAILS_FIELDS } from '../config/contact-details-fields'
import type { ContactDetailsValues } from '../lib/contact-details-form.schema'
import type { Control } from 'react-hook-form'

type ContactDetailsInputProps = {
  readonly control: Control<ContactDetailsValues>
  readonly spec: (typeof CONTACT_DETAILS_FIELDS)[number]
  readonly state: { readonly id: string; readonly readOnly: boolean; readonly missingHint?: string }
  readonly onCommit: () => void
}

export function ContactDetailsInput({
  control,
  spec,
  state,
  onCommit,
}: Readonly<ContactDetailsInputProps>) {
  const { t } = useTranslation()
  const inputId = `${state.id}-${spec.name}`

  return (
    <Controller
      control={control}
      name={spec.name}
      render={({ field, fieldState }) => {
        const message =
          fieldState.error?.message ?? (fieldState.isDirty ? undefined : state.missingHint)
        return (
          <div>
            <FieldLabel htmlFor={inputId} required={spec.name === 'firstName'}>
              {t(spec.labelKey)}
            </FieldLabel>
            <SmoothInput
              id={inputId}
              type={spec.type}
              autoComplete={spec.autoComplete}
              placeholder={t(spec.placeholderKey)}
              readOnly={state.readOnly}
              aria-invalid={message ? true : undefined}
              className="mt-1 h-9 border-border bg-surface-input text-sm"
              {...field}
              onBlur={() => {
                field.onBlur()
                onCommit()
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
              }}
            />
            {message ? <FieldError message={message} /> : null}
          </div>
        )
      }}
    />
  )
}
