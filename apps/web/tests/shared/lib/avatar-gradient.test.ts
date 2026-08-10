import { describe, expect, it } from 'vitest'

import { avatarGradient } from '@/shared/lib/avatar-gradient'

const AVATAR_GRADIENTS = [
  'bg-radial-[at_40%_80%] from-indigo-600 via-blue-400 to-sky-200',
  'bg-radial-[at_45%_80%] from-rose-600 via-purple-500 to-fuchsia-200',
  'bg-radial-[at_50%_70%] from-red-600 via-orange-400 to-orange-200',
  'bg-radial-[at_40%_75%] from-teal-500 via-emerald-400 to-lime-200',
  'bg-radial-[at_45%_80%] from-amber-600 via-amber-400 to-yellow-100',
  'bg-radial-[at_40%_80%] from-cyan-600 via-sky-400 to-cyan-100',
] as const

describe('avatarGradient', () => {
  it('returns the exact gradient class computed by the seed hash', () => {
    expect(avatarGradient('')).toBe(AVATAR_GRADIENTS[0])
    expect(avatarGradient('a')).toBe(AVATAR_GRADIENTS[1])
    expect(avatarGradient('b')).toBe(AVATAR_GRADIENTS[2])
    expect(avatarGradient('carlos perez')).toBe(AVATAR_GRADIENTS[3])
  })

  it('is deterministic for the same seed', () => {
    expect(avatarGradient('juan.perez@nexo.co')).toBe(avatarGradient('juan.perez@nexo.co'))
  })

  it('always returns one of the known gradient classes', () => {
    for (const seed of ['', 'a', 'ab', 'workspace-1', 'workspace-2', 'zzzzzzzz']) {
      expect(AVATAR_GRADIENTS).toContain(avatarGradient(seed))
    }
  })

  it('distinguishes different seeds into different buckets', () => {
    expect(avatarGradient('a')).not.toBe(avatarGradient('b'))
    expect(avatarGradient('b')).not.toBe(avatarGradient('carlos perez'))
  })
})
