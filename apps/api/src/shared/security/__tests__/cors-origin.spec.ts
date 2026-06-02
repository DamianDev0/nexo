import { buildCorsOrigin } from '../cors-origin'

function check(fn: ReturnType<typeof buildCorsOrigin>, origin: string | undefined): boolean {
  let result = false
  fn(origin, (_err, allow) => {
    result = allow ?? false
  })
  return result
}

describe('buildCorsOrigin', () => {
  const origin = buildCorsOrigin('https://app.nexo.com')

  it('allows the exact frontend origin', () => {
    expect(check(origin, 'https://app.nexo.com')).toBe(true)
  })

  it('allows tenant subdomains of the apex', () => {
    expect(check(origin, 'https://acme.nexo.com')).toBe(true)
    expect(check(origin, 'https://victima.nexo.com')).toBe(true)
  })

  it('allows requests with no origin (same-origin / curl)', () => {
    expect(check(origin, undefined)).toBe(true)
  })

  it('allows localhost in development', () => {
    expect(check(origin, 'http://localhost:3001')).toBe(true)
  })

  it('blocks unrelated domains', () => {
    expect(check(origin, 'https://evil.com')).toBe(false)
    expect(check(origin, 'https://nexo.com.evil.com')).toBe(false)
  })

  it('blocks malformed origins', () => {
    expect(check(origin, 'not-a-url')).toBe(false)
  })
})
