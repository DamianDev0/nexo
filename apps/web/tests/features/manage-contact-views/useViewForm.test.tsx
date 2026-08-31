import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useViewForm } from '@/features/manage-contact-views/model/useViewForm'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('useViewForm', () => {
  it('saves trimmed values and closes on valid submit', async () => {
    const onSave = vi.fn()
    const onDone = vi.fn()
    const { result } = renderHook(() =>
      useViewForm({ initial: { name: ' VIP ', description: 'top' }, onSave, onDone }),
    )

    await act(() => result.current.handleSubmit())

    expect(onSave).toHaveBeenCalledWith({ name: 'VIP', description: 'top' })
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('blocks submit and keeps the dialog open when the name is empty', async () => {
    const onSave = vi.fn()
    const onDone = vi.fn()
    const { result } = renderHook(() =>
      useViewForm({ initial: { name: '', description: '' }, onSave, onDone }),
    )

    await act(() => result.current.handleSubmit())

    expect(onSave).not.toHaveBeenCalled()
    expect(onDone).not.toHaveBeenCalled()
  })
})
