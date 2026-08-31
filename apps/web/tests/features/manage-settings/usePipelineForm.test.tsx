import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { usePipelineForm } from '@/features/manage-settings/model/usePipelineForm'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

function Harness({ onSubmit }: Readonly<{ onSubmit: (name: string) => void }>) {
  const form = usePipelineForm(onSubmit)

  return (
    <form onSubmit={form.submit}>
      <Controller
        control={form.control}
        name="name"
        render={({ field }) => <input aria-label="name" {...field} />}
      />
      <button type="submit" disabled={!form.canSubmit}>
        create
      </button>
    </form>
  )
}

describe('usePipelineForm', () => {
  it('blocks submission until the name is valid, then submits the trimmed name', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)

    const button = screen.getByRole('button', { name: 'create' })
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText('name'), '  Ventas  ')
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('Ventas')
  })

  it('ignores a second submit of the same mounted form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('name'), 'Ventas')
    const button = screen.getByRole('button', { name: 'create' })
    await waitFor(() => expect(button).toBeEnabled())

    await user.click(button)
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
