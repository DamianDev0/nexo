import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { buildArchiveCopy } from '@/features/archive-record/lib/archive-copy'

const t = ((key: string, options?: Record<string, unknown>) =>
  [key, options?.name, options?.entity, options?.count, options?.deals]
    .filter((part) => part !== undefined)
    .join('|')) as unknown as TFunction

describe('buildArchiveCopy', () => {
  it('names the record and offers a way out', () => {
    const copy = buildArchiveCopy(t, {
      name: 'Carolina Rodríguez',
      entity: 'contacto',
      deals: 'negocios',
      openDeals: 0,
    })

    expect(copy.title).toBe('records.archive.confirm.title|contacto')
    expect(copy.description).toBe('records.archive.confirm.description|Carolina Rodríguez')
    expect(copy.confirmLabel).toBe('records.archive.confirm.action')
    expect(copy.cancelLabel).toBe('common.cancel')
  })

  it('warns about the money still on the table', () => {
    const copy = buildArchiveCopy(t, {
      name: 'Carolina',
      entity: 'contacto',
      deals: 'negocios',
      openDeals: 2,
    })

    expect(copy.description).toBe(
      'records.archive.confirm.descriptionWithDeals|Carolina|2|negocios',
    )
  })

  it('never slides to confirm — archiving is reversible', () => {
    const copy = buildArchiveCopy(t, {
      name: 'Ana',
      entity: 'contacto',
      deals: 'negocios',
      openDeals: 0,
    })

    expect(copy.confirmedLabel).toBeUndefined()
    expect(copy.warning).toBeUndefined()
  })
})
