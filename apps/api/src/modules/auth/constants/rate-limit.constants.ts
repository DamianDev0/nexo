export const RATE_LIMIT_MAX_ATTEMPTS = 10
export const RATE_LIMIT_WINDOW_SECONDS = 900

export function rateLimitCacheKey(schemaName: string, ip: string): string {
  return `auth:fail:${schemaName}:${ip}`
}
