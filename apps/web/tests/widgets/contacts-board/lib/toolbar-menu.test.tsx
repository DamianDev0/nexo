import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { buildToolbarMenu } from '@/widgets/contacts-board/lib/toolbar-menu'

const t = ((key: string) => key) as TFunction

describe('buildToolbarMenu', () => {
  it('offers import and the bulk actions history as links', () => {
    const items = buildToolbarMenu(t)

    expect(items.map((item) => [item.id, item.label, item.href])).toEqual([
      ['import', 'contacts.import.cta', '/contacts/import'],
      ['bulk-actions', 'bulkActions.title', '/bulk-actions'],
    ])
  })
})
