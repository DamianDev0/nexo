import { describe, expect, it, vi } from 'vitest'

import { CREATE_PARAM, ROUTES } from '@/shared/config/routes'
import { buildQuickCreateItems } from '@/widgets/app-shell/lib/quick-create-items'

vi.mock('server-only', () => ({}))

const entityLabel = (entity: string, form: string) => `${entity}.${form}`

describe('buildQuickCreateItems', () => {
  it('labels every target with its singular tenant nomenclature', () => {
    const items = buildQuickCreateItems(entityLabel)

    expect(items.map((item) => item.label)).toEqual([
      'contact.singular',
      'company.singular',
      'deal.singular',
      'activity.singular',
    ])
  })

  it('points the contact target at the contacts list with the create param', () => {
    const [contact] = buildQuickCreateItems(entityLabel)

    expect(contact?.href).toBe(`${ROUTES.app.contacts.list}?${CREATE_PARAM}=1`)
  })

  it('marks only the built modules as available', () => {
    const available = buildQuickCreateItems(entityLabel).filter((item) => item.available)

    expect(available.map((item) => item.entity)).toEqual(['contact'])
  })

  it('gives every item an icon', () => {
    expect(buildQuickCreateItems(entityLabel).every((item) => Boolean(item.icon))).toBe(true)
  })
})
