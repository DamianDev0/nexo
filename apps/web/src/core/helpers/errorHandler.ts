import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@repo/shared-types'

export function handleApiError(error: unknown): ApiErrorResponse {
  if (error instanceof AxiosError) {
    if (error.response) {
      const { status, data } = error.response
      const rawMessage = data?.message
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : rawMessage || data?.error || 'Unknown error occurred'

      return {
        statusCode: status,
        message,
        error: data?.error,
        timestamp: data?.timestamp,
        path: data?.path,
      }
    }

    if (error.request) {
      return {
        statusCode: 0,
        message: 'Unable to connect to the server',
        error: 'Network Error',
        timestamp: new Date().toISOString(),
        path: '',
      }
    }
  }

  return {
    statusCode: 0,
    message: error instanceof Error ? error.message : 'Unexpected error occurred',
    error: 'Unexpected Error',
    timestamp: new Date().toISOString(),
    path: '',
  }
}
