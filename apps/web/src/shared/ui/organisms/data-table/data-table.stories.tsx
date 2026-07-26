import { AvatarSquircle } from '../../atoms/avatar-squircle'

import { CONTACT_ROWS, WORST_ROW, manyRows, type ContactRow } from './data-table.fixtures'

import { DataTable } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Organisms/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

function ContactRowView({ row }: Readonly<{ row: ContactRow }>) {
  return (
    <DataTable.Row selected={row.selected}>
      <DataTable.Cell className="flex max-w-[46px] items-center">
        <span
          className={
            row.selected
              ? 'flex size-[18px] items-center justify-center rounded-sm bg-primary text-[11px] font-black text-primary-foreground'
              : 'block size-[18px] rounded-sm border-[1.5px] border-border-strong'
          }
        >
          {row.selected ? '✓' : ''}
        </span>
      </DataTable.Cell>
      <DataTable.Cell className="flex flex-[1.7] items-center gap-3">
        <AvatarSquircle initials={row.initials} tone={row.tone} />
        <DataTable.RowTitle title={row.name} subtitle={row.role} />
      </DataTable.Cell>
      <DataTable.Cell className="flex-[1.5] truncate">{row.company}</DataTable.Cell>
      <DataTable.Cell className="flex-[1.4] truncate text-sm">{row.email}</DataTable.Cell>
      <DataTable.Cell className="flex-[0.9]">{row.city}</DataTable.Cell>
    </DataTable.Row>
  )
}

function ContactHeader() {
  return (
    <DataTable.Header>
      <DataTable.Cell className="max-w-[46px]" />
      <DataTable.Cell className="flex-[1.7]">Nombre</DataTable.Cell>
      <DataTable.Cell className="flex-[1.5]">Empresa</DataTable.Cell>
      <DataTable.Cell className="flex-[1.4]">Correo</DataTable.Cell>
      <DataTable.Cell className="flex-[0.9]">Ciudad</DataTable.Cell>
    </DataTable.Header>
  )
}

export const Default: Story = {
  args: { children: null },
  render: () => (
    <DataTable className="min-w-[860px]">
      <DataTable.Toolbar>
        <DataTable.Search placeholder="Buscar nombre, correo o NIT…" />
      </DataTable.Toolbar>
      <ContactHeader />
      {CONTACT_ROWS.map((row) => (
        <ContactRowView key={row.id} row={{ ...row, selected: false }} />
      ))}
    </DataTable>
  ),
}

export const WithBulkSelection: Story = {
  args: { children: null },
  render: () => (
    <DataTable className="min-w-[860px]">
      <DataTable.Toolbar>
        <DataTable.Search placeholder="Buscar nombre, correo o NIT…" />
      </DataTable.Toolbar>
      <DataTable.BulkBar label="2 contactos seleccionados">
        <DataTable.BulkAction>Asignar responsable</DataTable.BulkAction>
        <DataTable.BulkAction>Agregar a lista</DataTable.BulkAction>
        <DataTable.BulkAction destructive>Eliminar</DataTable.BulkAction>
      </DataTable.BulkBar>
      <ContactHeader />
      {CONTACT_ROWS.map((row) => (
        <ContactRowView key={row.id} row={row} />
      ))}
    </DataTable>
  ),
}

export const SingleRow: Story = {
  args: { children: null },
  render: () => (
    <DataTable className="min-w-[860px]">
      <ContactHeader />
      <ContactRowView row={{ ...CONTACT_ROWS[0]!, selected: false }} />
    </DataTable>
  ),
}

export const WorstCase: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { children: null },
  render: () => (
    <DataTable className="min-w-[860px]">
      <ContactHeader />
      <ContactRowView row={WORST_ROW} />
      {manyRows(500).map((row) => (
        <ContactRowView key={row.id} row={row} />
      ))}
    </DataTable>
  ),
}
