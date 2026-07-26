import { BadgeInk } from './badge-ink'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Atoms/BadgeInk',
  component: BadgeInk,
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'positive', 'negative', 'warning'],
    },
    indicator: { control: 'inline-radio', options: ['dot', 'spinner', 'check', 'cross'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof BadgeInk>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Sin tocar' },
}

export const Sending: Story = {
  args: { tone: 'info', indicator: 'spinner', children: 'Enviando' },
}

export const Won: Story = {
  args: { tone: 'positive', indicator: 'check', children: 'Ganado' },
}

export const Lost: Story = {
  args: { tone: 'negative', indicator: 'cross', children: 'Perdido' },
}

export const Sizes: Story = {
  args: { children: 'Sin tocar' },
  render: () => (
    <div className="flex items-center gap-4">
      <BadgeInk size="sm">Sin tocar</BadgeInk>
      <BadgeInk size="md" tone="positive" indicator="dot">
        Firma pendiente
      </BadgeInk>
      <BadgeInk size="lg" tone="warning" indicator="dot">
        En revisión
      </BadgeInk>
    </div>
  ),
}

export const WorstCase: Story = {
  args: {
    tone: 'positive',
    indicator: 'check',
    children: 'Contrato marco plurianual firmado y radicado',
  },
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { tone: 'info', indicator: 'spinner', size: 'lg', children: 'Enviando' },
}
