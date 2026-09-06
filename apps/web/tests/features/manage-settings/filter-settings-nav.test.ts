import { describe, expect, it } from 'vitest'

import type { SettingsNavLabels } from '@/features/manage-settings/lib/filter-settings-nav'

import { SETTINGS_GROUPS } from '@/features/manage-settings/config/settings-nav.constants'
import { filterSettingsGroups } from '@/features/manage-settings/lib/filter-settings-nav'

const labels: SettingsNavLabels = {
  section: (section) => `label ${section.key}`,
  child: (sectionKey, childKey) => `label ${sectionKey} ${childKey}`,
}

describe('filterSettingsGroups', () => {
  it('returns the original groups for an empty or whitespace query', () => {
    expect(filterSettingsGroups(SETTINGS_GROUPS, '', labels)).toBe(SETTINGS_GROUPS)
    expect(filterSettingsGroups(SETTINGS_GROUPS, '   ', labels)).toBe(SETTINGS_GROUPS)
  })

  it('keeps only sections whose label matches, dropping empty groups', () => {
    const result = filterSettingsGroups(SETTINGS_GROUPS, 'pipelines', labels)

    expect(result).toHaveLength(1)
    expect(result[0]?.key).toBe('workspace')
    expect(result[0]?.sections.map((section) => section.key)).toEqual(['pipelines'])
  })

  it('keeps a parent section when only a child label matches', () => {
    const result = filterSettingsGroups(SETTINGS_GROUPS, 'tags', labels)

    expect(result.flatMap((group) => group.sections.map((section) => section.key))).toEqual([
      'contacts',
    ])
  })

  it('matches case- and accent-insensitively', () => {
    const accented: SettingsNavLabels = {
      ...labels,
      section: (section) => (section.key === 'company' ? 'Configuración' : section.key),
    }

    const result = filterSettingsGroups(SETTINGS_GROUPS, 'CONFIGURACION', accented)

    expect(result.flatMap((group) => group.sections.map((section) => section.key))).toEqual([
      'company',
    ])
  })

  it('returns an empty array when nothing matches', () => {
    expect(filterSettingsGroups(SETTINGS_GROUPS, 'zzz-nope', labels)).toEqual([])
  })

  it('never fabricates children for childless sections', () => {
    expect(filterSettingsGroups(SETTINGS_GROUPS, 'undefined', labels)).toEqual([])
    expect(filterSettingsGroups(SETTINGS_GROUPS, 'stryker', labels)).toEqual([])
  })
})
