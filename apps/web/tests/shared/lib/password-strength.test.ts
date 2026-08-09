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

  it('isolates each character class', () => {
    const metKeys = (value: string) =>
      assessPassword(value)
        .requirements.filter((req) => req.met)
        .map((req) => req.key)

    expect(metKeys('11111111')).toEqual(['minLength', 'number'])
    expect(metKeys('aaaaaaaa')).toEqual(['minLength', 'lowercase'])
    expect(metKeys('AAAAAAAA')).toEqual(['minLength', 'uppercase'])
    expect(metKeys('!!!!!!!!')).toEqual(['minLength', 'special'])
    expect(metKeys('a1')).toEqual(['number', 'lowercase'])
  })

  it('treats unicode symbols as special characters', () => {
    expect(assessPassword('Añ0········').requirements.find((r) => r.key === 'special')?.met).toBe(
      true,
    )
  })
})
