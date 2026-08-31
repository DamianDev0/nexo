import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ActivityTypeFormValues } from '@/features/manage-settings/lib/activity-type-edit'

import { DEFAULT_ACTIVITY_ICON } from '@/features/manage-settings/config/activity-types.constants'
import { HEX_COLOR_PALETTE } from '@/features/manage-settings/config/hex-palette.constants'
import { useActivityTypeForm } from '@/features/manage-settings/model/useActivityTypeForm'


vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

function Harness({ onSubmit }: Readonly<{ onSubmit: (values: ActivityTypeFormValues) => void }>) {
  const form = useActivityTypeForm(onSubmit)

  return (
    <form onSubmit={form.submit}>
      <Controller
        control={form.control}
        name="label"
        render={({ field }) => <input aria-label="label" {...field} />}
      />
      <button type="submit" disabled={!form.canSubmit}>
        create
      </button>
    </form>
  )
}

describe('useActivityTypeForm', () => {
  it('submits the label with icon, color and duration defaults', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)

    const button = screen.getByRole('button', { name: 'create' })
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText('label'), 'Llamada')
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      label: 'Llamada',
      icon: DEFAULT_ACTIVITY_ICON,
      color: HEX_COLOR_PALETTE[0],
      trackDuration: false,
    })
  })

  it('ignores a second submit of the same mounted form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('label'), 'Reunión')
    const button = screen.getByRole('button', { name: 'create' })
    await waitFor(() => expect(button).toBeEnabled())

    await user.click(button)
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
