import { request } from '@/shared/api/request'

import type {
  ContactTaxonomy,
  CustomFieldEntity,
  FieldDef,
  GeneralSettings,
  OnboardingStatus,
  Pipeline,
  NomenclatureConfig,
  ThemeConfig,
  SidebarConfig,
} from '@repo/shared-types'

function fileForm(file: File): FormData {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

const settingsService = {
  getContactTaxonomy: () =>
    request<ContactTaxonomy>({ method: 'get', url: '/settings/contact-taxonomy' }),

  getCustomFields: (entity: CustomFieldEntity) =>
    request<FieldDef[]>({ method: 'get', url: `/settings/custom-fields/${entity}` }),

  createCustomField: (entity: CustomFieldEntity, data: FieldDef) =>
    request<FieldDef>({ method: 'post', url: `/settings/custom-fields/${entity}`, data }),

  patchCustomField: (entity: CustomFieldEntity, key: string, data: Partial<FieldDef>) =>
    request<FieldDef>({ method: 'patch', url: `/settings/custom-fields/${entity}/${key}`, data }),

  archiveCustomField: (entity: CustomFieldEntity, key: string) =>
    request<void>({ method: 'delete', url: `/settings/custom-fields/${entity}/${key}` }),

  updateContactTaxonomy: (data: ContactTaxonomy) =>
    request<ContactTaxonomy>({ method: 'patch', url: '/settings/contact-taxonomy', data }),

  getGeneral: () => request<GeneralSettings>({ method: 'get', url: '/settings/general' }),

  getOnboarding: () => request<OnboardingStatus>({ method: 'get', url: '/settings/onboarding' }),

  updateOnboarding: (data: { step: number; completed?: boolean }) =>
    request<OnboardingStatus>({ method: 'patch', url: '/settings/onboarding', data }),

  getPipelines: () => request<Pipeline[]>({ method: 'get', url: '/settings/pipelines' }),

  getNomenclature: () =>
    request<NomenclatureConfig>({ method: 'get', url: '/settings/nomenclature' }),

  getTheme: () => request<ThemeConfig>({ method: 'get', url: '/settings/theme' }),

  uploadLogo: (file: File) =>
    request<{ url: string }>({
      method: 'post',
      url: '/settings/branding/logo',
      data: fileForm(file),
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getNavigation: () => request<SidebarConfig>({ method: 'get', url: '/settings/navigation' }),
}

export default settingsService
