'use client'

import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ContactPhoneField } from '@/entities/contact'
import { SmoothCheckbox } from '@/shared/ui/smoothui/checkbox'

import type { ContactFormValues } from '../lib/contact-form.schema'
import type { Control } from 'react-hook-form'

export function ContactPhoneFields({
  control,
  onPhoneBlur,
}: Readonly<{ control: Control<ContactFormValues>; onPhoneBlur?: () => void }>) {
  const { t } = useTranslation()
  const sameAsPhone = useWatch({ control, name: 'whatsappSameAsPhone' })

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3.5">
        <ContactPhoneField
          control={control}
          name="phone"
          label={t('contacts.form.phone')}
          onBlur={onPhoneBlur}
        />
        <ContactPhoneField
          control={control}
          name="whatsapp"
          label={t('contacts.form.whatsapp')}
          view={{ disabled: sameAsPhone }}
        />
      </div>

      <Controller
        control={control}
        name="whatsappSameAsPhone"
        render={({ field }) => (
          <label
            htmlFor="whatsapp-same-as-phone"
            className="flex w-fit items-center gap-2 text-xs text-muted-foreground"
          >
            <SmoothCheckbox
              id="whatsapp-same-as-phone"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            {t('contacts.form.whatsappSameAsPhone')}
          </label>
        )}
      />
    </div>
  )
}
