import type { IndustrySector, PlanName, TaxRegime, UserRole } from './enums'

export type ThemeColors = {
  primary: string
  primaryForeground: string
  secondary: string
  accent: string
  sidebar: string
  sidebarForeground: string
}

export type ThemeTypography = {
  fontFamily: 'inter' | 'roboto' | 'poppins' | 'nunito' | 'system'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  density: 'compact' | 'comfortable' | 'spacious'
}

export type ThemeBranding = {
  logoUrl: string | null
  faviconUrl: string | null
  loginBgUrl: string | null
  companyName: string
  loginTagline: string | null
}

export type TenantTheme = {
  colors: ThemeColors
  typography: ThemeTypography
  branding: ThemeBranding
  iconPack: 'outline' | 'filled' | 'duotone' | 'rounded'
  darkModeDefault: 'light' | 'dark' | 'system'
}

export type BrandingPublic = {
  companyName: string
  logoUrl: string | null
  faviconUrl: string | null
  loginBgUrl: string | null
  loginTagline: string | null
  darkModeDefault: TenantTheme['darkModeDefault']
  primaryColor: string
}

export type ThemeTokens = {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  'primary-hover': string
  'primary-pressed': string
  'primary-pale': string
  'primary-deep': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
  'chart-1': string
  'chart-2': string
  'chart-3': string
  'chart-4': string
  'chart-5': string
  sidebar: string
  'sidebar-foreground': string
  'sidebar-primary': string
  'sidebar-primary-foreground': string
  'sidebar-accent': string
  'sidebar-accent-foreground': string
  'sidebar-border': string
  'sidebar-ring': string
  body: string
  faint: string
  'disabled-fg': string
  'border-strong': string
  'row-divider': string
  'row-hover': string
  'row-selected': string
  'mesh-base': string
  'map-accent': string
  'map-grid': string
  'map-label': string
  'map-node': string
}

export type ResolvedThemeTokens = {
  light: ThemeTokens
  dark: ThemeTokens
}

export type EntityTerm = {
  singular: string
  plural: string
}

export type TenantNomenclature = {
  contact: EntityTerm
  company: EntityTerm
  deal: EntityTerm
  activity: EntityTerm
}

export type SidebarModule = {
  key: string
  label: string
  icon: string
  enabled: boolean
  order: number
  customIconUrl: string | null
  required: boolean
}

export type SidebarConfig = {
  modules: SidebarModule[]
}

export const REQUIRED_SIDEBAR_MODULES = new Set(['dashboard', 'settings'])

export const DEFAULT_SIDEBAR_MODULE_KEYS = [
  'dashboard',
  'contacts',
  'companies',
  'deals',
  'activities',
  'invoices',
  'products',
  'reports',
  'settings',
] as const

export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'url'
  | 'phone'
  | 'email'
  | 'file'
  | 'relation'
  | 'formula'
  | 'geolocation'

export type CustomFieldEntity = 'contacts' | 'companies' | 'deals'

export type SelectOption = {
  value: string
  label: string
  color?: string
}

export type FieldDef = {
  key: string
  label: string
  type: CustomFieldType
  required: boolean
  unique: boolean
  order: number
  defaultValue?: unknown
  placeholder?: string
  options?: SelectOption[]
  min?: number
  max?: number
  formula?: string
  relationEntity?: CustomFieldEntity
}

export type CustomFieldsConfig = {
  contacts: FieldDef[]
  companies: FieldDef[]
  deals: FieldDef[]
}

export type FieldPermissionLevel = 'all' | 'manager_plus' | 'admin_plus' | 'owner_only' | 'none'

export type FieldPermission = {
  visibility: FieldPermissionLevel
  editable: FieldPermissionLevel
}

export type FieldPermissionsConfig = Record<CustomFieldEntity, Record<string, FieldPermission>>

export type ActivityTypeDef = {
  key: string
  label: string
  icon: string
  color: string
  trackDuration: boolean
  isSystem: boolean
}

export const DEFAULT_ACTIVITY_TYPES: ActivityTypeDef[] = [
  {
    key: 'call',
    label: 'Call',
    icon: 'phone',
    color: '#22C55E',
    trackDuration: true,
    isSystem: true,
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'mail',
    color: '#3B82F6',
    trackDuration: false,
    isSystem: true,
  },
  {
    key: 'meeting',
    label: 'Meeting',
    icon: 'calendar',
    color: '#8B5CF6',
    trackDuration: true,
    isSystem: true,
  },
  {
    key: 'task',
    label: 'Task',
    icon: 'check-square',
    color: '#F59E0B',
    trackDuration: false,
    isSystem: true,
  },
  {
    key: 'note',
    label: 'Note',
    icon: 'file-text',
    color: '#6B7280',
    trackDuration: false,
    isSystem: true,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: 'message-circle',
    color: '#25D366',
    trackDuration: false,
    isSystem: true,
  },
]

