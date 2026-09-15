import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CONTACT_COLUMNS_FIXTURE, buildContact } from '../../msw/handlers'

import type { ContactRowActions, ContactTaxonomyMaps } from '@/entities/contact'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactColumnDef, ContactListItem } from '@repo/shared-types'

import { usePendingContactPatches } from '@/entities/contact/model/contact-pending.store'
import { useBoardColumns } from '@/widgets/contacts-board/model/useBoardColumns'

vi.mock('@/entities/tag', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/tag')>()),
  useTagCatalog: () => new Map(),
}))

vi.mock('@/entities/team-member', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/team-member')>()),
  useTeamMembers: () => [
    { id: 'u1', fullName: 'Ana Ruiz', email: 'ana@nexo.test', role: 'admin', avatarUrl: null },
  ],
}))

const TAXONOMY: ContactTaxonomyMaps & {
  statuses: TaxonomyChoice[]
  sources: TaxonomyChoice[]
  lifecycleStages: TaxonomyChoice[]
} = {
  statusByKey: new Map(),
  sourceByKey: new Map(),
  lifecycleByKey: new Map(),
  statuses: [],
  sources: [],
  lifecycleStages: [],
}

function boardColumnsArgs(catalog: ContactColumnDef[] = CONTACT_COLUMNS_FIXTURE) {
  return {
    catalog,
    taxonomy: TAXONOMY,
    rowActions: {} as ContactRowActions,
    entity: 'contact',
    dense: false,
  }
}

function Harness({ contact, columnId }: Readonly<{ contact: ContactListItem; columnId: string }>) {
  const columns = useBoardColumns(boardColumnsArgs())
  const table = useReactTable({
    data: [contact],
    columns: [...columns],
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })
  const row = table.getRowModel().rows[0]!
  const cell = row.getVisibleCells().find((candidate) => candidate.column.id === columnId)!
  return <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
}

beforeEach(() => {
  usePendingContactPatches.getState().end([...usePendingContactPatches.getState().ids])
})

describe('useBoardColumns', () => {
  it('marks the contact row as saving only while a patch is pending for it', () => {
    const contact = buildContact({ id: 'c-1' })
    const { container } = render(<Harness contact={contact} columnId="name" />)

    expect(container.querySelector('[aria-busy="true"]')).toBeNull()

    act(() => usePendingContactPatches.getState().begin(['c-1']))
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()

    act(() => usePendingContactPatches.getState().end(['c-1']))
    expect(container.querySelector('[aria-busy="true"]')).toBeNull()
  })

  it('does not mark an unrelated row as saving', () => {
    const contact = buildContact({ id: 'c-2' })
    const { container } = render(<Harness contact={contact} columnId="name" />)

    act(() => usePendingContactPatches.getState().begin(['someone-else']))

    expect(container.querySelector('[aria-busy="true"]')).toBeNull()
  })
})
