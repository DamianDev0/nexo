import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { useOnboardingWizard } from './useOnboardingWizard'
import { STEP_KEYS } from './wizard-steps'

import type { ReactNode } from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const API = 'http://localhost:8080/api/v1'
const server = setupServer()

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

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function wrapper({ children }: Readonly<{ children: ReactNode }>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

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

  it('never advances past the final step', async () => {
    serverStep = STEP_KEYS.length
    server.use(...onboardingHandlers())

    const { result } = renderHook(() => useOnboardingWizard(), { wrapper })
    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length))

    result.current.nextStep()

    await waitFor(() => expect(result.current.currentStep).toBe(STEP_KEYS.length))
  })
})
