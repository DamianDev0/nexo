import { request } from '@/shared/api/request'

import type {
  ActivityTypeDef,
  ContactTaxonomy,
  CustomFieldHeaderAnalysis,
  CustomFieldEntity,
  FieldDef,
  GeneralSettings,
  OnboardingStatus,
  Pipeline,
  NomenclatureConfig,
  ThemeConfig,
  SidebarConfig,
} from '@repo/shared-types'

export type PipelineStageInput = {
  name: string
  color: string
  probability: number
  position: number
}

export type PipelinePatch = { name?: string; isDefault?: boolean }

export type CreatePipelineInput = PipelinePatch & { name: string; stages: PipelineStageInput[] }

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

  analyzeCustomFieldHeaders: (entity: CustomFieldEntity, file: File) =>
    request<CustomFieldHeaderAnalysis>({
      method: 'post',
      url: `/settings/custom-fields/${entity}/analyze-headers`,
      data: fileForm(file),
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  replaceCustomFields: (entity: CustomFieldEntity, fields: FieldDef[]) =>
    request<void>({
      method: 'patch',
      url: `/settings/custom-fields/${entity}`,
      data: { fields },
    }),

  updateContactTaxonomy: (data: ContactTaxonomy) =>
    request<ContactTaxonomy>({ method: 'patch', url: '/settings/contact-taxonomy', data }),

  getGeneral: () => request<GeneralSettings>({ method: 'get', url: '/settings/general' }),

  getOnboarding: () => request<OnboardingStatus>({ method: 'get', url: '/settings/onboarding' }),

  updateOnboarding: (data: { step: number; completed?: boolean }) =>
    request<OnboardingStatus>({ method: 'patch', url: '/settings/onboarding', data }),

  getPipelines: () => request<Pipeline[]>({ method: 'get', url: '/settings/pipelines' }),

  createPipeline: (data: CreatePipelineInput) =>
    request<Pipeline>({ method: 'post', url: '/settings/pipelines', data }),

  patchPipeline: (id: string, data: PipelinePatch) =>
    request<Pipeline>({ method: 'patch', url: `/settings/pipelines/${id}`, data }),

  deletePipeline: (id: string) =>
    request<void>({ method: 'delete', url: `/settings/pipelines/${id}` }),

  replacePipelineStages: (id: string, stages: PipelineStageInput[]) =>
    request<Pipeline>({
      method: 'patch',
      url: `/settings/pipelines/${id}/stages`,
      data: { stages },
    }),

  getActivityTypes: () =>
    request<ActivityTypeDef[]>({ method: 'get', url: '/settings/activity-types' }),

  createActivityType: (data: ActivityTypeDef) =>
    request<ActivityTypeDef[]>({ method: 'post', url: '/settings/activity-types', data }),

  updateActivityType: (key: string, data: ActivityTypeDef) =>
    request<ActivityTypeDef[]>({ method: 'put', url: `/settings/activity-types/${key}`, data }),

  deleteActivityType: (key: string) =>
    request<ActivityTypeDef[]>({ method: 'delete', url: `/settings/activity-types/${key}` }),

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
