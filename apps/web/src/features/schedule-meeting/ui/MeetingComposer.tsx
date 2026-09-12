'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { Text } from '@/shared/ui/atoms/text'
import { CalendarPanel } from '@/shared/ui/molecules/date-picker'
import { buildComposerControlLabels, Composer } from '@/shared/ui/organisms/composer'

import { formatDuration } from '../lib/meeting-window'
import { useMeetingComposer } from '../model/useMeetingComposer'

import { MeetingAssigneeField } from './containers/MeetingAssigneeField'
import { MeetingField } from './MeetingFields'
import { MeetingReminderField } from './MeetingReminderField'
import { MeetingTimeField } from './MeetingTimeField'

import type { ContactListItem } from '@repo/shared-types'

type MeetingComposerProps = {
  readonly contact: ContactListItem
  readonly onClose: () => void
}

export function MeetingComposer({ contact, onClose }: Readonly<MeetingComposerProps>) {
  const { t, i18n } = useTranslation()
  const { form, submit, isPending, durationMinutes } = useMeetingComposer(contact.id, onClose)
  const title = t('contacts.composers.meeting.title', { name: contactFullName(contact) })
  const { errors } = form.formState

  return (
    <Composer label={title} onClose={onClose}>
      <Composer.StandardHeader title={title} labels={buildComposerControlLabels(t)} />
      <Composer.Body className="grid gap-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <Controller
          control={form.control}
          name="date"
          render={({ field }) => (
            <CalendarPanel
              selected={field.value}
              onSelect={field.onChange}
              locale={i18n.language}
            />
          )}
        />
        <div className="flex min-w-0 flex-col gap-3">
          <MeetingField
            label={t('contacts.composers.meeting.titleLabel')}
            error={errors.title?.message}
          >
            <Composer.Input
              placeholder={t('contacts.composers.meeting.titlePlaceholder')}
              className="w-full"
              autoFocus
              {...form.register('title')}
            />
          </MeetingField>
          <div className="grid grid-cols-2 gap-3">
            <MeetingField
              label={t('contacts.composers.meeting.startTime')}
              error={errors.startTime?.message}
            >
              <Controller
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <MeetingTimeField
                    label={t('contacts.composers.meeting.startTime')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </MeetingField>
            <MeetingField
              label={t('contacts.composers.meeting.endTime')}
              error={errors.endTime?.message}
            >
              <Controller
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <MeetingTimeField
                    label={t('contacts.composers.meeting.endTime')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </MeetingField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MeetingField label={t('contacts.composers.meeting.reminder')}>
              <Controller
                control={form.control}
                name="reminderMinutes"
                render={({ field }) => (
                  <MeetingReminderField value={field.value} onChange={field.onChange} />
                )}
              />
            </MeetingField>
            <MeetingField label={t('contacts.composers.meeting.assignee')}>
              <Controller
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <MeetingAssigneeField value={field.value} onChange={field.onChange} />
                )}
              />
            </MeetingField>
          </div>
          <Composer.Textarea
            placeholder={t('contacts.composers.meeting.descriptionPlaceholder')}
            className="min-h-16"
            {...form.register('description')}
          />
        </div>
      </Composer.Body>
      <Composer.Footer>
        <Text variant="muted" className="tabular-nums">
          {t('contacts.composers.meeting.duration', { duration: formatDuration(durationMinutes) })}
        </Text>
        <Composer.FooterEnd>
          <Composer.Actions
            cancel={{ label: t('common.cancel'), onClick: onClose }}
            action={{
              label: t('contacts.composers.meeting.save'),
              onClick: submit,
              disabled: isPending,
            }}
          />
        </Composer.FooterEnd>
      </Composer.Footer>
    </Composer>
  )
}
