import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ReassignCandidate } from '@/features/manage-settings/model/types'

import { useReassignForm } from '@/features/manage-settings/model/useReassignForm'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const CANDIDATES: ReassignCandidate[] = [
  { key: 'new', label: 'Nuevo', color: '#60A5FA' },
  { key: 'client', label: 'Cliente', color: '#4ADE80' },
]

function Harness({ onConfirm }: { readonly onConfirm: (toKey: string) => void }) {
  const form = useReassignForm({ candidates: CANDIDATES, onConfirm })

  return (
    <form onSubmit={form.submit}>
      <Controller
        control={form.control}
        name="target"
        render={({ field }) => <input aria-label="target" {...field} />}
      />
      <span data-testid="selected">{form.selected?.label ?? 'none'}</span>
      <button type="submit" disabled={!form.canSubmit}>
        confirm
      </button>
    </form>
  )
}

describe('useReassignForm', () => {
  it('starts without a selection and blocks confirmation', async () => {
    render(<Harness onConfirm={vi.fn()} />)

    expect(screen.getByTestId('selected')).toHaveTextContent('none')
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled())
  })

  it('resolves the selected candidate from the target key', async () => {
    const user = userEvent.setup()
    render(<Harness onConfirm={vi.fn()} />)

    await user.type(screen.getByLabelText('target'), 'client')

    await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('Cliente'))
  })

  it('reports no selection when the target key does not exist', async () => {
    const user = userEvent.setup()
    render(<Harness onConfirm={vi.fn()} />)

    await user.type(screen.getByLabelText('target'), 'ghost')

    expect(screen.getByTestId('selected')).toHaveTextContent('none')
  })

  it('confirms with the chosen target key', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<Harness onConfirm={onConfirm} />)

    await user.type(screen.getByLabelText('target'), 'client')
    await user.click(screen.getByRole('button'))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('client'))
  })
})
