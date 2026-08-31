import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { OptionFormValues } from '@/features/manage-settings/model/types'

import { useOptionForm } from '@/features/manage-settings/model/useOptionForm'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

interface HarnessProps {
  readonly initial: OptionFormValues | null
  readonly onSubmit: (values: OptionFormValues) => void
  readonly onClose: () => void
}

function Harness({ initial, onSubmit, onClose }: HarnessProps) {
  const form = useOptionForm({ initial, onSubmit, onClose })

  return (
    <form onSubmit={form.submit}>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <>
            <input aria-label="name" {...field} />
            <span data-testid="name-error">{fieldState.error?.message}</span>
          </>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field }) => <input aria-label="description" {...field} />}
      />
      <span data-testid="length">{form.descriptionLength}</span>
      <button type="submit" disabled={!form.canSubmit}>
        submit
      </button>
    </form>
  )
}

function setup(initial: OptionFormValues | null) {
  const onSubmit = vi.fn()
  const onClose = vi.fn()
  const view = render(<Harness initial={initial} onSubmit={onSubmit} onClose={onClose} />)
  return { onSubmit, onClose, view }
}

describe('useOptionForm', () => {
  it('starts empty in create mode and blocks submit', async () => {
    setup(null)

    expect(screen.getByLabelText('name')).toHaveValue('')
    expect(screen.getByLabelText('description')).toHaveValue('')
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled())
  })

  it('prefills values in edit mode and allows submit', async () => {
    setup({ name: 'VIP', description: 'Alto valor' })

    expect(screen.getByLabelText('name')).toHaveValue('VIP')
    expect(screen.getByLabelText('description')).toHaveValue('Alto valor')
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled())
  })

  it('resets the form when the edited option changes', async () => {
    const { view } = setup({ name: 'VIP', description: 'Alto valor' })

    view.rerender(
      <Harness initial={{ name: 'Frio', description: '' }} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )

    await waitFor(() => expect(screen.getByLabelText('name')).toHaveValue('Frio'))
    expect(screen.getByLabelText('description')).toHaveValue('')
  })

  it('submits trimmed values and closes', async () => {
    const user = userEvent.setup()
    const { onSubmit, onClose } = setup(null)

    await user.type(screen.getByLabelText('name'), '  Dormido  ')
    await user.type(screen.getByLabelText('description'), '  Sin contacto  ')
    await user.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Dormido', description: 'Sin contacto' }),
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('rejects a blank name and never calls onSubmit', async () => {
    const user = userEvent.setup()
    const { onSubmit, onClose } = setup(null)

    await user.type(screen.getByLabelText('name'), '   ')

    await waitFor(() =>
      expect(screen.getByTestId('name-error')).toHaveTextContent(
        'settings.optionForm.errors.nameRequired',
      ),
    )
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('rejects a name longer than the allowed maximum', async () => {
    const user = userEvent.setup()
    setup(null)

    await user.type(screen.getByLabelText('name'), 'x'.repeat(101))

    await waitFor(() =>
      expect(screen.getByTestId('name-error')).toHaveTextContent(
        'settings.optionForm.errors.nameTooLong',
      ),
    )
  })

  it('tracks the description length for the counter', async () => {
    const user = userEvent.setup()
    setup(null)

    await user.type(screen.getByLabelText('description'), 'hola')

    await waitFor(() => expect(screen.getByTestId('length')).toHaveTextContent('4'))
  })

  it('submits once, closes, and ignores a second submit of the same mount', async () => {
    const user = userEvent.setup()
    const { onSubmit, onClose } = setup({ name: 'VIP', description: '' })

    const button = screen.getByRole('button')
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
