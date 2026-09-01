import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { SearchInput } from './search-input'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function ControlledSearchInput() {
  const [value, setValue] = useState('pipelines')
  return (
    <div className="w-72">
      <SearchInput
        value={value}
        onChange={setValue}
        placeholder="Buscar en ajustes"
        clear={{ onClick: () => setValue(''), label: 'Limpiar búsqueda' }}
        classes={{
          input: 'h-8 border-transparent bg-muted/50 pr-7 text-sm shadow-none',
          icon: 'size-3.5 text-faint',
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/SearchInput',
  component: SearchInput,
  parameters: { layout: 'centered' },
  args: { value: '', onChange: fn(), placeholder: 'Buscar' },
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <SearchInput {...args} />
    </div>
  ),
}

export const WithClear: Story = {
  render: () => <ControlledSearchInput />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Limpiar búsqueda' }))
    await expect(canvas.getByRole('textbox')).toHaveValue('')
  },
}

export const WorstCase: Story = {
  args: {
    value: 'una búsqueda absurdamente larga que no cabe en el campo de ninguna manera razonable',
    placeholder: 'Buscar',
  },
  render: (args) => (
    <div className="w-56">
      <SearchInput {...args} />
    </div>
  ),
}
