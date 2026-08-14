import { UserRole } from '@repo/shared-types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { useWatch } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useStepTeam } from '@/features/setup-workspace/model/useStepTeam'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '' })),
}))
vi.mock('i18next', () => ({
  t: (key: string, opts?: Record<string, unknown>) =>
    opts ? `${key}::${JSON.stringify(opts)}` : key,
}))

const sileoError = vi.fn()
const sileoSuccess = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: (...args: unknown[]) => sileoSuccess(...args),
  },
}))

function useTeamStep(onNext: () => void) {
  const step = useStepTeam(onNext)
  const values = useWatch({ control: step.control, name: 'invites' })
  return {
    ...step,
    invites: step.fields.map((field, index) => ({ ...(values[index] ?? field), id: field.id })),
  }
}

const server = createMswServer()

beforeEach(() => {
  sileoError.mockClear()
  sileoSuccess.mockClear()
})

describe('useStepTeam', () => {
  it('starts with a single empty invite row', () => {
    const { result } = renderHook(() => useTeamStep(vi.fn()), { wrapper })

    expect(result.current.invites).toHaveLength(1)
    expect(result.current.invites[0]).toMatchObject({ email: '', role: UserRole.SALES_REP })
  })

  it('adds a new empty row on handleAdd', () => {
    const { result } = renderHook(() => useTeamStep(vi.fn()), { wrapper })

    act(() => result.current.handleAdd())

    expect(result.current.invites).toHaveLength(2)
    expect(result.current.invites[1]).toMatchObject({ email: '', role: UserRole.SALES_REP })
  })

  it('removes a row by id and ignores an unknown id', () => {
    const { result } = renderHook(() => useTeamStep(vi.fn()), { wrapper })
    act(() => result.current.handleAdd())
    const secondId = result.current.invites[1]?.id
    if (!secondId) throw new Error('missing invite id')

    act(() => result.current.handleRemove('not-a-real-id'))
    expect(result.current.invites).toHaveLength(2)

    act(() => result.current.handleRemove(secondId))
    expect(result.current.invites).toHaveLength(1)
  })

  it('removes the first row too, when its index is 0', () => {
    const { result } = renderHook(() => useTeamStep(vi.fn()), { wrapper })
    act(() => result.current.handleAdd())
    const firstId = result.current.invites[0]?.id
    if (!firstId) throw new Error('missing invite id')
    const secondId = result.current.invites[1]?.id

    act(() => result.current.handleRemove(firstId))

    expect(result.current.invites).toHaveLength(1)
    expect(result.current.invites[0]?.id).toBe(secondId)
  })

  it('patches only the provided fields on a row and ignores an unknown id', () => {
    const { result } = renderHook(() => useTeamStep(vi.fn()), { wrapper })
    const id = result.current.invites[0]?.id
    if (!id) throw new Error('missing invite id')

    act(() => result.current.handleUpdate(id, { email: 'ana@acme.co' }))
    expect(result.current.invites[0]).toMatchObject({
      email: 'ana@acme.co',
      role: UserRole.SALES_REP,
    })

    const idAfterFirstUpdate = result.current.invites[0]?.id
    if (!idAfterFirstUpdate) throw new Error('missing invite id')
    act(() => result.current.handleUpdate(idAfterFirstUpdate, { role: UserRole.MANAGER }))
    expect(result.current.invites[0]).toMatchObject({
      email: 'ana@acme.co',
      role: UserRole.MANAGER,
    })

    act(() => result.current.handleUpdate('not-a-real-id', { email: 'ghost@acme.co' }))
    expect(result.current.invites[0]?.email).toBe('ana@acme.co')
  })

  it('keeps the row id stable across updates so a row keyed by id never remounts', () => {
    const { result } = renderHook(() => useTeamStep(vi.fn()), { wrapper })
    const idBefore = result.current.invites[0]?.id
    if (!idBefore) throw new Error('missing invite id')

    act(() => result.current.handleUpdate(idBefore, { email: 'a@b.com' }))
    expect(result.current.invites[0]?.id).toBe(idBefore)

    act(() => result.current.handleUpdate(idBefore, { email: 'ab@b.com' }))
    expect(result.current.invites[0]?.id).toBe(idBefore)
    expect(result.current.invites[0]?.email).toBe('ab@b.com')
  })

  it('advances without calling the API when every row is blank', async () => {
    let calls = 0
    server.use(
      http.post(`${API}/users/invite`, () => {
        calls += 1
        return HttpResponse.json({ data: {} })
      }),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useTeamStep(onNext), { wrapper })

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(calls).toBe(0)
    expect(sileoSuccess).not.toHaveBeenCalled()
  })

  it('invites only the rows with a non-blank email and toasts the sent count', async () => {
    let calls = 0
    server.use(
      http.post(`${API}/users/invite`, () => {
        calls += 1
        return HttpResponse.json({ data: {} })
      }),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useTeamStep(onNext), { wrapper })
    const firstId = result.current.invites[0]?.id
    if (!firstId) throw new Error('missing invite id')

    act(() => result.current.handleAdd())
    act(() => result.current.handleUpdate(firstId, { email: 'ana@acme.co' }))

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(calls).toBe(1)
    expect(sileoSuccess).toHaveBeenCalledWith({
      title: 'auth.toasts.invitesSent::{"count":1}',
    })
  })

  it('treats a whitespace-only email as blank and excludes it from the invite', async () => {
    let calls = 0
    server.use(
      http.post(`${API}/users/invite`, () => {
        calls += 1
        return HttpResponse.json({ data: {} })
      }),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useTeamStep(onNext), { wrapper })
    const firstId = result.current.invites[0]?.id
    if (!firstId) throw new Error('missing invite id')

    act(() => result.current.handleUpdate(firstId, { email: '   ' }))
    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(calls).toBe(0)
    expect(sileoSuccess).not.toHaveBeenCalled()
  })

  it('shows an invites-specific error toast and does not advance when the API rejects', async () => {
    server.use(
      http.post(`${API}/users/invite`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'bad email',
            error: 'Bad Request',
            timestamp: '',
            path: '/users/invite',
            method: 'POST',
          },
          { status: 400 },
        ),
      ),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useTeamStep(onNext), { wrapper })
    const firstId = result.current.invites[0]?.id
    if (!firstId) throw new Error('missing invite id')

    act(() => result.current.handleUpdate(firstId, { email: 'ana@acme.co' }))
    result.current.handleSave()

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(sileoError).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'auth.toasts.invitesFailed' }),
    )
    expect(onNext).not.toHaveBeenCalled()
  })
})
