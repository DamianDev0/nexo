import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { buildArchiveCopy } from '@/features/archive-contact/lib/archive-copy'

const t = ((key: string, options?: Record<string, unknown>) =>
  [key, options?.name, options?.entity, options?.count]
    .filter((part) => part !== undefined)
    .join('|')) as unknown as TFunction

describe('buildArchiveCopy', () => {
  it('names the record and offers a way out', () => {
    const copy = buildArchiveCopy(t, {
      name: 'Carolina Rodríguez',
      entity: 'contacto',
      openDeals: 0,
    })

    expect(copy.title).toBe('contacts.archive.confirm.title|contacto')
    expect(copy.description).toBe('contacts.archive.confirm.description|Carolina Rodríguez')
    expect(copy.confirmLabel).toBe('contacts.archive.confirm.action')
    expect(copy.cancelLabel).toBe('common.cancel')
  })

  it('warns about the money still on the table', () => {
    const copy = buildArchiveCopy(t, { name: 'Carolina', entity: 'contacto', openDeals: 2 })

    expect(copy.description).toBe('contacts.archive.confirm.descriptionWithDeals|Carolina|2')
  })

  it('never slides to confirm — archiving is reversible', () => {
    const copy = buildArchiveCopy(t, { name: 'Ana', entity: 'contacto', openDeals: 0 })

    expect(copy.confirmedLabel).toBeUndefined()
    expect(copy.warning).toBeUndefined()
  })
})
