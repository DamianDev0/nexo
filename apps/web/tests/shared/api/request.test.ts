import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import apiUrl from '@/shared/api/http'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/http', () => ({
  default: { request: vi.fn() },
}))

const mockedRequest = vi.mocked(apiUrl.request)

describe('request', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('unwraps the data envelope when present', async () => {
    mockedRequest.mockResolvedValue({ data: { data: { id: '1' } } })

    const result = await request<{ id: string }>({ method: 'get', url: '/x' })

    expect(result).toEqual({ id: '1' })
  })

  it('falls back to the raw body when there is no envelope', async () => {
    mockedRequest.mockResolvedValue({ data: { id: '2' } })

    const result = await request<{ id: string }>({ method: 'get', url: '/x' })

    expect(result).toEqual({ id: '2' })
  })

  it('normalizes axios errors into ApiErrorResponse', async () => {
    const headers = new AxiosHeaders()
    const error = new AxiosError(
      'Request failed',
      '400',
      undefined,
      {},
      {
        status: 400,
        statusText: 'Bad Request',
        headers,
        config: { headers },
        data: { message: 'Invalid email', error: 'Bad Request' },
      },
    )
    mockedRequest.mockRejectedValue(error)

    await expect(request({ method: 'post', url: '/x' })).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid email',
      error: 'Bad Request',
    })
  })

  it('normalizes network failures with statusCode 0', async () => {
    const error = new AxiosError('Network Error')
    error.request = {}
    mockedRequest.mockRejectedValue(error)

    await expect(request({ method: 'get', url: '/x' })).rejects.toMatchObject({
      statusCode: 0,
      error: 'Network Error',
    })
  })
})
