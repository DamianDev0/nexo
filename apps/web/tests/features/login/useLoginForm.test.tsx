import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReactNode } from 'react'

import { useLoginForm } from '@/features/login/model/useLoginForm'
import { ROUTES } from '@/shared/config/routes'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const loginActionMock = vi.fn()

vi.mock('@/features/login/api/login.action', () => ({
  loginAction: (input: unknown) => loginActionMock(input),
}))

vi.mock('i18next', () => ({ t: (key: string) => key }))

const pushSpy = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushSpy }),
}))

const sileoError = vi.fn()

vi.mock('sileo', () => ({
  sileo: { error: (...args: unknown[]) => sileoError(...args) },
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

function LoginHarness() {
  const { control, handleSubmit, isPending } = useLoginForm()
  return (
    <form onSubmit={handleSubmit} aria-label="login-form">
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <>
            <input aria-label="email" {...field} value={field.value} />
            <span data-testid="email-raw-value">{JSON.stringify(field.value)}</span>
            <span data-testid="email-error">{fieldState.error?.message ?? ''}</span>
          </>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <>
            <input aria-label="password" {...field} value={field.value} />
            <span data-testid="password-raw-value">{JSON.stringify(field.value)}</span>
          </>
        )}
      />
      <button type="submit">{isPending ? 'pending' : 'submit'}</button>
    </form>
  )
}

beforeEach(() => {
  loginActionMock.mockReset()
  pushSpy.mockClear()
  sileoError.mockClear()
  setTenantSlugSpy.mockClear()
})

async function fillValidCredentials(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('email'), 'ana@acme.co')
  await user.type(screen.getByLabelText('password'), 'Secret123!')
}

describe('useLoginForm', () => {
  it('defaults email and password to empty strings, not undefined', () => {
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    expect(screen.getByTestId('email-raw-value')).toHaveTextContent('""')
    expect(screen.getByTestId('password-raw-value')).toHaveTextContent('""')
  })

  it('validates the email on blur because the form runs in onBlur mode', async () => {
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await user.type(screen.getByLabelText('email'), 'not-an-email')
    await user.click(screen.getByLabelText('password'))

    await waitFor(() =>
      expect(screen.getByTestId('email-error')).toHaveTextContent('Enter a valid email address'),
    )
  })

  it('does not call loginAction when the fields fail validation', async () => {
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await user.click(screen.getByRole('button', { name: 'submit' }))

    expect(loginActionMock).not.toHaveBeenCalled()
  })

  it('submits the trimmed form values to loginAction', async () => {
    loginActionMock.mockResolvedValue({ ok: true, slug: 'acme' })
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(loginActionMock).toHaveBeenCalledTimes(1))
    expect(loginActionMock).toHaveBeenCalledWith({
      email: 'ana@acme.co',
      password: 'Secret123!',
    })
  })

  it('sets the tenant slug, invalidates auth.me and redirects to the dashboard on success', async () => {
    loginActionMock.mockResolvedValue({ ok: true, slug: 'acme' })
    const user = userEvent.setup()
    const { Wrapper, client } = makeWrapper()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    render(<LoginHarness />, { wrapper: Wrapper })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(pushSpy).toHaveBeenCalledWith(ROUTES.app.dashboard))
    expect(setTenantSlugSpy).toHaveBeenCalledWith('acme')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.auth.me })
  })

  it('shows the workspace-not-found toast with a description and does not redirect', async () => {
    loginActionMock.mockResolvedValue({ ok: false, error: 'workspace_not_found' })
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(sileoError).toHaveBeenCalledWith({
        title: 'auth.toasts.workspaceNotFound',
        description: 'auth.toasts.workspaceNotFoundDesc',
      }),
    )
    expect(pushSpy).not.toHaveBeenCalled()
    expect(setTenantSlugSpy).not.toHaveBeenCalled()
  })

  it('shows the login-failed toast without a description for invalid credentials', async () => {
    loginActionMock.mockResolvedValue({ ok: false, error: 'invalid_credentials' })
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(sileoError).toHaveBeenCalledWith({
        title: 'auth.toasts.loginFailed',
        description: undefined,
      }),
    )
  })

  it('tells the user the server is unreachable instead of blaming their email', async () => {
    loginActionMock.mockResolvedValue({ ok: false, error: 'unknown' })
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(sileoError).toHaveBeenCalledWith({
        title: 'auth.toasts.loginFailed',
        description: 'auth.toasts.loginUnavailableDesc',
      }),
    )
  })

  it('shows a generic toast when loginAction itself rejects', async () => {
    loginActionMock.mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(sileoError).toHaveBeenCalledWith({ title: 'auth.toasts.loginFailed' }),
    )
  })

  it('disables submission while the mutation is pending', async () => {
    let resolvePromise: (value: { ok: true; slug: string }) => void = () => {}
    loginActionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        }),
    )
    const user = userEvent.setup()
    const { Wrapper } = makeWrapper()
    render(<LoginHarness />, { wrapper: Wrapper })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'pending' })).toBeInTheDocument())

    resolvePromise({ ok: true, slug: 'acme' })

    await waitFor(() => expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument())
  })
})
