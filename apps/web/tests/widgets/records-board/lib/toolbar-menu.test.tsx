import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { buildToolbarMenu } from '@/widgets/records-board/lib/toolbar-menu'

const t = ((key: string) => key) as TFunction

const ROUTES = { list: '/contacts', import: '/contacts/import', listSettings: null, detail: String }

describe('buildToolbarMenu', () => {
  it('offers import and the bulk actions history as links', () => {
    const items = buildToolbarMenu(t, ROUTES)

    expect(items.map((item) => [item.id, item.label, item.href])).toEqual([
      ['import', 'imports.cta', '/contacts/import'],
      ['bulk-actions', 'bulkActions.title', '/bulk-actions'],
    ])
  })

  it('drops the import link for record types without an importer', () => {
    const items = buildToolbarMenu(t, { ...ROUTES, import: null })

    expect(items.map((item) => item.id)).toEqual(['bulk-actions'])
  })
})
