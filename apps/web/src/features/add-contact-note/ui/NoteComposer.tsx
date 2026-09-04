'use client'

import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { Text } from '@/shared/ui/atoms/text'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { buildComposerControlLabels, Composer } from '@/shared/ui/organisms/composer'

import { useNoteComposer } from '../model/useNoteComposer'

import type { ContactListItem } from '@repo/shared-types'

type NoteComposerProps = {
  readonly contact: ContactListItem
  readonly onClose: () => void
}

export function NoteComposer({ contact, onClose }: Readonly<NoteComposerProps>) {
  const { t } = useTranslation()
  const { form, submit, isPending, bodyLength, bodyMax } = useNoteComposer(contact.id, onClose)
  const controlLabels = buildComposerControlLabels(t)
  const name = contactFullName(contact)

  return (
    <Composer label={t('contacts.composers.note.title', { name })} onClose={onClose}>
      <Composer.StandardHeader
        title={t('contacts.composers.note.title', { name })}
        labels={controlLabels}
      />
      <Composer.Body>
        <Composer.Textarea
          placeholder={t('contacts.composers.note.placeholder')}
          autoFocus
          {...form.register('body')}
        />
        <FieldError message={form.formState.errors.body?.message} />
      </Composer.Body>
      <Composer.Footer>
        <Text variant="hint" className="tabular-nums">
          {t('contacts.composers.message.characters', { used: bodyLength, max: bodyMax })}
        </Text>
        <Composer.Actions
          cancel={{ label: t('common.cancel'), onClick: onClose }}
          action={{
            label: t('contacts.composers.note.save'),
            onClick: submit,
            disabled: isPending,
          }}
        />
      </Composer.Footer>
    </Composer>
  )
}
