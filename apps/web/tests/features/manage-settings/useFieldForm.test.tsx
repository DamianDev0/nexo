import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { FieldFormValues } from '@/features/manage-settings/lib/custom-field-edit'

import { useFieldForm } from '@/features/manage-settings/model/useFieldForm'


vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

interface HarnessProps {
  readonly initial: FieldFormValues | null
  readonly onSubmit: (values: FieldFormValues) => void
}

function Harness({ initial, onSubmit }: HarnessProps) {
  const form = useFieldForm(initial, onSubmit)

  return (
    <form onSubmit={form.submit}>
      <Controller
        control={form.control}
        name="label"
        render={({ field }) => <input aria-label="label" {...field} />}
      />
      <Controller
        control={form.control}
        name="type"
        render={({ field }) => (
          <select aria-label="type" value={field.value} onChange={field.onChange}>
            <option value="text">text</option>
            <option value="select">select</option>
          </select>
        )}
      />
      <span data-testid="has-options">{String(form.hasOptions)}</span>
      <span data-testid="options-error">{form.optionsError}</span>
      <button type="button" onClick={form.optionActions.onAdd}>
        add option
      </button>
      {form.options.map((option) => (
        <div key={option.id}>
          <input
            aria-label={`option-${option.id}`}
            value={option.value}
            onChange={(event) => form.optionActions.onChange(option.id, event.target.value)}
          />
          <button type="button" onClick={() => form.optionActions.onRemove(option.id)}>
            {`remove-${option.id}`}
          </button>
        </div>
      ))}
      <button type="submit" disabled={!form.canSubmit}>
        submit
      </button>
    </form>
  )
}

function setup(initial: FieldFormValues | null = null) {
  const onSubmit = vi.fn()
  render(<Harness initial={initial} onSubmit={onSubmit} />)
  return { onSubmit, user: userEvent.setup() }
}

describe('useFieldForm', () => {
  it('starts empty and blocked in create mode', () => {
    setup()

    expect(screen.getByLabelText('label')).toHaveValue('')
    expect(screen.getByTestId('has-options')).toHaveTextContent('false')
    expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled()
  })

  it('seeds values from the edited field', () => {
    setup({
      label: 'Tipo de techo',
      type: 'select',
      required: true,
      showInForm: false,
      optionLabels: ['Teja'],
    })

    expect(screen.getByLabelText('label')).toHaveValue('Tipo de techo')
    expect(screen.getByTestId('has-options')).toHaveTextContent('true')
    expect(screen.getByDisplayValue('Teja')).toBeInTheDocument()
  })

  it('requires at least one option for select fields', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('label'), 'Techo')
    await user.selectOptions(screen.getByLabelText('type'), 'select')

    await waitFor(() => expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled())

    await user.click(screen.getByRole('button', { name: 'add option' }))
    await user.type(screen.getByRole('textbox', { name: /option-/ }), 'Teja')

    await waitFor(() => expect(screen.getByRole('button', { name: 'submit' })).toBeEnabled())
  })

  it('submits trimmed option labels once', async () => {
    const { onSubmit, user } = setup({
      label: 'Techo',
      type: 'multiselect',
      required: false,
      showInForm: true,
      optionLabels: ['  Teja  ', ''],
    })

    const submit = screen.getByRole('button', { name: 'submit' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)
    await user.click(submit)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      label: 'Techo',
      type: 'multiselect',
      required: false,
      showInForm: true,
      optionLabels: ['Teja'],
    })
  })

  it('removes options by stable id', async () => {
    const { user } = setup({
      label: 'Techo',
      type: 'select',
      required: false,
      showInForm: true,
      optionLabels: ['Uno', 'Dos'],
    })

    const [firstRemove] = screen.getAllByRole('button', { name: /remove-/ })
    await user.click(firstRemove!)

    expect(screen.queryByDisplayValue('Uno')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Dos')).toBeInTheDocument()
  })
})
