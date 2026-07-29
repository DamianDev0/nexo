'use client'

import { ContactStatus } from '@repo/shared-types'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ControlledField } from '@/shared/ui/molecules/controlled-field'
import { Label } from '@/shared/ui/shadcn/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import { ContactPhoneField } from './ContactPhoneField'

import type { ContactFormValues } from '../model/contact-form.schema'
import type { Control } from 'react-hook-form'

export function ContactFormFields({ control }: Readonly<{ control: Control<ContactFormValues> }>) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3.5">
        <ControlledField
          control={control}
          name="firstName"
          label={t('contacts.form.firstName')}
          placeholder={t('contacts.form.firstNamePlaceholder')}
          required
        />
        <ControlledField
          control={control}
          name="lastName"
          label={t('contacts.form.lastName')}
          placeholder={t('contacts.form.lastNamePlaceholder')}
        />
      </div>
      <ControlledField
        control={control}
        name="email"
        type="email"
        label={t('contacts.form.email')}
        placeholder={t('contacts.form.emailPlaceholder')}
      />
      <div className="grid grid-cols-2 gap-3.5">
        <ContactPhoneField control={control} name="phone" label={t('contacts.form.phone')} />
        <ContactPhoneField control={control} name="whatsapp" label={t('contacts.form.whatsapp')} />
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <ControlledField
          control={control}
          name="city"
          label={t('contacts.form.city')}
          placeholder={t('contacts.form.cityPlaceholder')}
        />
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div>
              <Label className="text-xs text-muted-foreground">{t('contacts.form.status')}</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5 h-10! w-full border-border bg-surface-input text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ContactStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`contacts.status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>
    </div>
  )
}
