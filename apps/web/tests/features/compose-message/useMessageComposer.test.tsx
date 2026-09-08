import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queryWrapper } from '../../query-wrapper'

import { MESSAGE_BODY_MAX } from '@/features/compose-message/config/message-channels'
import { useMessageComposer } from '@/features/compose-message/model/useMessageComposer'

const send = vi.hoisted(() => vi.fn())

vi.mock('@/shared/api/services/messaging.service', () => ({
  default: { send: (payload: unknown) => send(payload) },
}))

vi.mock('sileo', () => ({ sileo: { success: vi.fn(), error: vi.fn() } }))

const CONTACT = { id: 'cnt-1', email: 'ana@nexo.test', phone: '3001234567', whatsapp: null }
const noop = () => undefined

function render(channel: 'sms' | 'email', onDone = noop) {
  return renderHook(() => useMessageComposer(channel, CONTACT, onDone), { wrapper: queryWrapper })
}

function makeFile(name: string, size: number): File {
  return new File(['x'.repeat(size)], name, { type: 'text/plain' })
}

describe('useMessageComposer', () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({ id: 'msg-1', toNumber: '+573001234567' })
  })

  it('prefills the recipient and exposes the channel body cap', () => {
    const { result } = render('sms')
    expect(result.current.form.getValues('to')).toBe('3001234567')
    expect(result.current.bodyMax).toBe(MESSAGE_BODY_MAX.sms)
    expect(result.current.sendAvailable).toBe(true)
  })

  it('keeps sending unavailable for channels without a provider yet', () => {
    const { result } = render('email')
    expect(result.current.sendAvailable).toBe(false)
  })

  it('tracks body length and sms segments for the counter', () => {
    const { result } = render('sms')
    act(() => result.current.form.setValue('body', 'hola'))
    expect(result.current.bodyLength).toBe(4)
    expect(result.current.segments).toBe(1)
    act(() => result.current.form.setValue('body', 'a'.repeat(200)))
    expect(result.current.segments).toBe(2)
    const email = render('email')
    act(() => email.result.current.form.setValue('body', 'a'.repeat(200)))
    expect(email.result.current.segments).toBe(0)
  })

  it('sends the sms with the contact id and closes on success', async () => {
    const onDone = vi.fn()
    const { result } = render('sms', onDone)
    act(() => result.current.form.setValue('body', 'Hola Ana'))

    await act(async () => result.current.submit())

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce())
    expect(send).toHaveBeenCalledWith({
      channel: 'sms',
      to: '3001234567',
      body: 'Hola Ana',
      contactId: 'cnt-1',
    })
  })

  it('does not send when validation fails', async () => {
    const { result } = render('sms')
    await act(async () => result.current.submit())
    await expect(result.current.form.trigger('body')).resolves.toBe(false)
    expect(send).not.toHaveBeenCalled()
  })

  it('adds and removes attachments', () => {
    const { result } = render('email')
    act(() => result.current.addFiles([makeFile('a.pdf', 10), makeFile('b.png', 20)]))
    expect(result.current.attachments.map((a) => a.name)).toEqual(['a.pdf', 'b.png'])
    expect(result.current.attachments[0]?.size).toBe(10)

    const [first] = result.current.attachments
    act(() => result.current.removeAttachment(first?.id ?? ''))
    expect(result.current.attachments.map((a) => a.name)).toEqual(['b.png'])
  })

  it('assigns unique ids per attachment', () => {
    const { result } = render('email')
    act(() => result.current.addFiles([makeFile('a.pdf', 1), makeFile('a.pdf', 1)]))
    const ids = result.current.attachments.map((a) => a.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('shows cc and bcc rows on demand and clears their value on hide', () => {
    const { result } = render('email')
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
