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
