import { describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/shared/config/routes'
import { buildBreadcrumbTrail } from '@/widgets/app-shell/lib/breadcrumb-trail'

vi.mock('server-only', () => ({}))

const t = (key: string) => key
const moduleLabel = (_moduleKey: string, titleKey: string) => titleKey

function trail(pathname: string) {
  return buildBreadcrumbTrail(pathname, t, moduleLabel)
}

describe('buildBreadcrumbTrail', () => {
  it('returns a single unlinked home crumb on the dashboard', () => {
    expect(trail(ROUTES.app.dashboard)).toEqual([
      expect.objectContaining({ label: 'nav.dashboard', href: undefined }),
    ])
  })

  it('links home and leaves the module as the current page', () => {
    const crumbs = trail(ROUTES.app.contacts.list)

    expect(crumbs).toHaveLength(2)
    expect(crumbs.at(0)?.href).toBe(ROUTES.app.dashboard)
    expect(crumbs.at(1)).toMatchObject({ label: 'nav.contacts', href: undefined })
  })

  it('keeps the module crumb unlinked on a detail route', () => {
    const crumbs = trail(ROUTES.app.contacts.detail('abc'))

    expect(crumbs).toHaveLength(2)
    expect(crumbs.at(1)?.href).toBeUndefined()
  })

  it('appends the settings section as the current page', () => {
    const crumbs = trail(ROUTES.app.settings.company)

    expect(crumbs.map((crumb) => crumb.label)).toEqual([
      'nav.dashboard',
      'nav.settings',
      'settings.sections.company',
    ])
    expect(crumbs.at(2)?.href).toBeUndefined()
  })

  it('links the settings section when a child segment follows', () => {
    const crumbs = trail(ROUTES.app.settings.contacts.status)

    expect(crumbs.map((crumb) => crumb.label)).toEqual([
      'nav.dashboard',
      'nav.settings',
      'settings.sections.contacts',
      'settings.children.contacts.status',
    ])
    expect(crumbs.at(2)?.href).toBe(ROUTES.app.settings.contacts.status)
  })

  it('returns nothing for a path outside the navigation', () => {
    expect(trail('/unknown')).toEqual([])
  })
})
