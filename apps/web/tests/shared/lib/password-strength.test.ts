import { describe, expect, it } from 'vitest'

import { assessPassword } from '@/shared/lib/password-strength'

describe('assessPassword', () => {
  it('scores an empty password as zero', () => {
    const result = assessPassword('')

    expect(result.score).toBe(0)
    expect(result.total).toBe(5)
    expect(result.requirements.every((req) => !req.met)).toBe(true)
  })

  it('counts each satisfied requirement', () => {
    const result = assessPassword('abc12345')

    expect(result.score).toBe(3)
    expect(result.requirements.find((r) => r.key === 'uppercase')?.met).toBe(false)
    expect(result.requirements.find((r) => r.key === 'special')?.met).toBe(false)
  })

  it('gives a full score to a password meeting every rule', () => {
    expect(assessPassword('Str0ng!Pass').score).toBe(5)
  })

  it('treats unicode symbols as special characters', () => {
    expect(assessPassword('Añ0········').requirements.find((r) => r.key === 'special')?.met).toBe(
      true,
    )
  })
})
