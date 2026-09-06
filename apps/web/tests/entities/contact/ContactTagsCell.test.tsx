import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { Tag } from '@repo/shared-types'

import { ContactTagsCell } from '@/entities/contact/ui/cells/ContactTagsCell'

const LABELS = {
  title: 'Etiquetas',
  count: (total: number) => `${total} etiquetas`,
}

function tagMeta(name: string, description: string | null = null): Tag {
  return {
    id: `tag-${name}`,
    name,
    color: '#3B82F6',
    description,
    enabled: true,
    deletedAt: null,
    entityType: 'contact',
    createdAt: '2026-08-01T00:00:00.000Z',
  }
}

describe('ContactTagsCell', () => {
  it('falls back to a dash without tags', () => {
    render(<ContactTagsCell tags={[]} labels={LABELS} />, { wrapper })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows a single tag with its description in a tooltip', async () => {
    const byName = new Map([['vip', tagMeta('vip', 'Cliente de alto valor')]])
    render(<ContactTagsCell tags={['vip']} labels={LABELS} byName={byName} />, { wrapper })

    expect(screen.getByText('vip')).toBeInTheDocument()
    expect(screen.queryByText('Cliente de alto valor')).not.toBeInTheDocument()

    await userEvent.hover(screen.getByText('vip'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Cliente de alto valor')
  })

  it('collapses multiple tags into a single count chip', () => {
    render(<ContactTagsCell tags={['vip', 'frio', 'norte', 'b2b']} labels={LABELS} />, { wrapper })

    expect(screen.getByText('4 etiquetas')).toBeInTheDocument()
    expect(screen.queryByText('vip')).not.toBeInTheDocument()
    expect(screen.queryByText('frio')).not.toBeInTheDocument()
  })

  it('reveals the stacked tag list on hover', async () => {
    render(<ContactTagsCell tags={['vip', 'frio', 'norte']} labels={LABELS} />, { wrapper })

    await userEvent.hover(screen.getByRole('button', { name: 'Etiquetas' }))

    expect(await screen.findByText('norte')).toBeInTheDocument()
  })

  it('paints the catalog color on hover card rows', async () => {
    const byName = new Map([['vip', tagMeta('vip', 'Cliente de alto valor')]])
    const { container } = render(
      <ContactTagsCell tags={['vip', 'frio', 'norte']} labels={LABELS} byName={byName} />,
      { wrapper },
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Etiquetas' }))
    await screen.findByText('norte')

    expect(screen.getByText('vip')).toBeInTheDocument()
    expect(container.ownerDocument.querySelector('[style*="rgb(59, 130, 246)"]')).not.toBeNull()
  })
})
