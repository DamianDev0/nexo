import { StatTile } from './stat-tile'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Molecules/StatTile',
  component: StatTile,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatTile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: 128, label: 'Contactos listos' },
  render: (args) => (
    <div className="w-44">
      <StatTile {...args} />
    </div>
  ),
}

export const AllTones: Story = {
  args: { value: 0, label: '' },
  render: () => (
    <div className="flex w-[480px] gap-2">
      <StatTile value={412} label="Totales" tone="neutral" centered />
      <StatTile value={380} label="Listos" tone="ready" centered />
      <StatTile value={24} label="Avisos" tone="warning" centered />
      <StatTile value={8} label="Errores" tone="error" centered />
    </div>
  ),
}

export const WorstCase: Story = {
  args: {
    value: 1284903,
    label: 'Etiqueta larguísima que describe demasiado y desborda el tile',
  },
  render: (args) => (
    <div className="w-40">
      <StatTile {...args} />
    </div>
  ),
}
