import { expect, fn, userEvent, within } from 'storybook/test'

import { SmoothCheckbox } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'SmoothUI/SmoothCheckbox',
  component: SmoothCheckbox,
  parameters: { layout: 'centered' },
  args: { 'aria-label': 'Seleccionar fila', onCheckedChange: fn() },
} satisfies Meta<typeof SmoothCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Seleccionar fila' }))
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
  },
}

export const Checked: Story = {
  args: { checked: true },
}

export const Indeterminate: Story = {
  args: { checked: true, indeterminate: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}
