import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TaxonomyKind } from '@/features/manage-settings/lib/taxonomy-edit'
import type { ContactTaxonomy, ContactTaxonomyUsage } from '@repo/shared-types'

import { useTaxonomyPane } from '@/features/manage-settings/model/useTaxonomyPane'

const handleAdd = vi.fn()
const handlePatch = vi.fn()
const handleRemove = vi.fn()
const handleReorder = vi.fn()
const reassignMutate = vi.fn()

const TAXONOMY: ContactTaxonomy = {
  statuses: [
    {
      key: 'new',
      label: 'Nuevo',
      description: null,
      color: '#60A5FA',
      order: 1,
      isSystem: true,
      enabled: true,
    },
    {
      key: 'vip',
      label: 'VIP',
      description: null,
      color: '#F87171',
      order: 2,
      isSystem: false,
      enabled: true,
    },
  ],
  sources: [
    {
      key: 'manual',
      label: 'Manual',
      description: null,
      color: '#4ADE80',
      order: 1,
      isSystem: true,
      enabled: true,
    },
  ],
  lifecycleStages: [
    {
      key: 'lead',
      label: 'Lead',
      description: null,
      color: '#60A5FA',
      order: 1,
      isSystem: true,
      enabled: true,
    },
  ],
}

let usage: ContactTaxonomyUsage = {
  statuses: {},
  sources: {},
  lifecycleStages: {},
  tags: {},
}

let contacts = {
  taxonomy: TAXONOMY as ContactTaxonomy | null,
  isLoading: false,
  handleAdd,
  handlePatch,
  handleRemove,
  handleReorder,
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) =>
      key === 'contacts.status.dormido' ? 'Dormido' : (opts?.defaultValue ?? key),
  }),
}))

vi.mock('@/features/manage-settings/model/settings-context', () => ({
  useManageSettings: () => ({ contacts }),
}))

