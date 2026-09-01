import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { DatePicker } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function ControlledDatePicker({ initial }: Readonly<{ initial?: string }>) {
  const [value, setValue] = useState<string | undefined>(initial)
  return (
    <div className="w-64">
      <DatePicker
        value={value}
        onChange={setValue}
        placeholder="Elige una fecha"
        aria-label="Fecha"
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered', chromatic: { disableSnapshot: true } },
  args: { value: '2026-08-15', onChange: fn(), 'aria-label': 'Fecha' },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ControlledDatePicker initial="2026-08-15" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Fecha' })
    await expect(trigger).toHaveTextContent('15/08/2026')
    await userEvent.click(trigger)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await body.findByRole('button', { name: '20' }))
    await expect(trigger).toHaveTextContent('20/08/2026')
  },
}

export const Empty: Story = {
  render: () => <ControlledDatePicker />,
}
