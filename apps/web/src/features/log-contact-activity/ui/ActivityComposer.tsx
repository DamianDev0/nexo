'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { DatePicker } from '@/shared/ui/molecules/date-picker'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { buildComposerControlLabels, Composer } from '@/shared/ui/organisms/composer'

import { useActivityComposer } from '../model/useActivityComposer'

import type { ContactLogKind } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

type ActivityComposerProps = {
  readonly kind: ContactLogKind
  readonly contact: ContactListItem
  readonly onClose: () => void
}

export function ActivityComposer({ kind, contact, onClose }: Readonly<ActivityComposerProps>) {
  const { t } = useTranslation()
  const { form, submit, isPending } = useActivityComposer(kind, contact.id, onClose)
  const controlLabels = buildComposerControlLabels(t)
  const title = t(`contacts.composers.activity.title.${kind}`, { name: contactFullName(contact) })
  const { errors } = form.formState

  return (
    <Composer label={title} onClose={onClose}>
      <Composer.StandardHeader title={title} labels={controlLabels} />
      <Composer.Field
        label={t('contacts.composers.activity.titleLabel')}
        error={errors.title?.message}
      >
        <Composer.Input
          placeholder={t(`contacts.composers.activity.titlePlaceholder.${kind}`)}
          autoFocus
          {...form.register('title')}
        />
      </Composer.Field>
      <Composer.Field
        label={t('contacts.composers.activity.dueDate')}
        error={errors.dueDate?.message ?? errors.time?.message}
        end={
          <Composer.Input
            type="time"
            aria-label={t('contacts.composers.activity.time')}
            className="w-24"
            {...form.register('time')}
          />
        }
      >
        <Controller
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              aria-label={t('contacts.composers.activity.dueDate')}
              className="h-8 border-none bg-transparent px-0"
            />
          )}
        />
      </Composer.Field>
      <Composer.Body>
        <Composer.Textarea
          placeholder={t('contacts.composers.activity.descriptionPlaceholder')}
          className="min-h-24"
          {...form.register('description')}
        />
        <FieldError message={errors.description?.message} />
      </Composer.Body>
      <Composer.Footer>
        <Composer.Actions
          cancel={{ label: t('common.cancel'), onClick: onClose }}
          action={{
            label: t(`contacts.composers.activity.save.${kind}`),
            onClick: submit,
            disabled: isPending,
          }}
        />
      </Composer.Footer>
    </Composer>
  )
}
