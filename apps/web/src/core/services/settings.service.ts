import apiUrl from '@/core/config/api-url'
import { handleApiError } from '@/core/helpers/errorHandler'
import type {
  GeneralSettings,
  OnboardingStatus,
  Pipeline,
  CreatePipelineRequest,
  NomenclatureConfig,
  ThemeConfig,
  InviteUserRequest,
  InviteUserResponse,
} from '@repo/shared-types'

const settingsService = {
  async getGeneral(): Promise<GeneralSettings> {
    try {
      const res = await apiUrl.get('/settings/general')
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updateGeneral(data: Record<string, unknown>): Promise<GeneralSettings> {
    try {
      const res = await apiUrl.patch('/settings/general', data)
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getOnboarding(): Promise<OnboardingStatus> {
    try {
      const res = await apiUrl.get('/settings/onboarding')
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updateOnboarding(data: { step: number; completed?: boolean }): Promise<OnboardingStatus> {
    try {
      const res = await apiUrl.patch('/settings/onboarding', data)
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getPipelines(): Promise<Pipeline[]> {
    try {
      const res = await apiUrl.get('/settings/pipelines')
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async createPipeline(data: CreatePipelineRequest): Promise<Pipeline> {
    try {
      const res = await apiUrl.post('/settings/pipelines', data)
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getNomenclature(): Promise<NomenclatureConfig> {
    try {
      const res = await apiUrl.get('/settings/nomenclature')
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updateNomenclature(data: NomenclatureConfig): Promise<NomenclatureConfig> {
    try {
      const res = await apiUrl.patch('/settings/nomenclature', data)
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getTheme(): Promise<ThemeConfig> {
    try {
      const res = await apiUrl.get('/settings/theme')
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updateTheme(data: ThemeConfig): Promise<ThemeConfig> {
    try {
      const res = await apiUrl.patch('/settings/theme', data)
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async uploadLogo(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiUrl.post('/settings/branding/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async uploadFavicon(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiUrl.post('/settings/branding/favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async inviteUser(data: InviteUserRequest): Promise<InviteUserResponse> {
    try {
      const res = await apiUrl.post('/users/invite', data)
      return res.data.data ?? res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default settingsService
