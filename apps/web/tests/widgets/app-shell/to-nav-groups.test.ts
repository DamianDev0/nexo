import { describe, expect, it, vi } from 'vitest'

import type { SidebarModule } from '@repo/shared-types'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))

const { toNavGroups } = await import('@/widgets/app-shell/model/useSidebarModules')

function mod(key: string, order: number, enabled = true): SidebarModule {
  return { key, label: key, icon: key, enabled, order, customIconUrl: null, required: false }
}

describe('toNavGroups', () => {
  it('groups enabled modules by CRM category preserving stored order', () => {
    const groups = toNavGroups([
      mod('deals', 1),
      mod('contacts', 2),
      mod('dashboard', 3),
      mod('invoices', 4),
    ])

    expect(groups.map((g) => g.key)).toEqual(['overview', 'management', 'billing'])
    const management = groups.find((g) => g.key === 'management')
    expect(management?.items.map((i) => i.key)).toEqual(['deals', 'contacts'])
  })

  it('drops disabled modules and empty groups', () => {
    const groups = toNavGroups([mod('dashboard', 1), mod('reports', 2, false), mod('settings', 3)])

    expect(groups.map((g) => g.key)).toEqual(['overview', 'system'])
    expect(groups.flatMap((g) => g.items.map((i) => i.key))).not.toContain('reports')
  })

  it('ignores unknown module keys from the backend', () => {
    const groups = toNavGroups([mod('dashboard', 1), mod('made-up-module', 2)])

    expect(groups.flatMap((g) => g.items.map((i) => i.key))).toEqual(['dashboard'])
  })
})
