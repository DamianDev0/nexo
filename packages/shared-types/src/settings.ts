// ─── THEME ────────────────────────────────────────────────────────────────────

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

// ─── NOMENCLATURE ─────────────────────────────────────────────────────────────

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

// ─── SIDEBAR / NAVIGATION ─────────────────────────────────────────────────────

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

// ─── CUSTOM FIELDS ────────────────────────────────────────────────────────────

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

// ─── PIPELINE (see pipelines.ts for full types) ──────────────────────────────
// Pipeline and PipelineStage are exported from pipelines.ts

// ─── ACTIVITY TYPES ───────────────────────────────────────────────────────────

export type ActivityTypeDef = {
  key: string
  label: string
  icon: string
  color: string
  trackDuration: boolean
  isSystem: boolean // system types cannot be deleted
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

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

export type OnboardingStatus = {
  step: number
  completed: boolean
}

// ─── GENERAL SETTINGS (GET /settings/general response) ───────────────────────

export type GeneralSettings = {
  id: string
  name: string
  slug: string
  plan: string
  business: {
    nit?: string
    taxRegime?: string
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
    sector?: string
    nomenclature?: Record<string, string>
    iconPack?: string
  }
}

// ─── PIPELINE CREATE REQUEST ─────────────────────────────────────────────────

export type CreatePipelineRequest = {
  name: string
  isDefault?: boolean
  stages: Array<{ name: string; color: string; probability: number }>
}

// ─── NOMENCLATURE CONFIG ─────────────────────────────────────────────────────

export type NomenclatureConfig = {
  contact?: EntityTerm
  company?: EntityTerm
  deal?: EntityTerm
  activity?: EntityTerm
}

// ─── THEME CONFIG (patch) ────────────────────────────────────────────────────

export type ThemeConfig = Partial<TenantTheme>

// ─── THEME HISTORY ──────────────────────────────────────────────────────────

export type ThemeHistoryEntry = {
  id: string
  tenantId: string
  changedBy: string
  previousConfig: TenantTheme
  createdAt: string
}

// ─── USER INVITE ─────────────────────────────────────────────────────────────

export type InviteUserRequest = {
  email: string
  role: string
}

export type InviteUserResponse = {
  inviteToken: string
  email: string
  expiresAt: string
}

// ─── EMAIL BRANDING ───────────────────────────────────────────────────────────

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
