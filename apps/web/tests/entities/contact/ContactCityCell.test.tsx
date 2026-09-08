import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { ContactCityCell } from '@/entities/contact/ui/cells/ContactCityCell'

const LABELS = { field: 'Ciudad', placeholder: 'Medellín' }

describe('ContactCityCell', () => {
  it('renders muted text when read-only', () => {
    render(<ContactCityCell value="Cali" labels={LABELS} />, { wrapper })
    expect(screen.getByText('Cali')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('renders a compact combobox trigger with the current city when editable', () => {
    render(<ContactCityCell value="Cali" labels={LABELS} onSelect={vi.fn()} />, { wrapper })
    expect(screen.getByRole('combobox')).toHaveTextContent('Cali')
  })

  it('falls back to the placeholder without a city', () => {
    render(<ContactCityCell value={null} labels={LABELS} onSelect={vi.fn()} />, { wrapper })
    expect(screen.getByRole('combobox')).toHaveTextContent('Medellín')
  })
})