export type OnboardingStatus = {
  step: number
  completed: boolean
}

export type GeneralSettings = {
  id: string
  name: string
  slug: string
  plan: PlanName
  business: {
    nit?: string
    taxRegime?: TaxRegime
    phone?: string
    email?: string
    website?: string
    address?: { street?: string; city?: string; department?: string; zipCode?: string }
  }
  i18n: {
    language?: string
    timezone?: string
    currency?: string
    dateFormat?: string
    numberFormat?: string
  }
  billing: Record<string, unknown>
  industry: {
    sector?: IndustrySector
    nomenclature?: Record<string, string>
    iconPack?: string
  }
}

export type CreatePipelineRequest = {
  name: string
  isDefault?: boolean
  stages: Array<{ name: string; color: string; probability: number }>
}

export type NomenclatureConfig = {
  contact?: EntityTerm
  company?: EntityTerm
  deal?: EntityTerm
  activity?: EntityTerm
}

export type ThemeConfig = Partial<TenantTheme>

export type ThemeHistoryEntry = {
  id: string
  tenantId: string
  changedBy: string
  previousConfig: TenantTheme
  createdAt: string
}

export type InviteUserRequest = {
  email: string
  role: UserRole
}

export type InviteUserResponse = {
  inviteToken: string
  email: string
  expiresAt: string
}

export type EmailBrandingContext = {
  companyName: string
  primaryColor: string
  logoUrl: string | null
}

export type TenantEmailConfig = {
  fromName: string | null
  fromEmail: string | null
  replyToEmail: string | null
  customDomain: string | null
  signature: string | null
  provider: 'resend' | 'sendgrid' | null
  sendgridApiKey: string | null
}

export const TAXONOMY_KEY_PATTERN = /^[a-z][a-z0-9_]{0,39}$/

export const TAXONOMY_COLOR_PALETTE = [
  '#3B82F6',
  '#8B5CF6',
  '#06B6D4',
  '#22C55E',
  '#14B8A6',
  '#F59E0B',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#A855F7',
  '#6366F1',
  '#0EA5E9',
  '#64748B',
  '#94A3B8',
] as const

export function taxonomyColorAt(index: number): string {
  return TAXONOMY_COLOR_PALETTE[index % TAXONOMY_COLOR_PALETTE.length] as string
}

export const DEFAULT_CONTACT_STATUS_KEY = 'new'

export type TaxonomyOption = {
  key: string
  label: string | null
  color: string
  order: number
  isSystem: boolean
}

export type ContactTaxonomy = {
  statuses: TaxonomyOption[]
  sources: TaxonomyOption[]
}

function systemOption(key: string, color: string, order: number): TaxonomyOption {
  return { key, label: null, color, order, isSystem: true }
}

export const DEFAULT_CONTACT_STATUSES: TaxonomyOption[] = [
  systemOption('new', '#3B82F6', 1),
  systemOption('in_contact', '#8B5CF6', 2),
  systemOption('qualified', '#06B6D4', 3),
  systemOption('unqualified', '#94A3B8', 4),
  systemOption('nurturing', '#F59E0B', 5),
  systemOption('client', '#22C55E', 6),
  systemOption('inactive', '#64748B', 7),
  systemOption('lost', '#EF4444', 8),
]

export const DEFAULT_CONTACT_SOURCES: TaxonomyOption[] = [
  systemOption('manual', '#64748B', 1),
  systemOption('whatsapp', '#22C55E', 2),
  systemOption('web_form', '#3B82F6', 3),
  systemOption('referral', '#8B5CF6', 4),
  systemOption('import', '#94A3B8', 5),
  systemOption('email_campaign', '#F59E0B', 6),
  systemOption('social_media', '#EC4899', 7),
  systemOption('paid_ad', '#F97316', 8),
  systemOption('organic_search', '#06B6D4', 9),
  systemOption('event', '#A855F7', 10),
  systemOption('cold_call', '#0EA5E9', 11),
  systemOption('partner', '#14B8A6', 12),
  systemOption('chat', '#6366F1', 13),
]

export const DEFAULT_CONTACT_TAXONOMY: ContactTaxonomy = {
  statuses: DEFAULT_CONTACT_STATUSES,
  sources: DEFAULT_CONTACT_SOURCES,
}
