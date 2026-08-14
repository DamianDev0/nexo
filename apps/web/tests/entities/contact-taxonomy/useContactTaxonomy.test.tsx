import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactTaxonomy } from '@repo/shared-types'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'

const server = createMswServer()

function taxonomy(overrides: Partial<ContactTaxonomy> = {}): ContactTaxonomy {
  return {
    statuses: [
      {
        key: 'new',
        label: null,
        description: null,
        color: '#3B82F6',
        order: 1,
        isSystem: true,
        enabled: true,
      },
      {
        key: 'client',
        label: 'Cliente VIP',
        description: null,
        color: '#22C55E',
        order: 2,
        isSystem: false,
        enabled: true,
      },
    ],
    sources: [],
    types: [
      {
        key: 'customer',
        label: null,
        description: null,
        color: '#3B82F6',
        order: 1,
        isSystem: true,
        enabled: true,
      },
      {
        key: 'gremio',
        label: 'Gremio',
        description: null,
        color: '#F97316',
        order: 2,
        isSystem: false,
        enabled: true,
      },
    ],
    ...overrides,
  }
}

describe('useContactTaxonomy', () => {
  it('sorts options by order and falls back to the i18n key when label is null', async () => {
    server.use(
      http.get(`${API}/settings/contact-taxonomy`, () => HttpResponse.json({ data: taxonomy() })),
    )

    const { result } = renderHook(() => useContactTaxonomy(), { wrapper })

    await waitFor(() => expect(result.current.statuses).toHaveLength(2))
    expect(result.current.statuses.map((s) => s.key)).toEqual(['new', 'client'])
    expect(result.current.statuses[0]?.label).toBe('new')
  })

  it('keeps a custom label as-is', async () => {
    server.use(
      http.get(`${API}/settings/contact-taxonomy`, () => HttpResponse.json({ data: taxonomy() })),
    )

    const { result } = renderHook(() => useContactTaxonomy(), { wrapper })

    await waitFor(() => expect(result.current.statuses).toHaveLength(2))
    expect(result.current.statuses[1]?.label).toBe('Cliente VIP')
  })

  it('reorders options that arrive out of order', async () => {
    server.use(
      http.get(`${API}/settings/contact-taxonomy`, () =>
        HttpResponse.json({
          data: taxonomy({
            statuses: [
              {
                key: 'client',
                label: 'Cliente VIP',
                description: null,
                color: '#22C55E',
                order: 2,
                isSystem: false,
                enabled: true,
              },
              {
                key: 'new',
                label: null,
                description: null,
                color: '#3B82F6',
                order: 1,
                isSystem: true,
                enabled: true,
              },
            ],
          }),
        }),
      ),
    )

    const { result } = renderHook(() => useContactTaxonomy(), { wrapper })

    await waitFor(() => expect(result.current.statuses).toHaveLength(2))
    expect(result.current.statuses.map((s) => s.key)).toEqual(['new', 'client'])
  })

  it('exposes types with the contacts.types i18n fallback and a typeByKey map', async () => {
    server.use(
      http.get(`${API}/settings/contact-taxonomy`, () => HttpResponse.json({ data: taxonomy() })),
    )

    const { result } = renderHook(() => useContactTaxonomy(), { wrapper })

    await waitFor(() => expect(result.current.types).toHaveLength(2))
    expect(result.current.types[0]?.label).toBe('customer')
    expect(result.current.types[1]?.label).toBe('Gremio')
    expect(result.current.typeByKey.get('gremio')?.color).toBe('#F97316')
  })

  it('filters out disabled options from the selector choices', async () => {
    const data = taxonomy()
    const disabled = { ...data.statuses[1]!, enabled: false }
    server.use(
      http.get(`${API}/settings/contact-taxonomy`, () =>
        HttpResponse.json({ data: { ...data, statuses: [data.statuses[0]!, disabled] } }),
      ),
    )

    const { result } = renderHook(() => useContactTaxonomy(), { wrapper })

    await waitFor(() => expect(result.current.statuses).toHaveLength(1))
    expect(result.current.statuses[0]?.key).toBe('new')
    expect(result.current.statusByKey.get('client')).toBeUndefined()
  })

  it('exposes statusByKey as a lookup map', async () => {
    server.use(
      http.get(`${API}/settings/contact-taxonomy`, () => HttpResponse.json({ data: taxonomy() })),
    )

    const { result } = renderHook(() => useContactTaxonomy(), { wrapper })

    await waitFor(() => expect(result.current.statuses).toHaveLength(2))
    expect(result.current.statusByKey.get('client')?.label).toBe('Cliente VIP')
    expect(result.current.statusByKey.get('missing')).toBeUndefined()
  })
})
