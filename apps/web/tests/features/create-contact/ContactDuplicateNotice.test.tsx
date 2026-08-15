import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ContactDuplicateNotice } from '@/features/create-contact/ui/ContactDuplicateNotice'

const softNotice = { message: 'contacts.duplicates.phoneMatch', canForce: true }

describe('ContactDuplicateNotice', () => {
  it('renders nothing without a notice', () => {
    const { container } = render(
      <ContactDuplicateNotice
        notice={null}
        isEdit={false}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the message with force and dismiss actions on a soft duplicate', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onDismiss = vi.fn()
    render(
      <ContactDuplicateNotice
        notice={softNotice}
        isEdit={false}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('contacts.duplicates.phoneMatch')

    await user.click(screen.getByRole('button', { name: 'contacts.duplicates.createAnyway' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'contacts.duplicates.dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('labels the force action for edit mode', () => {
    render(
      <ContactDuplicateNotice notice={softNotice} isEdit onConfirm={vi.fn()} onDismiss={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'contacts.duplicates.saveAnyway' })).toBeVisible()
  })

  it('hides the force action on a hard duplicate', () => {
    render(
      <ContactDuplicateNotice
        notice={{ message: 'contacts.duplicates.documentTaken', canForce: false }}
        isEdit={false}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'contacts.duplicates.createAnyway' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'contacts.duplicates.dismiss' })).toBeVisible()
  })
})
