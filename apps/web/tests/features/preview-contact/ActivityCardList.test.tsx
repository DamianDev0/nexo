import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactActivity } from '@repo/shared-types'

import { ActivityCardList } from '@/features/preview-contact'

const LONG_BODY = `${'detalle '.repeat(20)}final`

function activity(overrides: Partial<ContactActivity>): ContactActivity {
  return {
    id: 'a1',
    activityType: 'note',
    title: 'Reclamación de seguro',
    description: null,
    dueDate: null,
    completedAt: null,
    status: 'pending',
    priority: 'normal',
    durationMinutes: null,
    assignedToId: null,
    createdById: null,
    createdAt: '2026-09-11T13:15:00.000Z',
    ...overrides,
  }
}

describe('ActivityCardList', () => {
  it('renders one card per activity', () => {
    render(
      <ActivityCardList
        items={[activity({ id: '1' }), activity({ id: '2', title: 'Segunda nota' })]}
        isLoading={false}
      />,
      { wrapper },
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Segunda nota')).toBeInTheDocument()
  })

  it('keeps a long note clamped until the reader expands it', async () => {
    const user = userEvent.setup()
    render(<ActivityCardList items={[activity({ description: LONG_BODY })]} isLoading={false} />, {
      wrapper,
    })

    const body = screen.getByText(LONG_BODY)
    expect(body).toHaveClass('line-clamp-2')

    await user.click(screen.getByRole('button', { name: 'contacts.preview.card.expand' }))

    expect(screen.getByText(LONG_BODY)).not.toHaveClass('line-clamp-2')
  })

  it('offers no disclosure for a short note', () => {
    render(
      <ActivityCardList items={[activity({ description: 'Nota corta' })]} isLoading={false} />,
      {
        wrapper,
      },
    )

    expect(
      screen.queryByRole('button', { name: 'contacts.preview.card.expand' }),
    ).not.toBeInTheDocument()
  })

  it('completes a task from its card', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const task = activity({ activityType: 'task', title: 'Enviar propuesta' })
    render(<ActivityCardList items={[task]} isLoading={false} onToggle={onToggle} />, { wrapper })

    await user.click(screen.getByRole('checkbox'))

    expect(onToggle).toHaveBeenCalledWith(task)
  })
})
