import { describe, expect, it } from 'vitest'

import type { ContactListItem } from '@repo/shared-types'

import {
  buildMergeRows,
  decidedRows,
  fillGapsFromLoser,
  mergedTags,
  toggleMergeField,
} from '@/features/merge-contacts/lib/merge-fields'

function contact(overrides: Partial<ContactListItem>): ContactListItem {
  return {
    id: 'c1',
    firstName: 'Carolina',
    lastName: 'Rodríguez',
    email: 'carolina@acme.co',
    phone: '3001234567',
    whatsapp: null,
    documentType: null,
    documentNumber: null,
    avatarUrl: null,
    city: 'Bogotá',
    municipioCode: null,
    status: 'new',
    lifecycleStage: 'lead',
    source: null,
    companyId: null,
    assignedToId: null,
    tags: ['vip'],
    ...overrides,
  } as ContactListItem
}

const WINNER = contact({})
const LOSER = contact({
  id: 'c2',
  email: 'caro@gmail.com',
  phone: null,
  whatsapp: '3009998877',
  city: 'Bogotá',
  tags: ['cliente'],
})

describe('buildMergeRows', () => {
  it('reads both sides of every mergeable field', () => {
    const rows = buildMergeRows(WINNER, LOSER)
    const byField = new Map(rows.map((row) => [row.field, row]))

    expect(byField.get('email')).toMatchObject({
      winner: 'carolina@acme.co',
      loser: 'caro@gmail.com',
      differs: true,
    })
    expect(byField.get('city')).toMatchObject({ differs: false })
  })

  it('treats an empty duplicate value as nothing to decide', () => {
    const rows = buildMergeRows(WINNER, contact({ id: 'c2', email: '   ' }))
    const email = rows.find((row) => row.field === 'email')

    expect(email?.loser).toBeNull()
    expect(email?.differs).toBe(false)
  })
})

describe('decidedRows', () => {
  it('only asks about fields where the two disagree', () => {
    const fields = decidedRows(buildMergeRows(WINNER, LOSER)).map((row) => row.field)

    expect(fields).toContain('email')
    expect(fields).toContain('whatsapp')
    expect(fields).not.toContain('city')
    expect(fields).not.toContain('phone')
  })
})

describe('fillGapsFromLoser', () => {
  it('pre-picks the duplicate only where the survivor has nothing', () => {
    const fields = fillGapsFromLoser(buildMergeRows(WINNER, LOSER))

    expect(fields).toContain('whatsapp')
    expect(fields).not.toContain('email')
  })
})

describe('toggleMergeField', () => {
  it('adds and removes without touching the rest', () => {
    expect(toggleMergeField([], 'email')).toEqual(['email'])
    expect(toggleMergeField(['email', 'phone'], 'email')).toEqual(['phone'])
  })
})

describe('mergedTags', () => {
  it('unions the tags of both contacts without repeating', () => {
    expect(mergedTags(WINNER, LOSER)).toEqual(['vip', 'cliente'])
    expect(mergedTags(WINNER, contact({ id: 'c2', tags: ['vip'] }))).toEqual(['vip'])
  })
})
