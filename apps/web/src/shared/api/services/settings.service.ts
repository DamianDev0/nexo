import { request } from '@/shared/api/request'

import type {
  GeneralSettings,
  OnboardingStatus,
  Pipeline,
  CreatePipelineRequest,
  NomenclatureConfig,
  ThemeConfig,
  ThemeHistoryEntry,
  SidebarConfig,
  InviteUserRequest,
  InviteUserResponse,
} from '@repo/shared-types'

function fileForm(file: File): FormData {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

const settingsService = {
  getGeneral: () => request<GeneralSettings>({ method: 'get', url: '/settings/general' }),

  updateGeneral: (data: Record<string, unknown>) =>
    request<GeneralSettings>({ method: 'patch', url: '/settings/general', data }),

  getOnboarding: () => request<OnboardingStatus>({ method: 'get', url: '/settings/onboarding' }),

  updateOnboarding: (data: { step: number; completed?: boolean }) =>
    request<OnboardingStatus>({ method: 'patch', url: '/settings/onboarding', data }),

  getPipelines: () => request<Pipeline[]>({ method: 'get', url: '/settings/pipelines' }),

  createPipeline: (data: CreatePipelineRequest) =>
    request<Pipeline>({ method: 'post', url: '/settings/pipelines', data }),

  getNomenclature: () =>
    request<NomenclatureConfig>({ method: 'get', url: '/settings/nomenclature' }),

  updateNomenclature: (data: NomenclatureConfig) =>
    request<NomenclatureConfig>({ method: 'patch', url: '/settings/nomenclature', data }),

  getTheme: () => request<ThemeConfig>({ method: 'get', url: '/settings/theme' }),

  updateTheme: (data: ThemeConfig) =>
    request<ThemeConfig>({ method: 'patch', url: '/settings/theme', data }),

  getThemeHistory: (limit = 5) =>
    request<ThemeHistoryEntry[]>({ method: 'get', url: `/settings/theme/history?limit=${limit}` }),

  uploadLogo: (file: File) =>
    request<{ url: string }>({
      method: 'post',
      url: '/settings/branding/logo',
      data: fileForm(file),
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadFavicon: (file: File) =>
    request<{ url: string }>({
      method: 'post',
      url: '/settings/branding/favicon',
      data: fileForm(file),
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  inviteUser: (data: InviteUserRequest) =>
    request<InviteUserResponse>({ method: 'post', url: '/users/invite', data }),

  getNavigation: () => request<SidebarConfig>({ method: 'get', url: '/settings/navigation' }),

  updateNavigation: (data: SidebarConfig) =>
    request<SidebarConfig>({ method: 'patch', url: '/settings/navigation', data }),
}

export default settingsService
