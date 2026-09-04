'use client'

import { useCallback, useMemo, useRef } from 'react'

import { SHORTCUTS } from '@/shared/config/shortcuts'
import { matchesShortcut } from '@/shared/lib/keyboard'
import { insertLink, insertText, toggleLinePrefix, wrapInline } from '@/shared/lib/text-markup'

import { CHANNEL_HAS_LISTS, CHANNEL_MARKS } from '../config/message-channels'

import type { MessageChannel } from '../config/message-channels'
import type { MessageFormValues } from '../lib/message-form.schema'
import type { MarkupResult, SelectionRange } from '@/shared/lib/text-markup'
import type { KeyboardEvent } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export type MarkupActionId =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'bulletList'
  | 'numberedList'
  | 'insertLink'

type Transform = (value: string, range: SelectionRange) => MarkupResult

export function useBodyMarkup(channel: MessageChannel, form: UseFormReturn<MessageFormValues>) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)

  const apply = useCallback(
    (transform: Transform) => {
      const el = bodyRef.current
      if (!el) return
      const result = transform(el.value, { start: el.selectionStart, end: el.selectionEnd })
      form.setValue('body', result.value, { shouldDirty: true })
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(result.start, result.end)
      })
    },
    [form],
  )

  const actions = useMemo(() => {
    const marks = CHANNEL_MARKS[channel]
    if (!marks) return {} as Partial<Record<MarkupActionId, () => void>>
    const base: Partial<Record<MarkupActionId, () => void>> = {
      bold: () => apply((value, range) => wrapInline(value, range, marks.bold)),
      italic: () => apply((value, range) => wrapInline(value, range, marks.italic)),
      strike: () => apply((value, range) => wrapInline(value, range, marks.strike)),
    }
    if (CHANNEL_HAS_LISTS[channel]) {
      base.bulletList = () => apply((value, range) => toggleLinePrefix(value, range, 'bullet'))
      base.numberedList = () => apply((value, range) => toggleLinePrefix(value, range, 'numbered'))
      base.insertLink = () => apply(insertLink)
    }
    return base
  }, [channel, apply])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const bindings: ReadonlyArray<readonly [readonly string[], (() => void) | undefined]> = [
        [SHORTCUTS.bold, actions.bold],
        [SHORTCUTS.italic, actions.italic],
        [SHORTCUTS.strikethrough, actions.strike],
        [SHORTCUTS.bulletList, actions.bulletList],
        [SHORTCUTS.numberedList, actions.numberedList],
        [SHORTCUTS.insertLink, actions.insertLink],
      ]
      for (const [keys, run] of bindings) {
        if (run && matchesShortcut(event, keys)) {
          event.preventDefault()
          run()
          return
        }
      }
    },
    [actions],
  )

  const insertEmoji = useCallback(
    (emoji: string) => apply((value, range) => insertText(value, range, emoji)),
    [apply],
  )

  return { bodyRef, actions, onKeyDown, insertEmoji, enabled: CHANNEL_MARKS[channel] !== null }
}

export type BodyMarkup = ReturnType<typeof useBodyMarkup>
