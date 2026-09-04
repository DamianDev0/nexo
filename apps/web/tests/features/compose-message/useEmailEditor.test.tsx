import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MessageFormValues } from '@/features/compose-message/lib/message-form.schema'

import { useEmailEditor } from '@/features/compose-message/model/useEmailEditor'

const execCommand = vi.fn()

beforeEach(() => {
  execCommand.mockClear()
  Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true })
})

function setup() {
  const rendered = renderHook(() => {
    const form = useForm<MessageFormValues>({
      defaultValues: { to: '', cc: '', bcc: '', subject: '', body: '' },
    })
    return { form, email: useEmailEditor(form) }
  })
  const el = document.createElement('div')
  document.body.appendChild(el)
  rendered.result.current.email.editor.ref.current = el
  return { ...rendered, el }
}

describe('useEmailEditor', () => {
  it('executes rich commands against the editable element', () => {
    const { result } = setup()
    act(() => result.current.email.editor.exec('bold'))
    expect(execCommand).toHaveBeenCalledWith('bold', false, undefined)
  })

  it('writes body html into the form on change', () => {
    const { result } = setup()
    act(() => result.current.email.onBodyChange('<b>hola</b>'))
    expect(result.current.form.getValues('body')).toBe('<b>hola</b>')
  })

  it('inserts emojis through insertText', () => {
    const { result } = setup()
    act(() => result.current.email.insertEmoji('🎉'))
    expect(execCommand).toHaveBeenCalledWith('insertText', false, '🎉')
  })

  it('applies colors through foreColor', () => {
    const { result } = setup()
    act(() => result.current.email.setColor('#2563eb'))
    expect(execCommand).toHaveBeenCalledWith('foreColor', false, '#2563eb')
  })

  it('creates links from the saved selection', () => {
    const { result } = setup()
    act(() => result.current.email.applyLink('https://nexo.test'))
    expect(execCommand).toHaveBeenCalledWith('createLink', false, 'https://nexo.test')
  })

  it('does nothing when the editor is not mounted', () => {
    const { result } = setup()
    result.current.email.editor.ref.current = null
    act(() => result.current.email.editor.exec('bold'))
    expect(execCommand).not.toHaveBeenCalled()
  })
})
