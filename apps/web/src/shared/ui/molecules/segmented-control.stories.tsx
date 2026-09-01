import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { SegmentedControl } from './segmented-control'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'estandar', label: 'Estándar' },
  { value: 'custom', label: 'Custom' },
]

function ControlledSegmentedControl() {
  const [value, setValue] = useState('todos')
  return (
    <div className="w-72">
      <SegmentedControl value={value} onValueChange={setValue} options={OPTIONS} />
    </div>
  )
}

const meta = {
  title: 'Molecules/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'centered' },
  args: { value: 'todos', onValueChange: fn(), options: OPTIONS },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ControlledSegmentedControl />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('radio', { name: 'Custom' }))
    await expect(canvas.getByRole('radio', { name: 'Custom' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  },
}

export const WorstCase: Story = {
  args: {
    value: 'a',
    options: Array.from({ length: 6 }, (_, index) => ({
      value: `opción-${index}`,
      label: `Opción larguísima ${index}`,
    })).concat([{ value: 'a', label: 'A' }]),
  },
  render: (args) => (
    <div className="w-80">
      <SegmentedControl {...args} />
    </div>
  ),
}
