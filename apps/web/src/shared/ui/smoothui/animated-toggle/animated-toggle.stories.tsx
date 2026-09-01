import { expect, fn, userEvent, within } from 'storybook/test'

import { AnimatedToggle } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'SmoothUI/AnimatedToggle',
  component: AnimatedToggle,
  parameters: { layout: 'centered' },
  args: { label: 'Activar módulo', onChange: fn() },
} satisfies Meta<typeof AnimatedToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultChecked: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch', { name: 'Activar módulo' })
    await userEvent.click(toggle)
    await expect(args.onChange).toHaveBeenCalledWith(true)
  },
}

export const Checked: Story = {
  args: { checked: true },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <AnimatedToggle {...args} size="sm" defaultChecked />
      <AnimatedToggle {...args} size="md" defaultChecked />
      <AnimatedToggle {...args} size="lg" defaultChecked />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, checked: true },
}
