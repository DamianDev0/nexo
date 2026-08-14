import { describe, expect, it } from 'vitest'

import { teamInitial, toSidebarTeam } from '@/widgets/app-shell/lib/sidebar-identity'

describe('teamInitial', () => {
  it('takes the first letter in upper case', () => {
    expect(teamInitial('Nexo')).toBe('N')
  })

  it('ignores leading whitespace', () => {
    expect(teamInitial('  acme')).toBe('A')
  })

  it('falls back when the name is blank', () => {
    expect(teamInitial('   ')).toBe('?')
    expect(teamInitial('')).toBe('?')
  })

  it('keeps accented initials intact', () => {
    expect(teamInitial('Ángulo')).toBe('Á')
  })
})

describe('toSidebarTeam', () => {
  it('carries the name through', () => {
    expect(toSidebarTeam({ name: 'Nexo', plan: 'pro' }).name).toBe('Nexo')
  })

  it('falls back to a default plan label when there is none', () => {
    expect(toSidebarTeam({ name: 'Nexo', plan: null }).plan).toBeTruthy()
  })
})
