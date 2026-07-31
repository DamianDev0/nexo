import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { ManageSettingsProvider } from '@/features/manage-settings/model/settings-context'
import { SettingsShell } from '@/features/manage-settings/ui/SettingsShell'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '' })),
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/settings/general',
}))

createMswServer()

describe('SettingsShell', () => {
  it('always renders the footer save bar', async () => {
    render(
      <ManageSettingsProvider>
        <SettingsShell>
          <p>section content</p>
        </SettingsShell>
      </ManageSettingsProvider>,
      { wrapper },
    )

    await waitFor(() => expect(screen.getByText('section content')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'common.save' })).toBeInTheDocument()
    expect(screen.getByText('settings.noChanges')).toBeInTheDocument()
  })
})
