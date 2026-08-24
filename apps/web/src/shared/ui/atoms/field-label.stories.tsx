import { SmoothInput as Input } from '../smoothui/input'

import { FieldLabel } from './field-label'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Atoms/FieldLabel',
  component: FieldLabel,
  parameters: { layout: 'centered' },
  argTypes: {
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof FieldLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Correo electrónico' },
}

export const Required: Story = {
  args: { children: 'Nombre', required: true },
}

export const WithField: Story = {
  args: { children: 'Teléfono' },
  render: (args) => (
    <div className="w-64">
      <FieldLabel htmlFor="phone" {...args} />
      <Input id="phone" placeholder="300 123 4567" className="mt-1.5 h-10 text-sm" />
    </div>
  ),
}
