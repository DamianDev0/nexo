import { expect, userEvent, within } from 'storybook/test'

import { PillButton } from '@/shared/ui/atoms/pill-button'

import { GroovyPopover } from './index'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Molecules/GroovyPopover',
  component: GroovyPopover,
  parameters: { layout: 'centered', chromatic: { disableSnapshot: true } },
} satisfies Meta<typeof GroovyPopover>

export default meta
type Story = StoryObj<typeof meta>

function DemoPopover({ subtle }: Readonly<{ subtle?: boolean }>) {
  return (
    <GroovyPopover>
      <GroovyPopover.Trigger asChild>
        <PillButton variant="outline" size="sm">
          Abrir menú
        </PillButton>
      </GroovyPopover.Trigger>
      <GroovyPopover.Content subtle={subtle} className="w-48">
        <GroovyPopover.Item content={{ label: 'Nuevo contacto' }} onSelect={() => undefined} />
        <GroovyPopover.Item content={{ label: 'Nueva empresa' }} onSelect={() => undefined} />
        <GroovyPopover.Item content={{ label: 'Nueva actividad' }} active />
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}

export const Default: Story = {
  args: { children: null },
  render: () => <DemoPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Abrir menú' }))
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByText('Nuevo contacto')).toBeVisible()
  },
}

export const Subtle: Story = {
  args: { children: null },
  render: () => <DemoPopover subtle />,
}
