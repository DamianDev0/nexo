import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { MessageChannel } from '@/features/compose-message'
import type { MessageFormValues } from '@/features/compose-message/lib/message-form.schema'

import { useBodyMarkup } from '@/features/compose-message/model/useBodyMarkup'

beforeAll(() => {
  Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', configurable: true })
})

function setup(channel: MessageChannel, body: string, start: number, end: number) {
  const rendered = renderHook(() => {
    const form = useForm<MessageFormValues>({
      defaultValues: { to: '', cc: '', bcc: '', subject: '', body: '' },
    })
    return { form, markup: useBodyMarkup(channel, form) }
  })
  const el = document.createElement('textarea')
  el.value = body
  document.body.appendChild(el)
  el.setSelectionRange(start, end)
  rendered.result.current.markup.bodyRef.current = el
  return { ...rendered, el }
}

describe('useBodyMarkup', () => {
  it('wraps the selection with channel-specific bold markers', () => {
    const email = setup('email', 'hola mundo', 5, 10)
    act(() => email.result.current.markup.actions.bold?.())
    expect(email.result.current.form.getValues('body')).toBe('hola **mundo**')

    const wa = setup('whatsapp', 'hola mundo', 5, 10)
    act(() => wa.result.current.markup.actions.bold?.())
    expect(wa.result.current.form.getValues('body')).toBe('hola *mundo*')
  })

  it('offers lists and links only on email', () => {
    const email = setup('email', 'x', 0, 0)
    expect(email.result.current.markup.actions.bulletList).toBeDefined()
    expect(email.result.current.markup.actions.insertLink).toBeDefined()

    const wa = setup('whatsapp', 'x', 0, 0)
    expect(wa.result.current.markup.actions.bulletList).toBeUndefined()
    expect(wa.result.current.markup.actions.strike).toBeDefined()
  })

  it('disables markup entirely for sms', () => {
    const sms = setup('sms', 'x', 0, 0)
    expect(sms.result.current.markup.enabled).toBe(false)
    expect(Object.keys(sms.result.current.markup.actions)).toHaveLength(0)
  })

  it('applies bold from the mod+B keyboard shortcut', () => {
    const { result } = setup('email', 'hola mundo', 5, 10)
    const preventDefault = vi.fn()
    act(() =>
      result.current.markup.onKeyDown({
        key: 'b',
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault,
      } as never),
    )
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(result.current.form.getValues('body')).toBe('hola **mundo**')
  })

  it('ignores unbound keys', () => {
    const { result } = setup('email', 'hola', 0, 0)
    const preventDefault = vi.fn()
    act(() =>
      result.current.markup.onKeyDown({
        key: 'p',
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault,
      } as never),
    )
    expect(preventDefault).not.toHaveBeenCalled()
  })
})
