'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { t } from 'i18next'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { CHANNEL_SEND_ENABLED, MESSAGE_BODY_MAX } from '../config/message-channels'
import { buildMessageSchema, messageDefaults } from '../lib/message-form.schema'
import { smsSegments } from '../lib/sms-segments'
import { useSendMessage } from '../query/useSendMessage'

import type { MessageChannel } from '../config/message-channels'
import type { MessageFormValues, RecipientSource } from '../lib/message-form.schema'

export type MessageAttachment = {
  readonly id: string
  readonly name: string
  readonly size: number
  readonly file: File
}

export function useMessageComposer(
  channel: MessageChannel,
  contact: RecipientSource,
  onDone: () => void,
) {
  const schema = useMemo(() => buildMessageSchema(t, channel), [channel])
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: messageDefaults(channel, contact),
  })
  const [attachments, setAttachments] = useState<readonly MessageAttachment[]>([])
  const [ccVisible, setCcVisible] = useState(false)
  const [bccVisible, setBccVisible] = useState(false)

  const showCc = useCallback(() => setCcVisible(true), [])
  const showBcc = useCallback(() => setBccVisible(true), [])
  const hideCc = useCallback(() => {
    setCcVisible(false)
    form.setValue('cc', '')
  }, [form])
  const hideBcc = useCallback(() => {
    setBccVisible(false)
    form.setValue('bcc', '')
  }, [form])

  const addFiles = useCallback((files: readonly File[]) => {
    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        file,
      })),
    ])
  }, [])

  const removeAttachment = useCallback((id: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id))
  }, [])

  const { mutate, isPending } = useSendMessage()
  const sendAvailable = CHANNEL_SEND_ENABLED[channel]

  const submit = form.handleSubmit((values) => {
    mutate(
      { channel, to: values.to, body: values.body, contactId: contact.id },
      { onSuccess: onDone },
    )
  })

  const body = form.watch('body')
  const segments = useMemo(
    () => (channel === 'sms' ? smsSegments(body).segments : 0),
    [channel, body],
  )

  return {
    form,
    attachments,
    addFiles,
    removeAttachment,
    extras: { ccVisible, bccVisible, showCc, showBcc, hideCc, hideBcc },
    bodyLength: body.length,
    bodyMax: MESSAGE_BODY_MAX[channel],
    segments,
    sendAvailable,
    submit,
    isPending,
  }
}
