import { describe, expect, it, vi } from 'vitest'

import type { TFunction } from 'i18next'

import { buildContactHints } from '@/features/filter-contacts/lib/contact-hints'

const t = vi.fn(
  (key: string, options?: { count?: number }) => `${key}:${options?.count ?? ''}`,
) as unknown as TFunction

const EMPTY = { counts: {}, withoutEmail: 0 }

describe('buildContactHints', () => {
  it('leads with the active list description', () => {
    const hints = buildContactHints(t, { ...EMPTY, description: 'Todos los contactos.' })

    expect(hints[0]).toBe('Todos los contactos.')
  })

  it('skips every bucket that has nothing to report', () => {
    expect(buildContactHints(t, EMPTY)).toEqual([])
  })

  it('reports pending, clients and total when they have volume', () => {
    const hints = buildContactHints(t, {
      ...EMPTY,
      counts: { new: 6, client: 3, all: 50 },
    })

    expect(hints).toEqual([
      'contacts.hints.pending:6',
      'contacts.hints.clients:3',
      'contacts.hints.total:50',
    ])
  })

  it('never announces a zero bucket', () => {
    const hints = buildContactHints(t, { ...EMPTY, counts: { new: 0, client: 0, all: 50 } })

    expect(hints).toEqual(['contacts.hints.total:50'])
  })

  it('flags contacts missing an email on the current page', () => {
    const hints = buildContactHints(t, { ...EMPTY, withoutEmail: 4 })

    expect(hints).toEqual(['contacts.hints.withoutEmail:4'])
  })
})
