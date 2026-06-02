export type CorsOriginCallback = (err: Error | null, allow?: boolean) => void
export type CorsOriginFn = (origin: string | undefined, callback: CorsOriginCallback) => void

function apexOf(hostname: string): string {
  const parts = hostname.split('.')
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname
}

function hostOf(value: string): string | null {
  try {
    return new URL(value).hostname
  } catch {
    return null
  }
}

/**
 * Allows the configured frontend origin plus any subdomain of its apex domain
 * (tenant subdomains like acme.app.com), and localhost for local development.
 */
export function buildCorsOrigin(frontendUrl: string): CorsOriginFn {
  const frontendHost = hostOf(frontendUrl)
  const apex = frontendHost ? apexOf(frontendHost) : ''

  return (origin, callback) => {
    if (!origin) {
      callback(null, true)
      return
    }

    const host = hostOf(origin)
    if (!host) {
      callback(null, false)
      return
    }

    const allowed =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      origin === frontendUrl ||
      (apex !== '' && (host === apex || host.endsWith(`.${apex}`)))

    callback(null, allowed)
  }
}
