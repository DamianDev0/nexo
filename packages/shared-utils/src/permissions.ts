import { UserRole } from '@repo/shared-types'

// ─── RBAC PERMISSION MATRIX ─────────────────────────────────────────
// Identical in API (guards) and Frontend (UI conditionals)

export type Resource =
  | 'contacts'
  | 'companies'
  | 'deals'
  | 'invoices'
  | 'products'
  | 'reports'
  | 'settings'
  | 'users'
  | 'billing'
  | 'whatsapp'
  | 'workflows'

export type Action = 'create' | 'read' | 'update' | 'delete' | 'export'

type PermissionMap = Record<Resource, Action[]>

const ROLE_PERMISSIONS: Record<UserRole, PermissionMap> = {
  [UserRole.SUPER_ADMIN]: {
    contacts: ['create', 'read', 'update', 'delete', 'export'],
    companies: ['create', 'read', 'update', 'delete', 'export'],
    deals: ['create', 'read', 'update', 'delete', 'export'],
    invoices: ['create', 'read', 'update', 'delete', 'export'],
    products: ['create', 'read', 'update', 'delete', 'export'],
    reports: ['read', 'export'],
    settings: ['read', 'update'],
    users: ['create', 'read', 'update', 'delete'],
    billing: ['read', 'update'],
    whatsapp: ['create', 'read', 'update', 'delete'],
    workflows: ['create', 'read', 'update', 'delete'],
  },
  [UserRole.OWNER]: {
    contacts: ['create', 'read', 'update', 'delete', 'export'],
    companies: ['create', 'read', 'update', 'delete', 'export'],
    deals: ['create', 'read', 'update', 'delete', 'export'],
    invoices: ['create', 'read', 'update', 'delete', 'export'],
    products: ['create', 'read', 'update', 'delete', 'export'],
    reports: ['read', 'export'],
    settings: ['read', 'update'],
    users: ['create', 'read', 'update', 'delete'],
    billing: ['read', 'update'],
    whatsapp: ['create', 'read', 'update', 'delete'],
    workflows: ['create', 'read', 'update', 'delete'],
  },
  [UserRole.ADMIN]: {
    contacts: ['create', 'read', 'update', 'delete', 'export'],
    companies: ['create', 'read', 'update', 'delete', 'export'],
    deals: ['create', 'read', 'update', 'delete', 'export'],
    invoices: ['create', 'read', 'update', 'delete', 'export'],
    products: ['create', 'read', 'update', 'delete', 'export'],
    reports: ['read', 'export'],
    settings: ['read', 'update'],
    users: ['create', 'read', 'update', 'delete'],
    billing: ['read'],
    whatsapp: ['create', 'read', 'update', 'delete'],
    workflows: ['create', 'read', 'update', 'delete'],
  },
  [UserRole.MANAGER]: {
    contacts: ['create', 'read', 'update', 'export'],
    companies: ['create', 'read', 'update', 'export'],
    deals: ['create', 'read', 'update', 'export'],
    invoices: ['create', 'read', 'update'],
    products: ['create', 'read', 'update'],
    reports: ['read'],
    settings: ['read'],
    users: ['read'],
    billing: [],
    whatsapp: ['create', 'read', 'update'],
    workflows: ['read'],
  },
  [UserRole.SALES_REP]: {
    contacts: ['create', 'read', 'update'],
    companies: ['read'],
    deals: ['create', 'read', 'update'],
    invoices: ['read'],
    products: ['read'],
    reports: [],
    settings: [],
    users: [],
    billing: [],
    whatsapp: ['create', 'read'],
    workflows: [],
  },
  [UserRole.MARKETING]: {
    contacts: ['create', 'read', 'update', 'export'],
    companies: ['read'],
    deals: ['read'],
    invoices: [],
    products: ['read'],
    reports: ['read'],
    settings: [],
    users: [],
    billing: [],
    whatsapp: ['create', 'read'],
    workflows: ['read'],
  },
  [UserRole.BILLING]: {
    contacts: ['read'],
    companies: ['read'],
    deals: ['read'],
    invoices: ['create', 'read', 'update', 'export'],
    products: ['read'],
    reports: ['read'],
    settings: [],
    users: [],
    billing: ['read', 'update'],
    whatsapp: [],
    workflows: [],
  },
  [UserRole.SUPPORT]: {
    contacts: ['read', 'update'],
    companies: ['read'],
    deals: ['read'],
    invoices: ['read'],
    products: ['read'],
    reports: [],
    settings: [],
    users: [],
    billing: [],
    whatsapp: ['create', 'read'],
    workflows: [],
  },
  [UserRole.VIEWER]: {
    contacts: ['read'],
    companies: ['read'],
    deals: ['read'],
    invoices: ['read'],
    products: ['read'],
    reports: ['read'],
    settings: [],
    users: [],
    billing: [],
    whatsapp: ['read'],
    workflows: [],
  },
}

/**
 * Check if a role has permission for a specific action on a resource.
 * Use in both API guards and frontend UI conditionals.
 *
 * @example hasPermission(UserRole.SALES_REP, 'invoices', 'create') → false
 * @example hasPermission(UserRole.ADMIN, 'contacts', 'delete') → true
 */
export function hasPermission(role: UserRole, resource: Resource, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions[resource].includes(action)
}

/**
 * Get all allowed actions for a role on a resource.
 */
export function getAllowedActions(role: UserRole, resource: Resource): Action[] {
  return ROLE_PERMISSIONS[role][resource]
}

/**
 * Get all resources a role can access (at least one action).
 */
export function getAccessibleResources(role: UserRole): Resource[] {
  const permissions = ROLE_PERMISSIONS[role]
  return (Object.entries(permissions) as [Resource, Action[]][])
    .filter(([, actions]) => actions.length > 0)
    .map(([resource]) => resource)
}
