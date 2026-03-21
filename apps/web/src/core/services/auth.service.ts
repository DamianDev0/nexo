import apiUrl from '@/core/config/api-url'
import { handleApiError } from '@/core/helpers/errorHandler'
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  OnboardingRequest,
  OnboardingResponse,
} from '@repo/shared-types'

const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiUrl.post('/auth/login', data)
      return response.data.data ?? response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async onboard(data: OnboardingRequest): Promise<OnboardingResponse> {
    try {
      const response = await apiUrl.post('/auth/onboard', data)
      return response.data.data ?? response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async me(): Promise<MeResponse> {
    try {
      const response = await apiUrl.get('/auth/me')
      return response.data.data ?? response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async logout(): Promise<void> {
    try {
      await apiUrl.post('/auth/logout')
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiUrl.post('/auth/forgot-password', { email })
    } catch {
      // Anti-enumeration
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiUrl.post('/auth/reset-password', { token, newPassword })
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async refreshToken(): Promise<void> {
    try {
      await apiUrl.post('/auth/refresh')
    } catch (error) {
      throw handleApiError(error)
    }
  },

  getGoogleAuthUrl(): string {
    return `${apiUrl.defaults.baseURL}/auth/google`
  },
}

export default authService
