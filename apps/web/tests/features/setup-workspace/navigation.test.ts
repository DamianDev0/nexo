import { describe, expect, it } from 'vitest'

import type { SidebarModule } from '@repo/shared-types'

import { SIDEBAR_ICON_MAP } from '@/features/setup-workspace/config/module-icons.constants'
import { groupModules, moduleGroupKey, moduleIcon } from '@/features/setup-workspace/lib/navigation'

describe('moduleGroupKey', () => {
  it('resolves a module key to its configured CRM group', () => {
    expect(moduleGroupKey('contacts')).toBe('management')
    expect(moduleGroupKey('invoices')).toBe('billing')
    expect(moduleGroupKey('reports')).toBe('insights')
    expect(moduleGroupKey('settings')).toBe('system')
  })

  it('falls back to overview for a module key with no configured group', () => {
    expect(moduleGroupKey('unknown-module')).toBe('overview')
  })
})

function buildModule(overrides: Partial<SidebarModule>): SidebarModule {
  return {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    enabled: true,
    order: 1,
    customIconUrl: null,
    required: true,
    ...overrides,
  }
}

describe('groupModules', () => {
  it('groups enabled modules by CRM category preserving MODULE_GROUPS order', () => {
    const modules = [
      buildModule({ key: 'contacts', label: 'Contacts', order: 2, required: false }),
      buildModule({ key: 'dashboard', label: 'Dashboard', order: 1 }),
    ]

    expect(groupModules(modules)).toEqual([
      { key: 'overview', modules: [modules[1]] },
      { key: 'management', modules: [modules[0]] },
    ])
  })

  it('drops groups that have no matching modules', () => {
    const modules = [buildModule({ key: 'dashboard' })]

    const result = groupModules(modules)

    expect(result).toHaveLength(1)
    expect(result.every((group) => group.modules.length > 0)).toBe(true)
    expect(result.map((group) => group.key)).toEqual(['overview'])
  })

  it('ignores unknown module keys from the backend', () => {
    const modules = [buildModule({ key: 'legacy-crm-module', label: 'Legacy' })]

    expect(groupModules(modules)).toEqual([])
  })
})

describe('moduleIcon', () => {
  it('resolves each sidebar module key to its icon component', () => {
    expect(moduleIcon('dashboard')).toBe(SIDEBAR_ICON_MAP.home)
    expect(moduleIcon('contacts')).toBe(SIDEBAR_ICON_MAP.users)
    expect(moduleIcon('settings')).toBe(SIDEBAR_ICON_MAP.settings)
  })
})
