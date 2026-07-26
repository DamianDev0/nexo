import type { ApiErrorResponse } from '@repo/shared-types'

export class ApiError extends Error {
  readonly statusCode: number
  readonly response: ApiErrorResponse

  constructor(response: ApiErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.statusCode = response.statusCode
    this.response = response
  }
}
