import { BadRequestException } from '@nestjs/common'
import { assertSafeWebhookUrl } from '../webhook-url.util'

describe('assertSafeWebhookUrl', () => {
  it('accepts a public https URL', () => {
    expect(() => assertSafeWebhookUrl('https://example.com/hooks')).not.toThrow()
  })

  it('rejects non-https schemes', () => {
    expect(() => assertSafeWebhookUrl('http://example.com')).toThrow(BadRequestException)
    expect(() => assertSafeWebhookUrl('file:///etc/passwd')).toThrow(BadRequestException)
  })

  it('rejects localhost and loopback', () => {
    expect(() => assertSafeWebhookUrl('https://localhost/x')).toThrow(BadRequestException)
    expect(() => assertSafeWebhookUrl('https://127.0.0.1/x')).toThrow(BadRequestException)
  })

  it('rejects the cloud metadata endpoint (SSRF)', () => {
    expect(() => assertSafeWebhookUrl('https://169.254.169.254/latest/meta-data')).toThrow(
      BadRequestException,
    )
  })

  it('rejects private IPv4 ranges', () => {
    expect(() => assertSafeWebhookUrl('https://10.0.0.5/x')).toThrow(BadRequestException)
    expect(() => assertSafeWebhookUrl('https://192.168.1.1/x')).toThrow(BadRequestException)
    expect(() => assertSafeWebhookUrl('https://172.16.0.1/x')).toThrow(BadRequestException)
  })

  it('rejects internal DNS suffixes', () => {
    expect(() => assertSafeWebhookUrl('https://db.internal/x')).toThrow(BadRequestException)
  })

  it('rejects a malformed URL', () => {
    expect(() => assertSafeWebhookUrl('not-a-url')).toThrow(BadRequestException)
  })
})
