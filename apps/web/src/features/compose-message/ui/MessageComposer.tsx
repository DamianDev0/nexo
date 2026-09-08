'use client'

import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { useFilePicker } from '@/shared/lib/hooks/useFilePicker'
import { Text } from '@/shared/ui/atoms/text'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { RichTextArea } from '@/shared/ui/molecules/rich-textarea'
import { buildComposerControlLabels, Composer } from '@/shared/ui/organisms/composer'

import { MESSAGE_ATTACH_ACCEPT, MESSAGE_MEDIA_ACCEPT } from '../config/message-channels'
import { channelHasSubject } from '../lib/message-form.schema'
import { useBodyMarkup } from '../model/useBodyMarkup'
import { useEmailEditor } from '../model/useEmailEditor'
import { useMessageComposer } from '../model/useMessageComposer'

import { EmailToolbar } from './EmailToolbar'
import { RecipientFields } from './RecipientFields'
import { TextToolbar } from './TextToolbar'

import type { MessageChannel } from '../config/message-channels'
import type { ContactListItem } from '@repo/shared-types'

type MessageComposerProps = {
  readonly channel: MessageChannel
  readonly contact: ContactListItem
  readonly onClose: () => void
}

export function MessageComposer({ channel, contact, onClose }: Readonly<MessageComposerProps>) {
  const { t } = useTranslation()
  const composer = useMessageComposer(channel, contact, onClose)
  const markup = useBodyMarkup(channel, composer.form)
  const email = useEmailEditor(composer.form)
  const isEmail = channel === 'email'
  const pickFile = useFilePicker({
    accept: MESSAGE_ATTACH_ACCEPT,
    multiple: true,
    onFiles: composer.addFiles,
  })
  const pickMedia = useFilePicker({
    accept: MESSAGE_MEDIA_ACCEPT,
    multiple: true,
    onFiles: composer.addFiles,
  })
  const title = t(`contacts.composers.message.title.${channel}`, { name: contactFullName(contact) })
  const controlLabels = buildComposerControlLabels(t)
  const { errors } = composer.form.formState
  const bodyField = composer.form.register('body')

  return (
    <Composer label={title} onClose={onClose}>
      <Composer.StandardHeader title={title} labels={controlLabels} />
      <RecipientFields composer={composer} isEmail={isEmail} />
      {channelHasSubject(channel) ? (
        <Composer.Field label={t('contacts.composers.message.subject')}>
          <Composer.Input
            placeholder={t('contacts.composers.message.subjectPlaceholder')}
            {...composer.form.register('subject')}
          />
        </Composer.Field>
      ) : null}
      <Composer.Body>
        {isEmail ? (
          <RichTextArea
            editor={email.editor}
            onChange={email.onBodyChange}
            placeholder={t('contacts.composers.message.bodyPlaceholder')}
            autoFocus
          />
        ) : (
          <Composer.Textarea
            placeholder={t('contacts.composers.message.bodyPlaceholder')}
            autoFocus
            {...bodyField}
            onKeyDown={markup.onKeyDown}
            ref={(el) => {
              bodyField.ref(el)
              markup.bodyRef.current = el
            }}
          />
        )}
        <FieldError message={errors.body?.message} />
      </Composer.Body>
      {composer.attachments.length > 0 ? (
        <Composer.Attachments>
          {composer.attachments.map((attachment) => (
            <Composer.Attachment
              key={attachment.id}
              name={attachment.name}
              size={attachment.size}
              removeLabel={t('composer.attachments.remove')}
              onRemove={() => composer.removeAttachment(attachment.id)}
            />
          ))}
        </Composer.Attachments>
      ) : null}
      <Composer.Footer>
        {isEmail ? (
          <EmailToolbar email={email} onPickFile={pickFile} onPickMedia={pickMedia} />
        ) : (
          <TextToolbar markup={markup} onPickFile={pickFile} onPickMedia={pickMedia} />
        )}
        {channel === 'sms' ? (
          <Text variant="hint" className="tabular-nums">
            {t('contacts.composers.message.characters', {
              used: composer.bodyLength,
              max: composer.bodyMax,
            })}
            {' · '}
            {t('contacts.composers.message.segments', { count: composer.segments })}
          </Text>
        ) : null}
        <Composer.Actions
          cancel={{ label: t('common.cancel'), onClick: onClose }}
          action={{
            label: t('contacts.composers.message.send'),
            disabled: !composer.sendAvailable || composer.isPending,
            hint: composer.sendAvailable ? undefined : t('contacts.composers.message.comingSoon'),
            onClick: composer.submit,
          }}
        />
      </Composer.Footer>
    </Composer>
  )
}
