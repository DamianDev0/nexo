import { BadRequestException } from '@nestjs/common'

const BLOCKED_HOSTS = new Set([
  'localhost',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
  'metadata.google.internal',
])

function isPrivateHost(host: string): boolean {
  if (host.endsWith('.local') || host.endsWith('.internal')) return true

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])]
    if (a === 10) return true
    if (a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
  }

  if (host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) return true

  return false
}

export function assertSafeWebhookUrl(raw: string): void {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new BadRequestException('Invalid webhook URL')
  }

  if (url.protocol !== 'https:') {
    throw new BadRequestException('Webhook URL must use https')
  }

  const host = url.hostname.toLowerCase()
  if (BLOCKED_HOSTS.has(host) || isPrivateHost(host)) {
    throw new BadRequestException('Webhook URL host is not allowed')
  }
}
