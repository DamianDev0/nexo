import { describe, expect, it, vi } from 'vitest'

import { SETTINGS_GROUPS } from '@/features/manage-settings/config/settings-nav.constants'
import {
  buildSectionTabs,
  findSection,
  isSectionActive,
} from '@/features/manage-settings/lib/settings-nav'
import { ROUTES } from '@/shared/config/routes'

const SETTINGS = ROUTES.app.settings
const SECTIONS = SETTINGS_GROUPS.flatMap((group) => group.sections)

const appearanceSection = SECTIONS.find((section) => section.key === 'appearance')!
const contactsSection = SECTIONS.find((section) => section.key === 'contacts')!
const companySection = SECTIONS.find((section) => section.key === 'company')!

describe('isSectionActive', () => {
  it('matches the section href itself', () => {
    expect(isSectionActive(companySection, SETTINGS.company)).toBe(true)
  })

  it('matches a nested path under the section href', () => {
    expect(isSectionActive(companySection, `${SETTINGS.company}/edit`)).toBe(true)
  })

  it('does not match a path that merely ends with the href, but does not start with it', () => {
    expect(isSectionActive(companySection, `/other${SETTINGS.company}/`)).toBe(false)
  })

  it('matches when only one of several hrefs is the current path', () => {
    expect(isSectionActive(contactsSection, SETTINGS.contacts.sources)).toBe(true)
  })

  it('does not match an unrelated path', () => {
    expect(isSectionActive(companySection, '/settings/team')).toBe(false)
  })

  it('does not treat a fallback sentinel as a match when the section has no children', () => {
    expect(isSectionActive(companySection, 'Stryker was here')).toBe(false)
  })
})

describe('findSection', () => {
  it('finds a section by its own href', () => {
    expect(findSection(SETTINGS.company)?.key).toBe('company')
  })

  it("finds a section by one of its children's hrefs", () => {
    expect(findSection(SETTINGS.appearance.theme)?.key).toBe('appearance')
  })

  it('returns null when nothing matches', () => {
    expect(findSection('/settings/does-not-exist')).toBeNull()
  })
})

describe('buildSectionTabs', () => {
  it('returns null-safely as an empty array when the section is null', () => {
    expect(buildSectionTabs(null, (key) => key)).toEqual([])
  })

  it('returns an empty array when the section has no children', () => {
    expect(buildSectionTabs(companySection, (key) => key)).toEqual([])
  })

  it('builds one localized tab per child, keyed and hrefed by the child', () => {
    const t = vi.fn((key: string) => key)

    const tabs = buildSectionTabs(appearanceSection, t)

    expect(tabs).toEqual([
      {
        key: SETTINGS.appearance.brand,
        href: SETTINGS.appearance.brand,
        label: 'settings.children.appearance.brand',
      },
      {
        key: SETTINGS.appearance.theme,
        href: SETTINGS.appearance.theme,
        label: 'settings.children.appearance.theme',
      },
      {
        key: SETTINGS.appearance.typography,
        href: SETTINGS.appearance.typography,
        label: 'settings.children.appearance.typography',
      },
    ])
    expect(t).toHaveBeenCalledWith('settings.children.appearance.theme')
  })
})
