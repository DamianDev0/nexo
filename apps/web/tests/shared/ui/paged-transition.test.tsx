import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PagedTransition } from '@/shared/ui/molecules/paged-transition'

describe('PagedTransition', () => {
  it('renders the current page content with the given class', () => {
    render(
      <PagedTransition page={1} className="flex flex-col gap-1.5">
        <span>row one</span>
      </PagedTransition>,
    )

    expect(screen.getByText('row one')).toBeInTheDocument()
    expect(screen.getByText('row one').parentElement).toHaveClass('flex', 'flex-col', 'gap-1.5')
  })

  it('swaps the content when the page changes', async () => {
    const { rerender } = render(
      <PagedTransition page={1}>
        <span>page one</span>
      </PagedTransition>,
    )

    rerender(
      <PagedTransition page={2}>
        <span>page two</span>
      </PagedTransition>,
    )

    await waitFor(() => expect(screen.getByText('page two')).toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText('page one')).not.toBeInTheDocument())
  })

  it('keeps a single page mounted at a time while paging back', async () => {
    const { rerender } = render(
      <PagedTransition page={3}>
        <span>page three</span>
      </PagedTransition>,
    )

    rerender(
      <PagedTransition page={2}>
        <span>page two</span>
      </PagedTransition>,
    )

    await waitFor(() => expect(screen.getByText('page two')).toBeInTheDocument())
    expect(screen.queryByText('page three')).not.toBeInTheDocument()
  })
})
