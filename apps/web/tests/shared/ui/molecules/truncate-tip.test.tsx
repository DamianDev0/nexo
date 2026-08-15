import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../../query-wrapper'

import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'

function mockOverflow(overflowing: boolean) {
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(overflowing ? 400 : 100)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TruncateTip', () => {
  it('stays silent while the text fits', async () => {
    mockOverflow(false)
    render(<TruncateTip>ana@example.co</TruncateTip>, { wrapper })

    await userEvent.hover(screen.getByText('ana@example.co'))

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('reveals the full text once it overflows', async () => {
    mockOverflow(true)
    render(<TruncateTip>contacto.muy.largo@empresa.com.co</TruncateTip>, { wrapper })

    await userEvent.hover(screen.getByText('contacto.muy.largo@empresa.com.co'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'contacto.muy.largo@empresa.com.co',
    )
  })

  it('always shows an explicit hint even when the text fits', async () => {
    mockOverflow(false)
    render(<TruncateTip hint="Correo principal">ana@example.co</TruncateTip>, { wrapper })

    await userEvent.hover(screen.getByText('ana@example.co'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Correo principal')
  })
})
