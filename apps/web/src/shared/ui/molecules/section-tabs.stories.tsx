import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { SectionTabs } from './section-tabs'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'contactos', label: 'Contactos' },
  { key: 'pipelines', label: 'Pipelines' },
  { key: 'actividades', label: 'Actividades' },
]

function ControlledSectionTabs() {
  const [active, setActive] = useState('general')
  return <SectionTabs tabs={TABS} active={active} onChange={setActive} />
}

const meta = {
  title: 'Molecules/SectionTabs',
  component: SectionTabs,
  parameters: { layout: 'centered' },
  args: { tabs: TABS, active: 'general', onChange: fn() },
} satisfies Meta<typeof SectionTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ControlledSectionTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Pipelines' }))
    await expect(canvas.getByRole('tab', { name: 'Pipelines' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  },
}

export const WorstCase: Story = {
  args: {
    tabs: Array.from({ length: 9 }, (_, index) => ({
      key: `tab-${index}`,
      label: `Sección con nombre extremadamente largo ${index}`,
    })),
    active: 'tab-2',
  },
  render: (args) => (
    <div className="w-96 overflow-x-auto">
      <SectionTabs {...args} />
    </div>
  ),
}
