function decodeExpiry(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const decoded: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const exp = (decoded as { exp?: unknown }).exp
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}

export function isSessionActive(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false
  const exp = decodeExpiry(token)
  return exp !== null && exp * 1000 > now
}
