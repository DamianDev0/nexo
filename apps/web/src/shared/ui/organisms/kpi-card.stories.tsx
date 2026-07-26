import { KpiCard } from './kpi-card'
import { KPI_FIXTURES } from './kpi-card.fixtures'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Organisms/KpiCard',
  component: KpiCard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof KpiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { data: KPI_FIXTURES.pipeline, className: 'w-72' },
}

export const WithNote: Story = {
  args: { data: KPI_FIXTURES.closing, className: 'w-72' },
}

export const Inverted: Story = {
  args: { data: KPI_FIXTURES.stalled, inverted: true, className: 'w-72' },
}

export const Row: Story = {
  args: { data: KPI_FIXTURES.pipeline },
  render: () => (
    <div className="grid w-4xl grid-cols-4 gap-4">
      <KpiCard data={KPI_FIXTURES.pipeline} />
      <KpiCard data={KPI_FIXTURES.closing} />
      <KpiCard data={KPI_FIXTURES.won} />
      <KpiCard data={KPI_FIXTURES.stalled} inverted />
    </div>
  ),
}

export const WorstCase: Story = {
  args: { data: KPI_FIXTURES.worst, className: 'w-72' },
}
