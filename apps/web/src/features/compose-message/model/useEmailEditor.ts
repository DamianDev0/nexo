'use client'

import { useCallback } from 'react'

import { useRichEditor } from '@/shared/ui/molecules/rich-textarea'

import type { MessageFormValues } from '../lib/message-form.schema'
import type { UseFormReturn } from 'react-hook-form'

export function useEmailEditor(form: UseFormReturn<MessageFormValues>) {
  const editor = useRichEditor()

  const onBodyChange = useCallback(
    (html: string) => form.setValue('body', html, { shouldDirty: true }),
    [form],
  )

  const insertEmoji = useCallback(
    (emoji: string) => {
      editor.restoreSelection()
      editor.exec('insertText', emoji)
    },
    [editor],
  )

  const setColor = useCallback(
    (color: string) => {
      editor.restoreSelection()
      editor.exec('foreColor', color)
    },
    [editor],
  )

  const applyLink = useCallback(
    (url: string) => {
      editor.restoreSelection()
      editor.exec('createLink', url)
    },
    [editor],
  )

  return { editor, onBodyChange, insertEmoji, setColor, applyLink }
}

export type EmailEditor = ReturnType<typeof useEmailEditor>
