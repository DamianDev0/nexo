import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { TimePicker } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const LABELS = {
  trigger: 'Inicio',
  hours: 'Horas',
  minutes: 'Minutos',
  meridiem: 'AM o PM',
}

function ControlledTimePicker({ initial }: Readonly<{ initial: string }>) {
  const [value, setValue] = useState(initial)
  return (
    <div className="w-40 rounded-md border border-input px-2">
      <TimePicker value={value} onChange={setValue} labels={LABELS} />
    </div>
  )
}

const meta = {
  title: 'Molecules/TimePicker',
  component: TimePicker,
  parameters: { layout: 'centered', chromatic: { disableSnapshot: true } },
  args: { value: '09:00', onChange: fn(), labels: LABELS },
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ControlledTimePicker initial="09:00" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Inicio' })
    await expect(trigger).toHaveTextContent('09:00 AM')

    await userEvent.click(trigger)
    const body = within(canvasElement.ownerDocument.body)
    const minutes = await body.findByRole('listbox', { name: 'Minutos' })
    await userEvent.click(within(minutes).getByRole('option', { name: '30' }))

    await expect(trigger).toHaveTextContent('09:30 AM')
  },
}

export const Afternoon: Story = {
  render: () => <ControlledTimePicker initial="14:45" />,
}
