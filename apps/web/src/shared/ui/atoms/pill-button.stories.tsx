import { expect, fn, userEvent, within } from 'storybook/test'

import { PillButton } from './pill-button'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Atoms/PillButton',
  component: PillButton,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: [
        'primary',
        'ink',
        'secondary',
        'tertiary',
        'outline',
        'ghost',
        'ghostDanger',
        'destructive',
        'icon',
      ],
    },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm', 'xs'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof PillButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'New deal' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'New deal' }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Ink: Story = {
  args: { variant: 'ink', children: 'Log activity' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
}

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Tertiary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
}

export const Icon: Story = {
  args: { variant: 'icon', children: '+', 'aria-label': 'Add' },
}

export const Outline: Story = {
  args: { variant: 'outline', size: 'sm', children: 'Ver detalle' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', size: 'sm', children: 'Eliminar' },
}

export const Sizes: Story = {
  args: { children: 'sm' },
  render: () => (
    <div className="flex items-center gap-3">
      <PillButton size="xs" variant="tertiary">
        xs · 32
      </PillButton>
      <PillButton size="sm" variant="tertiary">
        sm · 36
      </PillButton>
      <PillButton size="md" variant="tertiary">
        md · 42
      </PillButton>
      <PillButton size="lg" variant="tertiary">
        lg · 48
      </PillButton>
    </div>
  ),
}

export const States: Story = {
  args: { children: 'New deal' },
  render: () => (
    <div className="flex items-center gap-3">
      <PillButton>New deal</PillButton>
      <PillButton disabled>Disabled</PillButton>
    </div>
  ),
}

export const WorstCase: Story = {
  args: { children: 'Create deal for Barrancabermeja Distribuciones y Suministros S.A.S.' },
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { variant: 'primary', size: 'lg', children: 'New deal' },
}
