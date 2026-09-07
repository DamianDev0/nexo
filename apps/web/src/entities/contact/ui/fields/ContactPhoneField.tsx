'use client'

import { formatCOPhone, phoneDigits } from '@repo/shared-utils'
import Image from 'next/image'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { COLOMBIA_FLAG_SRC, PHONE_PREFIX, WHATSAPP_ICON_SRC } from '@/shared/config/colombia'
import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { Text } from '@/shared/ui/atoms/text'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/shadcn/input-group'

import type { Control, FieldValues, Path } from 'react-hook-form'

export type ContactPhoneFieldName<T extends FieldValues> = Extract<Path<T>, 'phone' | 'whatsapp'>

export type ContactPhoneFieldView = {
  readonly disabled?: boolean
  readonly hint?: string
  readonly compact?: boolean
}

type ContactPhoneFieldProps<T extends FieldValues> = {
  readonly control: Control<T>
  readonly name: ContactPhoneFieldName<T>
  readonly label: string
  readonly onBlur?: () => void
  readonly view?: ContactPhoneFieldView
}

export function ContactPhoneField<T extends FieldValues>({
  control,
  name,
  label,
  onBlur,
  view,
}: Readonly<ContactPhoneFieldProps<T>>) {
  const { t } = useTranslation()
  const isWhatsapp = name === 'whatsapp'
  const disabled = view?.disabled ?? false

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const message = fieldState.error?.message ?? (fieldState.isDirty ? undefined : view?.hint)
        return (
          <div>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup
              className={view?.compact ? 'mt-1 bg-surface-input' : 'mt-1.5 bg-surface-input'}
              aria-disabled={disabled}
              aria-invalid={message ? true : undefined}
            >
              <InputGroupAddon className="gap-2 border-r border-border/70 pr-2.5">
                <Image
                  src={isWhatsapp ? WHATSAPP_ICON_SRC : COLOMBIA_FLAG_SRC}
                  alt={t(isWhatsapp ? 'contacts.form.whatsappAlt' : 'contacts.form.countryAlt')}
                  width={16}
                  height={16}
                  className={isWhatsapp ? 'size-4' : 'size-4 rounded-full'}
                />
                <Text variant="emphasis" className="text-foreground/70">
                  {PHONE_PREFIX}
                </Text>
              </InputGroupAddon>
              <InputGroupInput
                className="text-sm tabular-nums"
                placeholder="300 123 4567"
                inputMode="tel"
                autoComplete="tel-national"
                disabled={disabled}
                value={formatCOPhone(String(field.value ?? ''))}
                onChange={(event) => field.onChange(phoneDigits(event.target.value))}
                onBlur={() => {
                  field.onBlur()
                  onBlur?.()
                }}
              />
            </InputGroup>
            {view?.compact && !message ? null : <FieldError message={message} />}
          </div>
        )
      }}
    />
  )
}
