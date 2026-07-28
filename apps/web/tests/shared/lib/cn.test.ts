import { describe, expect, it } from 'vitest'

import { cn } from '@/shared/lib/cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('resolves tailwind conflicts keeping the last class', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })
})
