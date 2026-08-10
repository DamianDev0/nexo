import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ReactNode } from 'react'

import { STEP_KEYS } from '@/features/setup-workspace/config/wizard.constants'
import { useOnboardingWizard } from '@/features/setup-workspace/model/useOnboardingWizard'
import { ROUTES } from '@/shared/config/routes'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const pushSpy = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushSpy, refresh: vi.fn() }),
}))

vi.mock('i18next', () => ({ t: (key: string) => key }))

const sileoError = vi.fn()
const sileoSuccess = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: (...args: unknown[]) => sileoSuccess(...args),
  },
}))

const server = createMswServer()

let serverStep = 1

function onboardingHandlers() {
  return [
    http.get(`${API}/settings/onboarding`, () =>
      HttpResponse.json({ data: { step: serverStep, completed: false } }),
    ),
    http.patch(`${API}/settings/onboarding`, async ({ request }) => {
      const body = (await request.json()) as { step: number }
      serverStep = body.step
      return HttpResponse.json({ data: { step: serverStep, completed: false } })
    }),
  ]
}

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, Wrapper }
}

beforeEach(() => {
  pushSpy.mockClear()
  sileoError.mockClear()
  sileoSuccess.mockClear()
})

describe('useOnboardingWizard', () => {
  it('exposes one step per STEP_KEYS entry', async () => {
    serverStep = 1
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })

    expect(result.current.totalSteps).toBe(STEP_KEYS.length)
    await waitFor(() => expect(result.current.currentStep).toBe(1))
  })

  it('reaches the final done step through nextStep alone', async () => {
    serverStep = STEP_KEYS.length - 1
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length - 1))

    result.current.nextStep()

    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length))
    expect(result.current.progressPercent).toBe(100)
  })

  it('advances one step at a time, not straight to the end', async () => {
    serverStep = 1
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(1))

    result.current.nextStep()

    await waitFor(() => expect(result.current.currentStep).toBe(2))
  })

  it('never advances past the final step', async () => {
    serverStep = STEP_KEYS.length
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length))

    result.current.nextStep()

    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length))
  })

  it('steps back one position with prevStep', async () => {
    serverStep = 3
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(3))

    result.current.prevStep()

    await waitFor(() => expect(result.current.currentStep).toBe(2))
  })

  it('never steps back before the first step', async () => {
    serverStep = 1
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(1))

    result.current.prevStep()

    await waitFor(() => expect(result.current.currentStep).toBe(1))
  })

  it('skipSetup jumps straight to the final step', async () => {
    serverStep = 2
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(2))

    result.current.skipSetup()

    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length))
  })

  it('shows a toast with the server error message when persisting a step fails', async () => {
    serverStep = 1
    server.use(
      http.get(`${API}/settings/onboarding`, () =>
        HttpResponse.json({ data: { step: 1, completed: false } }),
      ),
      http.patch(`${API}/settings/onboarding`, () =>
        HttpResponse.json(
          {
            statusCode: 500,
            message: 'boom',
            error: 'Internal Server Error',
            timestamp: '',
            path: '/settings/onboarding',
            method: 'PATCH',
          },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(1))

    result.current.nextStep()

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(sileoError).toHaveBeenCalledWith({ title: 'common.saveFailed', description: 'boom' })
  })

  it('completeOnboarding marks the wizard done, refreshes the session and redirects home', async () => {
    let onboardingBody: unknown
    server.use(
      http.get(`${API}/settings/onboarding`, () =>
        HttpResponse.json({ data: { step: STEP_KEYS.length, completed: false } }),
      ),
      http.patch(`${API}/settings/onboarding`, async ({ request }) => {
        onboardingBody = await request.json()
        return HttpResponse.json({ data: { step: STEP_KEYS.length, completed: true } })
      }),
    )

    const { client, Wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length))

    await act(async () => {
      await result.current.completeOnboarding()
    })

    expect(onboardingBody).toEqual({ step: STEP_KEYS.length, completed: true })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.auth.me })
    expect(sileoSuccess).toHaveBeenCalledWith({
      title: 'auth.toasts.setupComplete',
      description: 'auth.toasts.welcomeToNexo',
    })
    expect(pushSpy).toHaveBeenCalledWith(ROUTES.app.dashboard)
  })
})
