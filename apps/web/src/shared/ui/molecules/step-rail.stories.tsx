import { expect, fn, userEvent, within } from 'storybook/test'

import { StepRail } from './step-rail'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const STEPS = [
  { label: 'Empresa', description: 'Datos básicos y sector' },
  { label: 'Apariencia', description: 'Colores y tipografía' },
  { label: 'Pipeline', description: 'Etapas de venta' },
  { label: 'Equipo', description: 'Invita a tu equipo', optional: true },
]

const meta = {
  title: 'Molecules/StepRail',
  component: StepRail,
  parameters: { layout: 'centered' },
  args: {
    steps: STEPS,
    currentStep: 2,
    onStepClick: fn(),
    optionalLabel: 'Opcional',
  },
} satisfies Meta<typeof StepRail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <StepRail {...args} />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: /Apariencia/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
    await userEvent.click(canvas.getByRole('button', { name: /Pipeline/ }))
    await expect(args.onStepClick).toHaveBeenCalledWith(3)
  },
}

export const AllDone: Story = {
  args: { currentStep: 5 },
  render: (args) => (
    <div className="w-72">
      <StepRail {...args} />
    </div>
  ),
}

export const WorstCase: Story = {
  args: {
    steps: Array.from({ length: 9 }, (_, index) => ({
      label: `Paso ${index + 1} con un título kilométrico que no debería existir`,
      description: 'Descripción larguísima que desborda el rail sin piedad alguna',
      optional: index % 2 === 1,
    })),
    currentStep: 4,
  },
  render: (args) => (
    <div className="w-72">
      <StepRail {...args} />
    </div>
  ),
}
