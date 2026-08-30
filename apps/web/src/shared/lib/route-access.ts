export type RouteDecision = 'allow' | 'redirect-login' | 'redirect-dashboard'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/contacts',
  '/companies',
  '/deals',
  '/activities',
  '/invoices',
  '/products',
  '/reports',
  '/settings',
  '/onboarding/setup',
] as const
const GUEST_ONLY_PATHS = ['/login', '/onboarding'] as const

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
}

export function isGuestOnlyPath(pathname: string): boolean {
  if (isProtectedPath(pathname)) return false
  return GUEST_ONLY_PATHS.some((path) => matchesPrefix(pathname, path))
}

export function decideRoute(pathname: string, hasSession: boolean): RouteDecision {
  if (isGuestOnlyPath(pathname)) {
    return hasSession ? 'redirect-dashboard' : 'allow'
  }
  return hasSession ? 'allow' : 'redirect-login'
}
