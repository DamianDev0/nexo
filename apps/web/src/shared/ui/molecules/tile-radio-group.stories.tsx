import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { TileRadioGroup } from './tile-radio-group'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const PLAN_OPTIONS = [
  { value: 'basico', content: 'Básico' },
  { value: 'pro', content: 'Pro' },
  { value: 'empresa', content: 'Empresa' },
]

function ControlledTileRadioGroup({ initial }: Readonly<{ initial: string | null }>) {
  const [value, setValue] = useState<string | null>(initial)
  return (
    <TileRadioGroup
      value={value}
      onChange={setValue}
      options={PLAN_OPTIONS}
      label="Plan"
      classes={{ group: 'grid-cols-3', tile: 'px-4 py-2.5 text-sm' }}
    />
  )
}

const meta = {
  title: 'Molecules/TileRadioGroup',
  component: TileRadioGroup,
  parameters: { layout: 'centered' },
  args: { value: 'pro', onChange: fn(), options: PLAN_OPTIONS, label: 'Plan' },
} satisfies Meta<typeof TileRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ControlledTileRadioGroup initial="pro" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const basico = canvas.getByRole('radio', { name: 'Básico' })
    await userEvent.click(basico)
    await expect(basico).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('radio', { name: 'Pro' })).toHaveAttribute('aria-checked', 'true')
  },
}

export const Unselected: Story = {
  render: () => <ControlledTileRadioGroup initial={null} />,
}

export const WorstCase: Story = {
  render: () => {
    const options = Array.from({ length: 12 }, (_, index) => ({
      value: `opción-${index}`,
      content: `Opción con un texto larguísimo que desborda el tile número ${index}`,
    }))
    return (
      <div className="w-96">
        <TileRadioGroup
          value="opción-3"
          onChange={() => undefined}
          options={options}
          label="Opciones extremas"
          classes={{ group: 'grid-cols-2', tile: 'px-3 py-2 text-xs' }}
        />
      </div>
    )
  },
}
