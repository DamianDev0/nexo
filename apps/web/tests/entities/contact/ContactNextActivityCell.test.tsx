import { timeAgo } from '@repo/shared-utils'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { ContactNextActivityCell } from '@/entities/contact/ui/cells/ContactNextActivityCell'

const LABELS = { overdue: 'Vencida', kind: (kind: string) => `kind:${kind}` }

describe('ContactNextActivityCell', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date('2026-09-08T12:00:00.000Z') }))
  afterEach(() => vi.useRealTimers())

  it('renders a dash without a pending activity', () => {
    render(<ContactNextActivityCell activity={null} locale="es-CO" labels={LABELS} />, { wrapper })
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows the title and a relative due time for upcoming work', () => {
    render(
      <ContactNextActivityCell
        activity={{
          id: 'a1',
          activityType: 'task',
          title: 'Llamar',
          dueDate: '2026-09-10T12:00:00.000Z',
          priority: 'normal',
        }}
        locale="es-CO"
        labels={LABELS}
      />,
      { wrapper },
    )
    expect(screen.getByText('Llamar')).toBeInTheDocument()
    expect(screen.getByText(timeAgo('2026-09-10T12:00:00.000Z', 'es-CO'))).toBeInTheDocument()
  })

  it('flags overdue activities and falls back to the kind label without a title', () => {
    render(
      <ContactNextActivityCell
        activity={{
          id: 'a1',
          activityType: 'meeting',
          title: null,
          dueDate: '2026-09-01T12:00:00.000Z',
          priority: 'high',
        }}
        locale="es-CO"
        labels={LABELS}
      />,
      { wrapper },
    )
    expect(screen.getByText('kind:meeting')).toBeInTheDocument()
    expect(screen.getByText('Vencida')).toBeInTheDocument()
  })
})
