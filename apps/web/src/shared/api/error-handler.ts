import { AxiosError } from 'axios'

import type { ApiErrorResponse, ApiValidationErrorResponse } from '@repo/shared-types'

const UNKNOWN_ERROR_MESSAGE = 'Unknown error occurred'
const NETWORK_ERROR_MESSAGE = 'Unable to connect to the server'
const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error occurred'
const NETWORK_ERROR_LABEL = 'Network Error'
const UNEXPECTED_ERROR_LABEL = 'Unexpected Error'
const GENERIC_ERROR_LABEL = 'Error'

type ApiErrorBody = Partial<Omit<ApiValidationErrorResponse, 'message'>> & {
  message?: string | string[]
}

function emptyMeta() {
  return { timestamp: new Date().toISOString(), path: '', method: '' }
}

function fromResponseBody(
  status: number,
  body: ApiErrorBody,
): ApiErrorResponse | ApiValidationErrorResponse {
  const rawMessage = body.message
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(', ')
    : (rawMessage ?? body.error ?? UNKNOWN_ERROR_MESSAGE)

  const base: ApiErrorResponse = {
    statusCode: status,
    message,
    error: body.error ?? GENERIC_ERROR_LABEL,
    timestamp: body.timestamp ?? new Date().toISOString(),
    path: body.path ?? '',
    method: body.method ?? '',
  }

  return body.errors ? { ...base, errors: body.errors } : base
}

export function handleApiError(error: unknown): ApiErrorResponse | ApiValidationErrorResponse {
  if (error instanceof AxiosError) {
    if (error.response) {
      return fromResponseBody(error.response.status, (error.response.data ?? {}) as ApiErrorBody)
    }

    if (error.request) {
      return {
        statusCode: 0,
        message: NETWORK_ERROR_MESSAGE,
        error: NETWORK_ERROR_LABEL,
        ...emptyMeta(),
      }
    }
  }

  return {
    statusCode: 0,
    message: error instanceof Error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    error: UNEXPECTED_ERROR_LABEL,
    ...emptyMeta(),
  }
}
