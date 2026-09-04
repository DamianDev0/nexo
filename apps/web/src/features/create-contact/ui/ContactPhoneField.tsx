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

import type { ContactFormValues } from '../lib/contact-form.schema'
import type { Control } from 'react-hook-form'

type ContactPhoneFieldProps = {
  readonly control: Control<ContactFormValues>
  readonly name: 'phone' | 'whatsapp'
  readonly label: string
  readonly disabled?: boolean
  readonly onBlur?: () => void
}

export function ContactPhoneField({
  control,
  name,
  label,
  disabled = false,
  onBlur,
}: Readonly<ContactPhoneFieldProps>) {
  const { t } = useTranslation()
  const isWhatsapp = name === 'whatsapp'

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel>{label}</FieldLabel>
          <InputGroup
            className="mt-1.5 bg-surface-input aria-disabled:opacity-60"
            aria-disabled={disabled}
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
              value={formatCOPhone(field.value)}
              onChange={(event) => field.onChange(phoneDigits(event.target.value))}
              onBlur={() => {
                field.onBlur()
                onBlur?.()
              }}
            />
          </InputGroup>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}
