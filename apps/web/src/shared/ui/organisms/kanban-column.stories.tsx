import { KanbanCard, KanbanGhost } from './kanban-card'
import { KanbanColumn } from './kanban-column'
import { KANBAN_FIXTURES } from './kanban.fixtures'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Organisms/KanbanColumn',
  component: KanbanColumn,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof KanbanColumn>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    header: KANBAN_FIXTURES.qualified.header,
    children: null,
  },
  render: (args) => (
    <KanbanColumn {...args} className="w-80">
      {KANBAN_FIXTURES.qualified.cards.map((card) => (
        <KanbanCard key={card.title} data={card} />
      ))}
    </KanbanColumn>
  ),
}

export const Dragging: Story = {
  args: { header: KANBAN_FIXTURES.proposal.header, children: null },
  render: (args) => (
    <KanbanColumn {...args} className="w-80">
      <KanbanCard data={KANBAN_FIXTURES.proposal.riskCard} dragging />
      <KanbanGhost />
    </KanbanColumn>
  ),
}

export const InvertedFinal: Story = {
  args: { header: KANBAN_FIXTURES.contractSent.header, children: null },
  render: (args) => (
    <KanbanColumn {...args} inverted className="w-80">
      {KANBAN_FIXTURES.contractSent.cards.map((card) => (
        <KanbanCard key={card.title} data={card} inverted />
      ))}
    </KanbanColumn>
  ),
}

export const WorstCase: Story = {
  args: { header: { stage: 'Negotiation', count: 1, totalCents: 120_000_000_000 }, children: null },
  render: (args) => (
    <KanbanColumn {...args} className="w-80">
      <KanbanCard data={KANBAN_FIXTURES.worstCard} />
    </KanbanColumn>
  ),
}
