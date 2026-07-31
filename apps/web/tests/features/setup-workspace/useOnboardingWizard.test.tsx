import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { STEP_KEYS } from '@/features/setup-workspace/config/wizard.constants'
import { useOnboardingWizard } from '@/features/setup-workspace/model/useOnboardingWizard'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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
