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
  '#F87171',
  '#FB7185',
  '#FB923C',
  '#FBBF24',
  '#A3E635',
  '#4ADE80',
  '#34D399',
  '#2DD4BF',
  '#22D3EE',
  '#38BDF8',
  '#60A5FA',
  '#818CF8',
  '#A78BFA',
  '#C084FC',
  '#F472B6',
  '#94A3B8',
  '#9CA3AF',
  '#6B6E8D',
  'linear-gradient(45deg, #f6d365, #fda085)',
  'linear-gradient(45deg, #84fab0, #8fd3f4)',
] as const

export const SWATCH_COLOR_PATTERN =
  /^(#[0-9A-Fa-f]{6}|linear-gradient\(45deg(, #[0-9A-Fa-f]{6}){2,3}\))$/

export function taxonomyColorAt(index: number): string {
  return TAXONOMY_COLOR_PALETTE[index % TAXONOMY_COLOR_PALETTE.length] as string
}

export const DEFAULT_CONTACT_STATUS_KEY = 'new'

export const TAXONOMY_DESCRIPTION_MAX = 200

export type TaxonomyOption = {
  key: string
  label: string | null
  description: string | null
  color: string
  order: number
  isSystem: boolean
  enabled: boolean
}

export type ContactTaxonomy = {
  statuses: TaxonomyOption[]
  sources: TaxonomyOption[]
  types: TaxonomyOption[]
}

function systemOption(key: string, color: string, order: number): TaxonomyOption {
  return { key, label: null, description: null, color, order, isSystem: true, enabled: true }
}

const DEFAULT_CONTACT_STATUSES: TaxonomyOption[] = [
  systemOption('new', '#60A5FA', 1),
  systemOption('in_contact', '#A78BFA', 2),
  systemOption('qualified', '#22D3EE', 3),
  systemOption('unqualified', '#94A3B8', 4),
  systemOption('nurturing', '#FBBF24', 5),
  systemOption('client', '#4ADE80', 6),
  systemOption('inactive', '#6B6E8D', 7),
  systemOption('lost', '#F87171', 8),
]

const DEFAULT_CONTACT_SOURCES: TaxonomyOption[] = [
  systemOption('manual', '#94A3B8', 1),
  systemOption('whatsapp', '#4ADE80', 2),
  systemOption('web_form', '#60A5FA', 3),
  systemOption('referral', '#A78BFA', 4),
  systemOption('import', '#9CA3AF', 5),
  systemOption('email_campaign', '#FBBF24', 6),
  systemOption('social_media', '#F472B6', 7),
  systemOption('paid_ad', '#FB923C', 8),
  systemOption('organic_search', '#22D3EE', 9),
  systemOption('event', '#C084FC', 10),
  systemOption('cold_call', '#38BDF8', 11),
  systemOption('partner', '#2DD4BF', 12),
  systemOption('chat', '#818CF8', 13),
]

const DEFAULT_CONTACT_TYPES: TaxonomyOption[] = [
  systemOption('customer', '#60A5FA', 1),
  systemOption('supplier', '#FBBF24', 2),
  systemOption('partner', '#A78BFA', 3),
  systemOption('other', '#9CA3AF', 4),
]

export const DEFAULT_CONTACT_TAXONOMY: ContactTaxonomy = {
  statuses: DEFAULT_CONTACT_STATUSES,
  sources: DEFAULT_CONTACT_SOURCES,
  types: DEFAULT_CONTACT_TYPES,
}
