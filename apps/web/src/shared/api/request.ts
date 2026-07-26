import { handleApiError } from '@/shared/api/error-handler'
import apiUrl from '@/shared/api/http'

import type { AxiosRequestConfig } from 'axios'

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await apiUrl.request(config)
    return res.data.data ?? res.data
  } catch (error) {
    throw handleApiError(error)
  }
}