vi.mock('@/features/manage-settings/query/useTaxonomyUsage', () => ({
  useTaxonomyUsage: () => usage,
  useReassignTaxonomy: () => ({ mutate: reassignMutate, isPending: false }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  usage = { statuses: {}, sources: {}, lifecycleStages: {}, tags: {} }
  contacts = {
    taxonomy: TAXONOMY,
    isLoading: false,
    handleAdd,
    handlePatch,
    handleRemove,
    handleReorder,
  }
})

describe('useTaxonomyPane', () => {
  it.each([
    ['statuses', 'status'],
    ['sources', 'source'],
    ['lifecycleStages', 'lifecycleStage'],
  ] as Array<[TaxonomyKind, string]>)('maps kind %s to namespace %s', (kind, namespace) => {
    const { result } = renderHook(() => useTaxonomyPane(kind))

    expect(result.current.namespace).toBe(namespace)
    expect(result.current.rows.map((row) => row.option)).toEqual(TAXONOMY[kind])
  })

  it('falls back to empty options while taxonomy is null', () => {
    contacts = { ...contacts, taxonomy: null, isLoading: true }

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    expect(result.current.rows).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('creates an option through the editor with name and description', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.editor.openCreate())
    expect(result.current.editor.open).toBe(true)
    expect(result.current.editor.editing).toBeNull()

    act(() => result.current.editor.onSubmit({ name: 'Dormido', description: 'Sin contacto' }))

    expect(handleAdd).toHaveBeenCalledWith('statuses', 'Dormido', 'Sin contacto')
  })

  it('edits an option through the editor patching label and description', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.actions.onEdit('vip'))
    expect(result.current.editor.editing).toEqual({ name: 'VIP', description: '' })

    act(() => result.current.editor.onSubmit({ name: 'VIP Gold', description: 'Alto valor' }))

    expect(handlePatch).toHaveBeenCalledWith('statuses', 'vip', {
      label: 'VIP Gold',
      description: 'Alto valor',
    })
  })

  it('removes directly when no contacts use the option', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.actions.onRemove('vip'))

    expect(handleRemove).toHaveBeenCalledWith('statuses', 'vip')
    expect(result.current.removal).toBeNull()
  })

  it('requires reassignment when contacts use the option', () => {
    usage = { ...usage, statuses: { vip: 3 } }

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.actions.onRemove('vip'))

    expect(handleRemove).not.toHaveBeenCalled()
    expect(result.current.removal?.source).toEqual({ label: 'VIP', count: 3 })
    expect(result.current.removal?.candidates).toEqual([
      { key: 'new', label: 'Nuevo', color: '#60A5FA' },
    ])
  })

  it('confirms reassignment then removes the option', () => {
    usage = { ...usage, statuses: { vip: 3 } }
    reassignMutate.mockImplementation((_input, opts: { onSuccess: () => void }) => opts.onSuccess())

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.actions.onRemove('vip'))
    act(() => result.current.removal?.confirm('new'))

    expect(reassignMutate).toHaveBeenCalledWith(
      { kind: 'status', fromKey: 'vip', toKey: 'new' },
      expect.anything(),
    )
    expect(handleRemove).toHaveBeenCalledWith('statuses', 'vip')
    expect(result.current.removal).toBeNull()
  })

  it('exposes per-option usage counts', () => {
    usage = { ...usage, statuses: { new: 7 } }

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    const counts = Object.fromEntries(result.current.rows.map((row) => [row.option.key, row.count]))
    expect(counts.new).toBe(7)
  })

  it('prefills the editor with the localized label of a system option, never its raw key', () => {
    contacts = {
      ...contacts,
      taxonomy: {
        ...TAXONOMY,
        statuses: [
          {
            key: 'dormido',
            label: null,
            description: 'Sin contacto hace 90 dias',
            color: '#94A3B8',
            order: 1,
            isSystem: true,
            enabled: true,
          },
        ],
      },
    }

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    expect(result.current.rows[0]!.label).toBe('Dormido')

    act(() => result.current.actions.onEdit('dormido'))

    expect(result.current.editor.editing).toEqual({
      name: 'Dormido',
      description: 'Sin contacto hace 90 dias',
    })
  })

  it('falls back to the raw key only when there is no translation either', () => {
    contacts = {
      ...contacts,
      taxonomy: {
        ...TAXONOMY,
        statuses: [
          {
            key: 'sin_traducir',
            label: null,
            description: null,
            color: '#94A3B8',
            order: 1,
            isSystem: false,
            enabled: true,
          },
        ],
      },
    }

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.actions.onEdit('sin_traducir'))

    expect(result.current.editor.editing).toEqual({ name: 'sin_traducir', description: '' })
  })

  it('prefills the editor with the localized label of a system option, never its raw key', () => {
    contacts = {
      ...contacts,
      taxonomy: {
        ...TAXONOMY,
        statuses: [
          {
            key: 'dormido',
            label: null,
            description: 'Sin contacto hace 90 dias',
            color: '#94A3B8',
            order: 1,
            isSystem: true,
            enabled: true,
          },
        ],
      },
    }

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    expect(result.current.rows[0]!.label).toBe('Dormido')

    act(() => result.current.actions.onEdit('dormido'))

    expect(result.current.editor.editing).toEqual({
      name: 'Dormido',
      description: 'Sin contacto hace 90 dias',
    })
  })

  it('falls back to the raw key only when there is no translation either', () => {
    contacts = {
      ...contacts,
      taxonomy: {
        ...TAXONOMY,
        statuses: [
          {
            key: 'sin_traducir',
            label: null,
            description: null,
            color: '#94A3B8',
            order: 1,
            isSystem: false,
            enabled: true,
          },
        ],
      },
    }

    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.actions.onEdit('sin_traducir'))

    expect(result.current.editor.editing).toEqual({ name: 'sin_traducir', description: '' })
  })
})
