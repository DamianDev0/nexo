import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { CONTACT_COLUMNS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactSort } from '@/entities/contact'
import type { ContactTableState } from '@repo/shared-types'

import { useContactsLayout } from '@/features/customize-contacts-table/model/useContactsLayout'

const server = createMswServer()

function captureSaves() {
  const saved: unknown[] = []
  server.use(
    http.patch(`${API}/contacts/workspace`, async ({ request }) => {
      saved.push(await request.json())
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return saved
}

function setup(state: ContactTableState = {}, onSortChange = vi.fn()) {
  const view = renderHook(
    () =>
      useContactsLayout(CONTACT_COLUMNS_FIXTURE, state, { value: null, onChange: onSortChange }),
    { wrapper },
  )
  return { ...view, onSortChange }
}

describe('useContactsLayout', () => {
  it('exposes the stored layout to the table', () => {
    const { result } = setup({ columns: { widths: { name: 300 } }, density: 'compact' })

    expect(result.current.layout.value.widths).toEqual({ name: 300 })
    expect(result.current.layout.value.density).toBe('compact')
  })

  it('persists a layout change to the workspace endpoint', async () => {
    const saved = captureSaves()
    const { result } = setup()

    act(() =>
      result.current.layout.onChange({
        order: ['name', 'status'],
        hidden: ['tags'],
        widths: { name: 260 },
        pinnedLeft: ['name'],
        density: 'compact',
      }),
    )

    await waitFor(
      () =>
        expect(saved).toEqual([
          {
            tableState: {
              columns: {
                order: ['name', 'status'],
                hidden: ['tags'],
                widths: { name: 260 },
                pinnedLeft: ['name'],
              },
              density: 'compact',
            },
          },
        ]),
      { timeout: 3000 },
    )
  })

  it('collapses a burst of resizes into a single request', async () => {
    const saved = captureSaves()
    const { result } = setup()

    act(() => {
      result.current.layout.onChange({ widths: { name: 200 } })
      result.current.layout.onChange({ widths: { name: 240 } })
      result.current.layout.onChange({ widths: { name: 280 } })
    })

    await waitFor(() => expect(saved).toHaveLength(1), { timeout: 3000 })
    expect(saved[0]).toMatchObject({ tableState: { columns: { widths: { name: 280 } } } })
  })

  it('translates a column click into the API sort field', () => {
    const { result, onSortChange } = setup()

    act(() => result.current.sort.onChange({ field: 'name', direction: 'desc' }))

    expect(onSortChange).toHaveBeenCalledWith({ field: 'firstName', direction: 'desc' })
  })

  it('clears the sort when the column is unsorted', () => {
    const { result, onSortChange } = setup()

    act(() => result.current.sort.onChange(null))

    expect(onSortChange).toHaveBeenCalledWith(null satisfies ContactSort | null)
  })

  it('persists the smart list order on its own key', async () => {
    const saved = captureSaves()
    const { result } = setup()

    act(() => result.current.setListOrder(['new', 'qualified']))

    await waitFor(
      () => expect(saved).toEqual([{ tableState: { listOrder: ['new', 'qualified'] } }]),
      { timeout: 3000 },
    )
  })
})
