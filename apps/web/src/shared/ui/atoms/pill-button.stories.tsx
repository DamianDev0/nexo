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
      options: ['primary', 'ink', 'secondary', 'tertiary', 'ghost', 'icon'],
    },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof PillButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Nuevo negocio' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Nuevo negocio' }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Ink: Story = {
  args: { variant: 'ink', children: 'Registrar actividad' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secundario' },
}

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Terciario' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancelar' },
}

export const Icon: Story = {
  args: { variant: 'icon', children: '+', 'aria-label': 'Agregar' },
}

export const Sizes: Story = {
  args: { children: 'sm' },
  render: () => (
    <div className="flex items-center gap-3">
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
  args: { children: 'Nuevo negocio' },
  render: () => (
    <div className="flex items-center gap-3">
      <PillButton>Nuevo negocio</PillButton>
      <PillButton disabled>Deshabilitado</PillButton>
    </div>
  ),
}

export const WorstCase: Story = {
  args: { children: 'Crear negocio para Barrancabermeja Distribuciones y Suministros S.A.S.' },
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { variant: 'primary', size: 'lg', children: 'Nuevo negocio' },
}
