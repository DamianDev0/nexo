import 'server-only'

import { CACHE_TAGS } from '../cache-tags'
import { apiFetch } from '../client'

import type {
  ActivityTypeDef,
  ContactTaxonomy,
  CustomFieldEntity,
  FieldDef,
  GeneralSettings,
  NomenclatureConfig,
  OnboardingStatus,
  Pipeline,
  SidebarConfig,
  ThemeConfig,
} from '@repo/shared-types'

export const getGeneral = () =>
  apiFetch<GeneralSettings>('/settings/general', { tags: [CACHE_TAGS.settingsGeneral] })

export const getTheme = () =>
  apiFetch<ThemeConfig>('/settings/theme', { tags: [CACHE_TAGS.settingsTheme] })

export const getContactTaxonomy = () =>
  apiFetch<ContactTaxonomy>('/settings/contact-taxonomy', { cache: 'no-store' })

export const getCustomFields = (entity: CustomFieldEntity) =>
  apiFetch<FieldDef[]>(`/settings/custom-fields/${entity}`, { cache: 'no-store' })

export const getNavigation = () =>
  apiFetch<SidebarConfig>('/settings/navigation', { cache: 'no-store' })

export const getNomenclature = () =>
  apiFetch<NomenclatureConfig>('/settings/nomenclature', { cache: 'no-store' })

export const getPipelines = () => apiFetch<Pipeline[]>('/settings/pipelines')

export const getActivityTypes = () =>
  apiFetch<ActivityTypeDef[]>('/settings/activity-types', { cache: 'no-store' })

export const getOnboarding = () =>
  apiFetch<OnboardingStatus>('/settings/onboarding', { cache: 'no-store' })
