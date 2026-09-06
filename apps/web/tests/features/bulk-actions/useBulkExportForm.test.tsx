import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useBulkExportForm } from '@/features/bulk-actions/model/useBulkExportForm'

describe('useBulkExportForm', () => {
  it('submits the chosen format and trimmed name as export params', async () => {
    const onConfirm = vi.fn()
    const { result } = renderHook(() => useBulkExportForm(onConfirm))

    act(() => {
      result.current.form.setValue('format', 'json')
      result.current.form.setValue('fileName', ' leads ')
    })
    await act(async () => {
      await result.current.handleSubmit()
    })

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ format: 'json', fileName: 'leads' }),
    )
  })

  it('blocks submission when the file name exceeds the limit', async () => {
    const onConfirm = vi.fn()
    const { result } = renderHook(() => useBulkExportForm(onConfirm))

    act(() => result.current.form.setValue('fileName', 'x'.repeat(81)))
    let valid = true
    await act(async () => {
      valid = await result.current.form.trigger('fileName')
      await result.current.handleSubmit()
    })

    expect(valid).toBe(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
