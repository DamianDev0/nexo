// ─── API RESPONSE TYPES (shared between API and Frontend) ───────────

export type BaseResponse = {
  statusCode: number
  timestamp: string
  path: string
  method: string
}

export type ApiSuccessResponse<T> = BaseResponse & {
  message: string
  data: T
}

export type PaginationMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ApiPaginatedResponse<T> = ApiSuccessResponse<T[]> & {
  pagination: PaginationMeta
}

export type ApiErrorResponse = BaseResponse & {
  message: string
  error: string
}

export type ValidationErrorDetail = {
  field: string
  message: string
  value?: unknown
}

export type ApiValidationErrorResponse = ApiErrorResponse & {
  errors: ValidationErrorDetail[]
}

// ─── PAGINATED RESULT (returned by services, unwrapped by interceptor) ──
export type PaginatedResult<T> = {
  data: T[]
  pagination: PaginationMeta
}
