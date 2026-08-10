import { PlanName } from '@repo/shared-types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReactNode } from 'react'

import { useOnboardingForm } from '@/features/register-workspace/model/useOnboardingForm'
import { ROUTES } from '@/shared/config/routes'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const registerWorkspaceActionMock = vi.fn()

vi.mock('@/features/register-workspace/api/register-workspace.action', () => ({
  registerWorkspaceAction: (input: unknown) => registerWorkspaceActionMock(input),
}))

vi.mock('i18next', () => ({
  t: (key: string, options?: Record<string, unknown>) =>
    options ? `${key}:${JSON.stringify(options)}` : key,
}))

const pushSpy = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushSpy }),
}))

const sileoError = vi.fn()
const sileoSuccess = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: (...args: unknown[]) => sileoSuccess(...args),
  },
}))

const setTenantSlugSpy = vi.fn()

vi.mock('@/entities/session', () => ({
  useAuthStore: () => ({ setTenantSlug: setTenantSlugSpy }),
}))

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, Wrapper }
}

function OnboardingHarness() {
  const { control, handleSubmit, handleBusinessNameChange, isPending } = useOnboardingForm()
  return (
    <form onSubmit={handleSubmit}>
      <Controller
        control={control}
        name="businessName"
        render={({ field }) => (
          <input
            aria-label="businessName"
            {...field}
            value={field.value ?? ''}
            onChange={(event) => handleBusinessNameChange(event.target.value, field.onChange)}
          />
        )}
      />
      <Controller
        control={control}
        name="slug"
        render={({ field }) => (
          <input aria-label="slug" {...field} value={field.value ?? ''} readOnly />
        )}
      />
      <Controller
        control={control}
        name="ownerFullName"
        render={({ field }) => (
          <input aria-label="ownerFullName" {...field} value={field.value ?? ''} />
        )}
      />
      <Controller
        control={control}
        name="ownerEmail"
        render={({ field, fieldState }) => (
          <>
            <input aria-label="ownerEmail" {...field} value={field.value ?? ''} />
            <span data-testid="ownerEmail-error">{fieldState.error?.message ?? ''}</span>
          </>
        )}
      />
      <Controller
        control={control}
        name="ownerPassword"
        render={({ field }) => (
          <input aria-label="ownerPassword" {...field} value={field.value ?? ''} />
        )}
      />
      <button type="submit">{isPending ? 'pending' : 'submit'}</button>
    </form>
  )
}

beforeEach(() => {
  registerWorkspaceActionMock.mockReset()
  pushSpy.mockClear()
  sileoError.mockClear()
  sileoSuccess.mockClear()
  setTenantSlugSpy.mockClear()
})

async function fillValidFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('businessName'), 'Acme Corp')
  await user.type(screen.getByLabelText('ownerFullName'), 'Ana Gomez')
  await user.type(screen.getByLabelText('ownerEmail'), 'ana@acme.co')
  await user.type(screen.getByLabelText('ownerPassword'), 'Secret123')
}

describe('useOnboardingForm', () => {
  it('validates the owner email on blur because the form runs in onBlur mode', async () => {
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await user.type(screen.getByLabelText('ownerEmail'), 'not-an-email')
    await user.click(screen.getByLabelText('ownerFullName'))

    await waitFor(() =>
      expect(screen.getByTestId('ownerEmail-error')).toHaveTextContent('Enter a valid email'),
    )
  })

  it('starts with PlanName.FREE as the default plan', async () => {
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    expect(screen.getByLabelText('slug')).toHaveValue('')
  })

  it('auto-fills the slug from the business name via slugify', async () => {
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await user.type(screen.getByLabelText('businessName'), 'Acme  Café SAS')

    await waitFor(() => expect(screen.getByLabelText('slug')).toHaveValue('acme-cafe-sas'))
  })

  it('does not call registerWorkspaceAction when the fields fail validation', async () => {
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await user.click(screen.getByRole('button', { name: 'submit' }))

    expect(registerWorkspaceActionMock).not.toHaveBeenCalled()
  })

  it('submits the full form payload including the default plan', async () => {
    registerWorkspaceActionMock.mockResolvedValue({
      ok: true,
      tenant: { slug: 'acme-corp', name: 'Acme Corp' },
    })
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await fillValidFields(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(registerWorkspaceActionMock).toHaveBeenCalledTimes(1))
    expect(registerWorkspaceActionMock).toHaveBeenCalledWith({
      businessName: 'Acme Corp',
      slug: 'acme-corp',
      planName: PlanName.FREE,
      ownerFullName: 'Ana Gomez',
      ownerEmail: 'ana@acme.co',
      ownerPassword: 'Secret123',
    })
  })

  it('sets the tenant slug, invalidates auth.me, toasts success and redirects to setup on success', async () => {
    registerWorkspaceActionMock.mockResolvedValue({
      ok: true,
      tenant: { slug: 'acme-corp', name: 'Acme Corp' },
    })
    const user = userEvent.setup()
    const { Wrapper, client } = makeWrapper()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await fillValidFields(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(pushSpy).toHaveBeenCalledWith(ROUTES.setup.onboarding))
    expect(setTenantSlugSpy).toHaveBeenCalledWith('acme-corp')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.auth.me })
    expect(sileoSuccess).toHaveBeenCalledWith({
      title: `auth.toasts.workspaceCreated:${JSON.stringify({ name: 'Acme Corp' })}`,
    })
  })

  it('shows the onboarding-failed toast with the server error and does not redirect', async () => {
    registerWorkspaceActionMock.mockResolvedValue({ ok: false, error: 'slug taken' })
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await fillValidFields(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(sileoError).toHaveBeenCalledWith({
        title: 'auth.toasts.onboardingFailed',
        description: 'slug taken',
      }),
    )
    expect(pushSpy).not.toHaveBeenCalled()
    expect(setTenantSlugSpy).not.toHaveBeenCalled()
  })

  it('shows a generic onboarding-failed toast when registerWorkspaceAction rejects', async () => {
    registerWorkspaceActionMock.mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await fillValidFields(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(sileoError).toHaveBeenCalledWith({ title: 'auth.toasts.onboardingFailed' }),
    )
  })

  it('disables submission while the mutation is pending', async () => {
    let resolvePromise: (value: {
      ok: true
      tenant: { slug: string; name: string }
    }) => void = () => {}
    registerWorkspaceActionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        }),
    )
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<OnboardingHarness />, { wrapper: Wrapper })

    await fillValidFields(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'pending' })).toBeInTheDocument())

    resolvePromise({ ok: true, tenant: { slug: 'acme-corp', name: 'Acme Corp' } })

    await waitFor(() => expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument())
  })
})
