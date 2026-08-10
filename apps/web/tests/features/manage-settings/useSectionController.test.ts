import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSectionController } from '@/features/manage-settings/model/useSectionController'
import { ROUTES } from '@/shared/config/routes'

let pathname = '/settings/company'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

function controller() {
  return { handleSave: vi.fn(), handleReset: vi.fn(), isDirty: false, isPending: false }
}

const controllers = {
  company: controller(),
  appearance: controller(),
  navigation: controller(),
  nomenclature: controller(),
  contacts: controller(),
}

vi.mock('@/features/manage-settings/model/settings-context', () => ({
  useManageSettings: () => controllers,
}))

describe('useSectionController', () => {
  it('resolves the company controller', () => {
    pathname = '/settings/company'
    const { result } = renderHook(() => useSectionController('company'))
    expect(result.current).toBe(controllers.company)
  })

  it('resolves the appearance controller', () => {
    const { result } = renderHook(() => useSectionController('appearance'))
    expect(result.current).toBe(controllers.appearance)
  })

  it('resolves the navigation controller', () => {
    const { result } = renderHook(() => useSectionController('navigation'))
    expect(result.current).toBe(controllers.navigation)
  })

  it('resolves the nomenclature controller', () => {
    const { result } = renderHook(() => useSectionController('nomenclature'))
    expect(result.current).toBe(controllers.nomenclature)
  })

  it('resolves the contacts controller outside the tags subpage', () => {
    pathname = ROUTES.app.settings.contacts.status
    const { result } = renderHook(() => useSectionController('contacts'))
    expect(result.current).toBe(controllers.contacts)
  })

  it('returns null for the contacts section on the tags subpage', () => {
    pathname = ROUTES.app.settings.contacts.tags
    const { result } = renderHook(() => useSectionController('contacts'))
    expect(result.current).toBeNull()
  })

  it('returns null for an undefined key', () => {
    pathname = '/settings/company'
    const { result } = renderHook(() => useSectionController(undefined))
    expect(result.current).toBeNull()
  })
})
