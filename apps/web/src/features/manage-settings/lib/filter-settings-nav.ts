import { normalizeSearchText as normalize } from '@/shared/lib/search-text'

import type { SettingsGroup, SettingsSection } from '../model/types'

export interface SettingsNavLabels {
  readonly section: (section: SettingsSection) => string
  readonly child: (sectionKey: string, childKey: string) => string
}

function sectionMatches(
  section: SettingsSection,
  needle: string,
  labels: SettingsNavLabels,
): boolean {
  if (normalize(labels.section(section)).includes(needle)) return true
  return (section.children ?? []).some((child) =>
    normalize(labels.child(section.key, child.key)).includes(needle),
  )
}

export function filterSettingsGroups(
  groups: ReadonlyArray<SettingsGroup>,
  query: string,
  labels: SettingsNavLabels,
): ReadonlyArray<SettingsGroup> {
  const needle = normalize(query.trim())
  if (needle.length === 0) return groups

  return groups
    .map((group) => ({
      ...group,
      sections: group.sections.filter((section) => sectionMatches(section, needle, labels)),
    }))
    .filter((group) => group.sections.length > 0)
}
