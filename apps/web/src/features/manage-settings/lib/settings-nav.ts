import { SETTINGS_GROUPS } from '../config/settings-nav.constants'

import type { SettingsSection } from '../model/types'
import type { SectionTab } from '@/shared/ui/molecules/section-tabs'

const SECTIONS = SETTINGS_GROUPS.flatMap((group) => group.sections)

function ownsPath(section: SettingsSection, pathname: string): boolean {
  const hrefs = [section.href, ...(section.children?.map((child) => child.href) ?? [])]
  return hrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`))
}

export function findSection(pathname: string): SettingsSection | null {
  return SECTIONS.find((section) => ownsPath(section, pathname)) ?? null
}

export function isSectionActive(section: SettingsSection, pathname: string): boolean {
  return ownsPath(section, pathname)
}

export function buildMobileNavTabs(
  label: (key: string, fallbackKey: string) => string,
): ReadonlyArray<SectionTab> {
  return SECTIONS.filter((section) => section.available).map((section) => ({
    key: section.href,
    href: section.href,
    label: label(section.key, `settings.sections.${section.key}`),
  }))
}

export function buildSectionTabs(
  section: SettingsSection | null,
  t: (key: string) => string,
): ReadonlyArray<SectionTab> {
  if (!section?.children) return []
  return section.children.map((child) => ({
    key: child.href,
    href: child.href,
    label: t(`settings.children.${section.key}.${child.key}`),
  }))
}
