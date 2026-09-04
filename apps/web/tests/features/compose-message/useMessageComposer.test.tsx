import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MESSAGE_BODY_MAX } from '@/features/compose-message/config/message-channels'
import { useMessageComposer } from '@/features/compose-message/model/useMessageComposer'

const CONTACT = { email: 'ana@nexo.test', phone: '3001234567', whatsapp: null }

function makeFile(name: string, size: number): File {
  return new File(['x'.repeat(size)], name, { type: 'text/plain' })
}

describe('useMessageComposer', () => {
  it('prefills the recipient and exposes the channel body cap', () => {
    const { result } = renderHook(() => useMessageComposer('sms', CONTACT))
    expect(result.current.form.getValues('to')).toBe('3001234567')
    expect(result.current.bodyMax).toBe(MESSAGE_BODY_MAX.sms)
    expect(result.current.sendAvailable).toBe(false)
  })

  it('tracks body length for the counter', () => {
    const { result } = renderHook(() => useMessageComposer('sms', CONTACT))
    act(() => result.current.form.setValue('body', 'hola'))
    expect(result.current.bodyLength).toBe(4)
  })

  it('adds and removes attachments', () => {
    const { result } = renderHook(() => useMessageComposer('email', CONTACT))
    act(() => result.current.addFiles([makeFile('a.pdf', 10), makeFile('b.png', 20)]))
    expect(result.current.attachments.map((a) => a.name)).toEqual(['a.pdf', 'b.png'])
    expect(result.current.attachments[0]?.size).toBe(10)

    const [first] = result.current.attachments
    act(() => result.current.removeAttachment(first?.id ?? ''))
    expect(result.current.attachments.map((a) => a.name)).toEqual(['b.png'])
  })

  it('assigns unique ids per attachment', () => {
    const { result } = renderHook(() => useMessageComposer('email', CONTACT))
    act(() => result.current.addFiles([makeFile('a.pdf', 1), makeFile('a.pdf', 1)]))
    const ids = result.current.attachments.map((a) => a.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('shows cc and bcc rows on demand and clears their value on hide', () => {
    const { result } = renderHook(() => useMessageComposer('email', CONTACT))
    expect(result.current.extras.ccVisible).toBe(false)

    act(() => result.current.extras.showCc())
    expect(result.current.extras.ccVisible).toBe(true)
    act(() => result.current.form.setValue('cc', 'uno@nexo.test'))

    act(() => result.current.extras.hideCc())
    expect(result.current.extras.ccVisible).toBe(false)
    expect(result.current.form.getValues('cc')).toBe('')

    act(() => result.current.extras.showBcc())
    expect(result.current.extras.bccVisible).toBe(true)
    act(() => result.current.extras.hideBcc())
    expect(result.current.extras.bccVisible).toBe(false)
  })
})
